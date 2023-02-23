import fetch from "node-fetch"
import dotenv from "dotenv"
import {PrismaClient} from "../.prisma/index.js"

dotenv.config()

const prisma = new PrismaClient()

process.on("exit", () => prisma.$disconnect().catch(() => {}))
process.on("beforeExit", () => prisma.$disconnect().catch(() => {}))
process.on("SIGINT", () => prisma.$disconnect().catch(() => {}))

/**
 * @param {string} phoneNumber
 * @returns {{prefix?: string; first: string; second: string; third: string; ext?: string}}
 */
const handlePhoneNumber = (phoneNumber) => {
    // NOTE: this regex is "good enough" (I wrote it) for this dataset, but may fail with other inputs.
    // A better regex can probably be found online.
    const details = phoneNumber.match(
        /^(?<prefix>(\+|0+)1)?[ -]?\(?(?<first>\d{3})\)?[ .-]?(?<second>\d{3})[ .-]?(?<third>\d{4})(x(?<ext>\d+))?$/,
    )

    if (
        !details.groups ||
        !details.groups.first ||
        !details.groups.second ||
        !details.groups.third
    ) {
        throw new Error("Invalid phone number")
    }

    return details.groups
}

const data = await (
    await fetch(
        "https://gist.githubusercontent.com/faizaanmadhani/6bf87ac6d8975b2bd45aba9fd96515ca/raw/795f99b519d6e2c33bb2b89c0707be7f06cff95d/HTN_2023_BE_Challenge_Data.json",
    )
).json() // as {
//     name: string
//     company: string
//     email: string
//     phone: string
//     skills: {skill: string; rating: number}[]
// }[]

for (const user of data) {
    const phoneNumber = handlePhoneNumber(user.phone)

    try {
        const dbUser = await prisma.user.create({
            data: {
                name: user.name,
                company: user.company,
                email: user.email,
                phone: {
                    create: {
                        prefix: phoneNumber.prefix ?? null,
                        main: `${phoneNumber.first}${phoneNumber.second}${phoneNumber.third}`,
                        ext: phoneNumber.ext ?? null,
                    },
                },
            },
        })

        // Create skills with loop (couldn't think of a good way)
        // Perfoamce impract is negligible since each user shouldn't have more than 10 or so skills
        for (const skill of user.skills) {
            await prisma.user.update({
                where: {id: dbUser.id},
                data: {
                    userSkills: {
                        create: {
                            rating: skill.rating,
                            skill: {
                                connectOrCreate: {
                                    where: {
                                        skill: skill.skill,
                                    },
                                    create: {
                                        skill: skill.skill,
                                    },
                                },
                            },
                        },
                    },
                },
            })
        }
    } catch (err) {
        // Duplicate emails should not be allowed
        if (err.message.includes("user_email_key")) {
            console.error(err)
            console.info("This is a duplicate email error, skipping")

            continue
        } else {
            throw err
        }
    }

    console.log(`Created user ${user.name}`)
}

console.log("Done")

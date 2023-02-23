import {builder} from "../builder"
import {prisma} from "../db"
import {type Skill} from "../../.prisma"

// NOTE: this regex is "good enough" (I wrote it) for this dataset, but may fail with other inputs.
// A better regex can probably be found online.
const phoneRegex =
    /^(?<prefix>(\+|0+)1)?[ -]?\(?(?<first>\d{3})\)?[ .-]?(?<second>\d{3})[ .-]?(?<third>\d{4})(x(?<ext>\d+))?$/

const handlePhoneNumber = (phoneNumber: string) => {
    const details = phoneNumber.match(phoneRegex)

    if (
        !details ||
        !details.groups ||
        !details.groups.first ||
        !details.groups.second ||
        !details.groups.third
    ) {
        throw new Error("Invalid phone number")
    }

    return details.groups
}

const skill = builder.prismaObject("Skill", {
    fields: (t) => ({
        id: t.exposeID("id"),
        skill: t.exposeString("skill"),
        frequency: t.field({
            type: "Int",
            resolve: async (parent) =>
                await prisma.userSkill.count({where: {skill: {skill: parent.skill}}}),
        }),
        rating: t.field({
            type: "Int",
            nullable: true,
            args: {
                userId: t.arg.int({required: false}),
            },
            resolve: async (parent, args) =>
                args.userId
                    ? (
                          await prisma.userSkill.findFirst({
                              where: {skillId: parent.id, userId: args.userId},
                              select: {rating: true},
                          })
                      )?.rating
                    : null,
        }),
    }),
})

builder.prismaObject("PhoneNumber", {
    fields: (t) => ({
        id: t.exposeID("id"),
        prefix: t.exposeString("prefix", {nullable: true}),
        main: t.exposeString("main"),
        ext: t.exposeString("ext", {nullable: true}),
    }),
})

builder.prismaObject("User", {
    fields: (t) => ({
        id: t.exposeID("id"),
        name: t.exposeString("name"),
        email: t.exposeString("email"),
        company: t.exposeString("company"),
        // phone: t.relation("phone"), // This doesn't work, why??
        phone: t.field({
            type: "String",
            nullable: true,
            resolve: async (parent) => {
                const phone = await prisma.phoneNumber.findUnique({where: {userId: parent.id}})

                if (phone == null) {
                    return null
                }

                return (
                    (phone.prefix ? `${phone.prefix} ` : "") +
                    `(${phone.main.substring(0, 3)}) ${phone.main.substring(
                        3,
                        6,
                    )}-${phone.main.substring(6)}` +
                    (phone.ext ? `x${phone.ext}` : "")
                )
            },
        }),
        skills: t.field({
            type: [skill],
            resolve: async (parent) => {
                const res = (
                    await prisma.userSkill.findMany({
                        where: {userId: parent.id},
                        select: {rating: true, skill: {select: {id: true, skill: true}}},
                    })
                ).map(({rating, skill}) => ({rating, ...skill}))

                return res
            },
        }),
    }),
})

builder.queryFields((t) => ({
    allUsers: t.prismaField({
        type: ["User"],
        resolve: async (query) => await prisma.user.findMany({...query}),
    }),
    user: t.prismaField({
        type: "User",
        nullable: true,
        args: {
            id: t.arg.int({required: true}),
        },
        resolve: async (query, _parent, args) =>
            await prisma.user.findUnique({where: {id: args.id}, ...query}),
    }),
    phoneNumberByUser: t.prismaField({
        type: "PhoneNumber",
        nullable: true,
        args: {
            id: t.arg.int({required: true}),
        },
        resolve: async (query, _parent, args) =>
            await prisma.phoneNumber.findUnique({where: {userId: args.id}, ...query}),
    }),
    skills: t.prismaField({
        type: ["Skill"],
        args: {
            minFrequency: t.arg.int({required: true}),
            maxFrequency: t.arg.int({required: true}),
        },
        resolve: async (_query, _parent, args) =>
            // Holy shit
            (await prisma.$queryRaw/*sql*/ `
                SELECT skill.id, skill.skill, userSkills.frequency
                FROM skill
                LEFT JOIN (
                    SELECT userSkill.skillId, COUNT(*) AS frequency
                    FROM userSkill
                    GROUP BY userSkill.skillId
                ) AS userSkills
                ON (skill.id = userSkills.skillId)
                -- Do NOT be alarmed, emplate strings are sanitized because of fancy tagged template
                HAVING userSkills.frequency >= ${args.minFrequency} AND userSkills.frequency < ${args.maxFrequency}
                `) as readonly Skill[],
    }),
}))

const userUpdateInput = builder.inputType("UserUpdateInput", {
    fields: (t) => ({
        company: t.string({required: false}),
        email: t.string({required: false}),
        phone: t.string({required: false}),
    }),
})

builder.mutationFields((t) => ({
    updateUser: t.prismaField({
        type: "User",
        args: {
            userId: t.arg.int({required: true}),
            data: t.arg({
                type: userUpdateInput,
                required: true,
            }),
        },
        resolve: async (_query, _parent, {userId, data}) => {
            const phoneNumber =
                data.phone === undefined || data.phone === null
                    ? undefined
                    : handlePhoneNumber(data.phone)

            return prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    company: data.company ?? undefined,
                    email: data.email ?? undefined, // Assume email is well-formed (not in production)
                    phone: phoneNumber
                        ? {
                              update: {
                                  prefix: phoneNumber.prefix ?? null,
                                  main: `${phoneNumber.first}${phoneNumber.second}${phoneNumber.third}`,
                                  ext: phoneNumber.ext ?? null,
                              },
                          }
                        : undefined,
                },
            })
        },
    }),
}))

export const schema = builder.toSchema({})

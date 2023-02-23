import * as yup from "yup"
import {request} from "../utils"
import {userSchema} from "../schemas"

describe("users", () => {
    it("should get all users", async () => {
        const query = /* GraphQL */ `
            query {
                allUsers {
                    name
                    company
                    email
                    phone
                }
            }
        `

        const {body} = await request()
            .get(`/graphql?query=${decodeURIComponent(query)}`)
            .expect(200)

        await yup.array(userSchema.required()).required().validate(body.data.allUsers)
    })

    it("should get one user by ID", async () => {
        const query = /* GraphQL */ `
            query {
                user(id: 1) {
                    name
                    company
                    phone
                    email
                    skills {
                        skill
                        rating(userId: 1)
                        frequency
                    }
                }
            }
        `

        const {body} = await request()
            .get(`/graphql?query=${decodeURIComponent(query)}`)
            .expect(200)

        const user = body.data.user

        await userSchema.required().validate(user)

        await yup
            .object({
                skills: yup
                    .array(
                        yup
                            .object({
                                skill: yup.string().required(),
                                rating: yup.number().required(),
                                frequency: yup.number().required(),
                            })
                            .required(),
                    )
                    .required(),
            })
            .required()
            .validate(user)

        expect(user.name).toBe("Breanna Dillon")
        expect(user.company).toBe("Jackson Ltd")
        expect(user.email).toBe("lorettabrown@example.net")
        expect(user.phone).toBe("+1 (924) 116-7963")
        expect(user.skills[0].skill).toBe("Swift")
        expect(user.skills[0].rating).toBe(4)
        expect(user.skills[0].frequency).toBe(28)
        expect(user.skills[1].skill).toBe("OpenCV")
        expect(user.skills[1].rating).toBe(1)
        expect(user.skills[1].frequency).toBe(33)
    })

    it("should update user", async () => {
        const query = /* GraphQL */ `
            mutation {
                updateUser(
                    userId: 1
                    data: {phone: "+1 (555) 123 4567", company: "DEEZ NUTS LTD"}
                ) {
                    name
                    company
                    phone
                    email
                }
            }
        `

        const {body} = await request().post(`/graphql`).send({query}).expect(200)
        const user = body.data.updateUser

        await userSchema.required().validate(user)

        expect(user.name).toBe("Breanna Dillon")
        expect(user.company).toBe("DEEZ NUTS LTD")
        expect(user.email).toBe("lorettabrown@example.net")
        expect(user.phone).toBe("+1 (555) 123-4567")
    })
})

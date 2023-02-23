import * as yup from "yup"
import {request} from "../utils"
import {userSchema} from "../schemas"

describe("allUsers", () => {
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

        const {
            body: {data},
        } = await request()
            .get(`/graphql?query=${decodeURIComponent(query)}`)
            .expect(200)

        await yup.array(userSchema.required()).required().validate(data.allUsers)
    })

    it("should get one user by ID", async () => {
        const query = /* GraphQL */ `
            query {
                user(id: 1) {
                    name
                    company
                    email
                    phone
                }
            }
        `

        const {
            body: {
                data: {user},
            },
        } = await request()
            .get(`/graphql?query=${decodeURIComponent(query)}`)
            .expect(200)

        await userSchema.required().validate(user)

        expect(user.name).toBe("Breanna Dillon")
        expect(user.company).toBe("Jackson Ltd")
        expect(user.email).toBe("lorettabrown@example.net")
        expect(user.phone).toBe("+1 (924) 116-7963")
    })
})

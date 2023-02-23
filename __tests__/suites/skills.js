import {request} from "../utils"

describe("skills", () => {
    it("should get skills", async () => {
        const query = /* GraphQL */ `
            query {
                skills(minFrequency: 40, maxFrequency: 42) {
                    skill
                    frequency
                }
            }
        `

        const {body} = await request()
            .get(`/graphql?query=${decodeURIComponent(query)}`)
            .expect(200)

        expect(body.data.skills[0].skill).toBe("Foundation")
        expect(body.data.skills[0].frequency).toBe(41)
        expect(body.data.skills[1].skill).toBe("React")
        expect(body.data.skills[1].frequency).toBe(41)
    })
})

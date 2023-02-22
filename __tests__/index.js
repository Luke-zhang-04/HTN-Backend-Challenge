import * as db from "../lib/db"
import {request} from "./utils"
import {server} from "../lib"

describe("Test express server", () => {
    it("should work", async () => {
        const response = await request().get("/graphql").expect(200)

        expect(response.text).toContain("Missing query")
    })

    it("should show the 404 page", async () => {
        const response = await request().get("/notARoute").expect(404)

        expect(response.text).toContain("404")
    })
})

describe("allUsers", () => {
    it("shouldGetAllUsers", async () => {})
})

afterAll(async () => {
    await db.prisma.$disconnect()
    server.close()
})

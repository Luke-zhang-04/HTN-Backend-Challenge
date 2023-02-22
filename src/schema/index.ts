import {builder} from "../builder"
import {prisma} from "../db"

builder.prismaObject("User", {
    fields: (t) => ({
        id: t.exposeID("id"),
        name: t.exposeString("name"),
        email: t.exposeString("email"),
    }),
})

builder.queryFields((t) => ({
    allUsers: t.prismaField({
        type: ["User"],
        resolve: (query) => prisma.user.findMany({...query}),
    }),
}))

export const schema = builder.toSchema()

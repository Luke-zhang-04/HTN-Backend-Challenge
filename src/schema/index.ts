import {builder} from "../builder"
import {prisma} from "../db"

builder.prismaObject("PhoneNumber", {
    fields: (t) => ({
        id: t.exposeID("id"),
        prefix: t.exposeString("prefix", {nullable: true}),
        main: t.exposeString("main"),
        ext: t.exposeString("ext", {nullable: true}),
        user: t.relation("User"),
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
        resolve: async (query, _, args) =>
            await prisma.user.findUnique({where: {id: args.id}, ...query}),
    }),
    phoneNumberByUser: t.prismaField({
        type: "PhoneNumber",
        nullable: true,
        args: {
            id: t.arg.int({required: true}),
        },
        resolve: async (query, _, args) =>
            await prisma.phoneNumber.findUnique({where: {userId: args.id}, ...query}),
    }),
}))

export const schema = builder.toSchema({})

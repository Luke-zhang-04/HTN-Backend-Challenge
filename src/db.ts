import {PrismaClient} from "../.prisma"

export const prisma = new PrismaClient()

export {prisma as db}

process.on("exit", () => prisma.$disconnect().catch(() => {}))
process.on("beforeExit", () => prisma.$disconnect().catch(() => {}))
process.on("SIGINT", () => prisma.$disconnect().catch(() => {}))

export default prisma

import {Status} from "@luke-zhang-04/utils"
import {createHandler} from "graphql-http/lib/use/express"
import dotenv from "dotenv"
import chalk from "chalk"
import compression from "compression"
import cookieParser from "cookie-parser"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import {schema} from "./schema"

dotenv.config()

export const app = express()

app.use(express.json(), helmet(), compression(), cookieParser())

const fillZero = (value: number): string => (value < 10 ? `0${value}` : value.toString())

const getFormattedTime = (): string => {
    const date = new Date()
    const hourThreshold = 12

    return `${date.getHours() % hourThreshold}:${fillZero(date.getMinutes())}:${fillZero(
        date.getSeconds(),
    )} ${date.getHours() >= hourThreshold ? "PM" : "AM"}`
}

app.use(
    morgan((tokens, req, res) => {
        const status = Number(tokens.status?.(req, res))
        const formattedStatus = (() => {
            if (status >= Status.InternalError) {
                return chalk.red(status)
            } else if (status >= Status.BadRequest) {
                return chalk.yellow(status)
            } else if (status >= Status.MultipleChoices) {
                return chalk.white(status)
            } else if (status >= Status.Ok) {
                return chalk.green(status)
            }

            return chalk.cyan(status)
        })()
        const contentLength = tokens.res?.(req, res, "content-length")

        return [
            getFormattedTime(),
            "-",
            chalk.cyan.bold(tokens.method?.(req, res)),
            chalk.green(tokens.url?.(req, res)?.split("?")[0]),
            formattedStatus,
            chalk.blue(tokens["response-time"]?.(req, res)),
            "ms",
            contentLength ? `- ${contentLength}` : contentLength,
        ].join(" ")
    }),
)

app.all("/graphql", createHandler({schema}))

const port =
    process.env.PORT !== undefined && process.env.PORT !== "default"
        ? Number(process.env.PORT)
        : 3333

const server = app.listen(
    {
        port,
    },
    () => {
        console.log(`App listening on port ${port}`)
    },
)

process.on("exit", () => server.close())
process.on("beforeExit", () => server.close())
process.on("SIGINT", () => server.close())

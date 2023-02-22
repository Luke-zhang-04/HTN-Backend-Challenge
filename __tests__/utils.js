import {app} from "../lib"
import supertest from "supertest"

/**
 * Initializes request to Express app
 *
 * @param {any} app - Optional application to pass in. Defaults to imported express app
 * @returns {supertest.SuperTest<supertest.Test>} Supertest http tester
 */
export const request = (_app) => supertest(_app ?? app)

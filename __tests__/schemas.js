import * as yup from "yup"

export const userSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    company: yup.string().required(),
    phone: yup
        .string()
        .matches(/(\+?\d{1,3} )?\(\d{3}\) \d{3}-\d{4}(x\d{0,4})?/u)
        .required(),
})

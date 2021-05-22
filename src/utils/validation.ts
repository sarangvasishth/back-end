import * as Joi from "joi"

export const createGroupSchema = Joi.object({
  name: Joi.string().required(),
  number_of_weeks: Joi.number().required(),
  roll_states: Joi.string().required(),
  incidents: Joi.number().required(),
  ltmt: Joi.string().required(),
  run_at: Joi.date(),
  student_count: Joi.number(),
}).options({ abortEarly: false })

export const updateGroupSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  number_of_weeks: Joi.number().required(),
  roll_states: Joi.string().required(),
  incidents: Joi.number().required(),
  ltmt: Joi.string().required(),
  run_at: Joi.date(),
  student_count: Joi.number(),
}).options({ abortEarly: false })

export const getErrorMeassages = (errors) => {
  const messages = []
  errors.forEach((err) => {
    messages.push(err.message)
  })

  return messages.join(",")
}

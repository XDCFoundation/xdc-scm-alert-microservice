import Utils from '../app/utils'
import * as yup from 'yup'

module.exports = {
  validateAddAlert: async (req, res, next) => {
    const schema = yup.object().shape({
      userId: yup.string().required(),
      type: yup.string().required(),
      target: yup.object().shape({
         type:  yup.string().required(),
         value: yup.string().required(),
         name:  yup.string().required(),
         network:  yup.string().required(),
         threshold : yup.string()
      }),
    })
    await validate(schema, req.body, res, next)
  },
  validateAddDestination: async (req, res, next) => {
    const schema = yup.object().shape({
      userId:  yup.string().required(),
      type: yup.string().required(),
      label: yup.string().required(),
      url:  yup.string().required(),
    })
    await validate(schema, req.body, res, next)
  }
}

const validate = async (schema, reqData, res, next) => {
  try {
    await schema.validate(reqData, { abortEarly: false })
    next()
  } catch (e) {
    const errors = e.inner.map(({ path, message, value }) => ({ path, message, value }))
    Utils.responseForValidation(res, errors)
  }
}

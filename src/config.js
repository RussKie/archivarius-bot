const Joi = require('joi')

const fields = {
  issueLabel: Joi.alternatives().try(Joi.string(), Joi.boolean().only(false))
    .error(() => '"issueLabel" must be a string or false')
    .description('Issue label to use when marking as incomplete bug report'),

  referenceComment: Joi.alternatives().try(Joi.string(), Joi.any().only(false))
    .error(() => '"referenceComment" must be a string or false')
    .description('Comment to post when marking as incomplete bug report')
}

module.exports = Joi.object().keys({
  issueLabel: fields.issueLabel.default('status: incorrectly filled template'),
  referenceComment: fields.referenceComment.default(
    'Please fill in all required information and ping us back to re-open.'
  )
})

const Joi = require('joi')

const fields = {
  issueLabel: Joi.string()
    .error(() => '"issueLabel" must be a string or false')
    .description('Issue label to use when marking as incomplete bug report'),

  searchPatterns: Joi.array().items(Joi.string())
    .error(() => '"searchPatterns" must be an array of regex patterns')
    .description('Regex search patterns that identify a bug report as incomplete'),

  referenceComment: Joi.string()
    .error(() => '"referenceComment" must be a string or false')
    .description('Comment to post when marking as incomplete bug report')
}

module.exports = Joi.object().keys({
  issueLabel: fields.issueLabel.default('status: incorrectly filled template'),
  searchPatterns: fields.searchPatterns.default(['The sections below must be filled in and this text must be removed or the issue will be closed.']),
  referenceComment: fields.referenceComment.default(
    'Please fill in all required information and ping us back to re-open.'
  )
})

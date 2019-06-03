const mustache = require('mustache')
const schema = require('./config')

const CONFIG_NAME = 'archivarius.yml'

/**
 * Checks the body of the issue for specified markers and, if any of them present,
 * or the body itself is absent, marks the issue as incomplete
 *
 * @param   {string}    body
 * @param   {string[]}  searchPatterns
 * @return  {bool}
 */
function checkIncomplete (body, searchPatterns) {
  if (!body || !body.trim()) {
    return true
  }

  var bodyWithoutComments = body.replace(new RegExp(/<!--(.|\r|\n)*?-->/gmu), '')

  var result = searchPatterns.find(pattern => {
    var regex = RegExp(pattern)
    return regex.test(bodyWithoutComments)
  })
  return !!result
}

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} robot
 */
module.exports = robot => {
  // Your code here
  robot.log('Yay, the app was loaded!')

  robot.on([
    'issues.opened',
    'issues.edited'
  ], async context => {
    const { number, body, labels, state, locked } = context.payload.issue
    const { error, value } = schema.validate(await context.config(CONFIG_NAME))

    if (error) {
      robot.log.fatal(error, 'Invalid config')
      return
    }

    if (state === 'closed' || locked === true) {
      robot.log('The issue is closed/locked, ignore')
      return
    }

    try {
      if (labels) {
        var existing = labels.find(issue => issue.name === value.issueLabel)
        if (existing) {
          // the issue is already marked as incorrectly filled
          robot.log('The issue is already marked, ignore')
          return
        }
      }

      var incomplete = checkIncomplete(body, value.searchPatterns)
      if (incomplete) {
        await markAsIncompleteAndClose()
      }
    } catch (error) {
      robot.log.fatal(error, 'Something went wrong!')
    }

    /**
     * Marks an issue as incompletely filled with a corresponding label and adds a comment.
     *
     * @return  {Promise}
     */
    async function markAsIncompleteAndClose () {
      const addLabel = context.github.issues.addLabels(context.issue({
        labels: [value.issueLabel]
      }))

      const createComment = context.github.issues.createComment(context.issue({
        body: mustache.render(value.referenceComment)
      }))

      const closeIssue = context.github.issues.update(context.issue({
        issue_number: number,
        state: 'closed'
      }))

      try {
        await Promise.all([addLabel, createComment, closeIssue])
      } catch (error) {
        robot.log.fatal(error, 'Could not mark as incomplete bug report!')
      }
    }
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}

module.exports.checkIncomplete = checkIncomplete

const checkIncomplete = require('../src/index').checkIncomplete

describe('Incomplete body', () => {
  test.each([
    ['', [], true],
    ['\t', [], true],
    ['   \n    ', [], true],
    ['    ', [], true],
    ['aa', [], false],
    ['aa\nevil line\n\ncc aa', [/evil line/gmu], true],
    ['aa', [/The sections below must be filled in and this text must be removed or the issue will be closed./gmu, /(## Steps to reproduce)(\\s|\\r\\n)*?(## Error Details)/gmu], false],
    ['aa\nevil line\n\n:warning The sections below must be filled in and this text must be removed or the issue will be closed. cc aa\r\n', [/The sections below must be filled in and this text must be removed or the issue will be closed./gmu, /(## Steps to reproduce)(\\s|\\r\\n)*?(## Error Details)/gmu], true],
    [`<!--
    :warning: Review existing issues to see whether someone else has already reported your issue.
-->

## Current behaviour

<!-- Be as specific and detailed as possible to help us
 identify your issue. 
-->


## Expected behaviour


## Steps to reproduce

<!-- Take some time to try and reproduce the issue, then explain how to do so here. -->


## Error Details`, [/The sections below must be filled in and this text must be removed or the issue will be closed./gmu, /(## Steps to reproduce)(\s|\r\n)*?(## Error Details)/gmu], true]
  ])('%#. body: %s, patterns: %s',
    (body, patterns, expected) => {
      expect(checkIncomplete(body, patterns)).toBe(expected)
    })
})

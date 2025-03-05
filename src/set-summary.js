import * as core from '@actions/core'
import Handlebars from 'handlebars'

const template = `

# Release Information

This is the summary of the semantic-release-action.

{{#if release.published}}
🎉 A new release has been published!
{{else}}
⚠️ No new release has been published.
{{/if}}

## New Release

{{#if release.new}}
  {{#if release.published}}
| Version                 | Type                 | Tag                    | Git Head                |
| ----------------------- | -------------------- | ---------------------- | ----------------------- |
| {{release.new.version}} | \` {{release.new.type}} \` | {{release.new.gitTag}} | \`{{release.new.gitHead}}\` |

### Notes
<details><summary>Notes</summary>{{release.new.notes}}</details>

  {{else}}
    No new release published.
  {{/if}}
{{/if}}

## Previous Release

{{#if release.last}}
| Version                 | Type                 | Tag                    | Git Head                |
| ----------------------- | -------------------- | ---------------------- | ----------------------- |
| {{release.last.version}} | \`{{default (release.last.type) "none"}} \` | {{release.last.gitTag}} | \`{{release.last.gitHead}} \`|
{{else}}
No previous release found.
{{/if}}
`

const getTemplate = (data) => {
  const compiledTemplate = Handlebars.compile(template)
  return compiledTemplate(data)
}

Handlebars.registerHelper('default', function (value, defaultValue) {
  return value != null && value !== '' ? value : defaultValue
})

/**
 * Sets the summary of the action.
 *
 * @param {Object} release - The release information.
 * @returns {Promise<void>} Resolves when the summary has been set.
 */
export const setSummary = async (release) => {
  const data = getTemplate({ release })
  core.info(JSON.stringify(release, null, 2))
  core.summary.addRaw(data, true)
  core.summary.addEOL()
  core.summary.addHeading('Raw Data', 2)
  core.summary.addCodeBlock(JSON.stringify(release, null, 2), 'json')
  await core.summary.write({ overwrite: true })
}

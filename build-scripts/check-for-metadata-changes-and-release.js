// Pulls the latest metadata from Google's repo, and, if it has changed,
// pushes the changes in the main branch and releases a new version on `npm`.

import fs from 'fs'
import gmailSend from 'gmail-send'

import update_metadata_from_google_metadata from './helpers/update-metadata-from-google-metadata.js'
import commit from './helpers/commit.js'
import exec from './helpers/exec.js'

const googleMetadataFilePath = process.argv[2]
const metadataInfoFilePath = process.argv[3]

if (update_metadata_from_google_metadata(googleMetadataFilePath, metadataInfoFilePath))
{
	commit()

	console.log()
	console.log('========================================')
	console.log('=  Push the changes to the repository  =')
	console.log('========================================')
	console.log()

	console.log(exec('git push'))

	console.log()
	console.log('========================================')
	console.log('=        Increment the version         =')
	console.log('========================================')
	console.log()

	console.log(exec('npm version patch'))
	console.log(exec('git push'))

	console.log()
	console.log('========================================')
	console.log('=       Publish the new version        =')
	console.log('========================================')
	console.log()

	// `npm` requires "two-factor authentication", so running an `npm publish`
	// command programmatically won't work without human intervention.
	//
	// To work around that, one could optionally specify GMail credentials.
	// In that case, instead of attempting to run `npm publish` command,
	// it will send an email notification to do that manually.
	//
	const emailSettings = getEmailSettings()
	if (emailSettings) {
		// Send an email notification about manually publishing the new version of the package to `npm`.
		gmailSend({
			user: emailSettings.email,
			pass: emailSettings.accessToken,
			to: emailSettings.email,
			subject: '[libphonenumber-js] Publish a new version',
			text: 'A new version of `libphonenumber-js` has been pushed to the repository:\nhttps://gitlab.com/catamphetamine/libphonenumber-js/-/commits/master\n\nRun `npm publish` in `libphonenumber-js` directory to publish the new version.',
			// html: '<b>html text</b>' // alternative to specifying `text`, one could specify `html`.
		})()

		console.log()
		console.log('==========================================================')
		console.log('= Email notification sent. Publish the package manually. =')
		console.log('==========================================================')
		console.log()
	} else {
		console.log(exec('npm publish'))

		console.log()
		console.log('========================================')
		console.log('=               Published              =')
		console.log('========================================')
		console.log()
	}
}

// Reads email settings from a JSON file just outside of `libphonenumber-js` repo folder.
function getEmailSettings() {
	const emailSettingsPath = '../libphonenumber-js-autoupdate-email-notification-settings.json'
	if (fs.existsSync(emailSettingsPath)) {
		const emailSettings = JSON.parse(fs.readFileSync(emailSettingsPath, 'utf-8'))
		// Validate `emailSettings`.
		if (!emailSettings.email) {
			throw new Error('`email` parameter not specified in the email config file')
		}
		// The instructions on how to obtain an `accessToken` are described in `gmail-send` readme:
		// https://www.npmjs.com/package/gmail-send
		if (!emailSettings.accessToken) {
			throw new Error('`accessToken` parameter not specified in the email config file')
		}
		return emailSettings;
	}
}
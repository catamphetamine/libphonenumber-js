// Pulls the latest metadata from Google's repo, and, if it has changed,
// pushes the changes in the main branch and releases a new version on `npm`.

import updateMetadataFromGoogleMetadata from './helpers/updateMetadataFromGoogleMetadata.js'
import commit from './helpers/commit.js'
import exec from './helpers/exec.js'
import sendEmail from './helpers/sendEmail.js'

const googleMetadataFilePath = process.argv[2]
const metadataInfoFilePath = process.argv[3]

const metadataChanged = updateMetadataFromGoogleMetadata(googleMetadataFilePath, metadataInfoFilePath)

if (metadataChanged) {
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
	if (await sendEmail({
		// Send an email notification about manually publishing the new version of the package to `npm`.
		subject: '[libphonenumber-js] Publish a new version',
		text: 'A new version of `libphonenumber-js` has been pushed to the repository:\nhttps://gitlab.com/catamphetamine/libphonenumber-js/-/commits/master\n\nRun `npm publish` in `libphonenumber-js` directory to publish the new version.'
	})) {
		console.log()
		console.log('==========================================================')
		console.log('= Email notification sent. Publish the package manually. =')
		console.log('==========================================================')
		console.log()
	} else {
		// Attempt to publish the `npm` package.
		console.log(exec('npm publish'))

		console.log()
		console.log('========================================')
		console.log('=               Published              =')
		console.log('========================================')
		console.log()
	}
}
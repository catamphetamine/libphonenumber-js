// Pulls the latest metadata from Google's repo, and, if it has changed,
// pushes the changes in the main branch and releases a new version on `npm`.

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
	console.log('=           Pushing changes            =')
	console.log('========================================')
	console.log()

	console.log(exec('git push'))

	console.log()
	console.log('========================================')
	console.log('=           Pushed. Releasing.         =')
	console.log('========================================')
	console.log()

	console.log(exec('npm version patch'))
	console.log(exec('git push'))

	// `npm` requires "two-factor authentication", so programmatic `npm publish`
	// won't work without human intervention.
	console.log(exec('npm publish'))
	console.log(exec('git push'))

	console.log()
	console.log('========================================')
	console.log('=                Released              =')
	console.log('========================================')
	console.log()
}
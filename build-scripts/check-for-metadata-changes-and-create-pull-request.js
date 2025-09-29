// (deprecated because unused)

// * Creates a pull request in the github repository from a local "metadata-update" branch.
// * Deletes the "metadata-update" branch.

// In order for this script to work:
//
// * Install `hub` command line tool: https://hub.github.com/
// * Create a "Personal Access Token" in GitHub account settings (just "repo_public" would be enough)
// * Tell `hub` to use the token for creating GitHub pull requests: `echo "---\ngithub.com:\n- protocol: https\n  user: GITHUB_USERNAME\n  oauth_token: TOKEN" >> ~/.config/hub`

import updateMetadataFromGoogleMetadata from './helpers/updateMetadataFromGoogleMetadata.js'
import commit from './helpers/commit.js'
import exec from './helpers/exec.js'

const googleMetadataFilePath = process.argv[2]
const metadataInfoFilePath = process.argv[3]

// This script is meant to be run from a local "update-metadata" branch.
// See `createMetadataUpdateBranch()` function for how it could be set up.
throw new Error('Run `createMetadataUpdateBranch()` function first')

const metadataChanged = updateMetadataFromGoogleMetadata(googleMetadataFilePath, metadataInfoFilePath)

if (metadataChanged) {
	commit()

	console.log()
	console.log('========================================')
	console.log('=           Pushing changes            =')
	console.log('========================================')
	console.log()

	// Delete pre-existing remote `update-metadata` remote branch
	// (if it already exists)
	if (exec('git ls-remote --heads origin update-metadata'))
	{
		console.log(exec('git push origin update-metadata --delete'))
	}

	// Push the local `update-metadata` branch to GitHub
	console.log(exec('git push origin update-metadata'))

	console.log()
	console.log('========================================')
	console.log('=    Pushed. Creating Pull Request.    =')
	console.log('========================================')
	console.log()

	console.log(exec('hub pull-request -m "Updated metadata" -b catamphetamine/libphonenumber-js:master -h update-metadata'))

	console.log()
	console.log('========================================')
	console.log('=         Pull Request created         =')
	console.log('========================================')
	console.log()

	console.log(exec('git checkout master'))
	console.log(exec('git branch -D update-metadata'))
}

// This function creates "update-metadata" branch and switches into it.
function createMetadataUpdateBranch() {
	let metadata_branch_exists = false

	try
	{
		exec('git rev-parse --verify update-metadata')
		metadata_branch_exists = true
	}
	catch (error)
	{
		if (error.message.indexOf('fatal: Needed a single revision') === -1)
		{
			throw error
		}
	}

	if (metadata_branch_exists)
	{
		console.log(exec('git checkout master'))
		console.log(exec('git branch -D update-metadata'))
	}

	console.log(exec('git pull'))
	console.log(exec('git branch update-metadata origin/master'))
	console.log(exec('git checkout update-metadata'))
}
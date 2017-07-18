// In order for this script to work:
//
// * Install `hub`: `brew install hub`
// * Create a "Personal Access Token" in GitHub account settings (just "repo_public" would be enough)
// * Tell `hub` to use the token for creating GitHub pull requests: `echo "---\ngithub.com:\n- protocol: https\n  user: GITHUB_USERNAME\n  oauth_token: TOKEN" >> ~/.config/hub`

var child_process = require('child_process')

function exec(command)
{
	return child_process.execSync(command).toString().trim()
}

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

// If no `update-metadata` branch exists
// then it simply means that metadata hasn't changed.
if (!metadata_branch_exists)
{
	process.exit(0)
}

console.log(exec('hub pull-request -m "Phone number medatada update" -b catamphetamine/libphonenumber-js:master -h update-metadata'))

console.log()
console.log('========================================')
console.log('=         Pull Request created         =')
console.log('========================================')
console.log()
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

if (!metadata_branch_exists)
{
	process.exit(0)
}

console.log(exec('hub pull-request -m "Phone number medatada update" -b halt-hammerzeit/libphonenumber-js:master -h update-metadata'))
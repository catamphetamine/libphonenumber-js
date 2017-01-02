var child_process = require('child_process')

function exec(command)
{
	return child_process.execSync(command).toString().trim()
}

// Keep the branch for a possible pull request later (e.g. via `hub` command)
// console.log(exec('git checkout master'))
// console.log(exec('git branch -D update-metadata'))

console.log(exec('git checkout master'))
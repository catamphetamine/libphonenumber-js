var child_process = require('child_process')

function exec(command)
{
	return child_process.execSync(command).toString().trim()
}

var metadata_changed = exec('git ls-files --modified PhoneNumberMetadata.xml')

if (!metadata_changed)
{
	console.log()
	console.log('========================================')
	console.log('=   Metadata is up-to-date. Exiting.   =')
	console.log('========================================')
	console.log()

	// The absense of the `update-metadata` branch will tell the script
	// that the metadata is up-to-date and doesn't need updating
	console.log(exec('git checkout master'))
	console.log(exec('git branch -D update-metadata'))
	process.exit(0)
}

console.log()
console.log('========================================')
console.log('= Metadata has changed, updating files =')
console.log('========================================')
console.log()

console.log(exec('npm run metadata:generate'))

console.log()
console.log('========================================')
console.log('=             Running tests            =')
console.log('========================================')
console.log()

console.log('* Actually not running tests because if they fail then it won\'t be reported in any way, and if instead tests fail for the Pull Request on github then the repo owner will be notified by Travis CI about that.')
// console.log(exec('npm test'))

var modified_files = exec('git ls-files --modified').split(/\s/)

var unexpected_modified_files = modified_files.filter(function(file)
{
	return file !== 'PhoneNumberMetadata.xml' && !/^metadata\.[a-z]+\.json$/.test(file)
})

if (unexpected_modified_files.length > 0)
{
	console.log()
	console.log('========================================')
	console.log('=                 Error                =')
	console.log('========================================')
	console.log()
	console.log('Only `PhoneNumberMetadata.xml` and `metadata.*.json` files should be modified. Unexpected modified files:')
	console.log()
	console.log(unexpected_modified_files.join('\n'))

	process.exit(1)
}

// Doesn't work
//
// // http://stackoverflow.com/questions/33610682/git-list-of-staged-files
// var staged_files = exec('git diff --name-only --cached').split(/\s/)
//
// if (staged_files.length > 0)
// {
// 	console.log()
// 	console.log('========================================')
// 	console.log('=                 Error                =')
// 	console.log('========================================')
// 	console.log()
// 	console.log('There are some staged files already. Aborting metadata update process.')
// 	console.log()
// 	console.log(staged_files.join('\n'))
//
// 	process.exit(1)
// }

console.log()
console.log('========================================')
console.log('=          Committing changes          =')
console.log('========================================')
console.log()

console.log(exec('git add .'))

console.log(exec('git commit -m "Phone number medatada update"'))

// Delete previous `update-metadata` remote branch
// (if it already exists)
if (exec('git ls-remote --heads origin update-metadata'))
{
	console.log(exec('git push origin update-metadata --delete'))
}

// Push the local `update-metadata` branch to GitHub
console.log(exec('git push origin update-metadata'))

console.log()
console.log('========================================')
console.log('=               Finished               =')
console.log('========================================')
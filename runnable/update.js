var child_process = require('child_process')

function exec(command)
{
	return child_process.execSync(command).toString().trim()
}

var metadata_changed = exec('git ls-files -m PhoneNumberMetadata.xml')

if (metadata_changed)
{
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

	console.log(exec('npm test'))

	console.log()
	console.log('========================================')
	console.log('=          Committing changes          =')
	console.log('========================================')
	console.log()

	console.log(exec('git add PhoneNumberMetadata.xml metadata.min.json'))
	console.log(exec('git commit -m "Phone number medatada update"'))
}
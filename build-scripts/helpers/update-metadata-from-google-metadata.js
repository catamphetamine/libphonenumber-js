import fs from 'fs'
import semver from 'semver'

import exec from './exec.js'

// Checks if Google's metadata XML file has changes, and, if it has,
// generates JSON metadata files from it, runs the tests and updates `CHANGELOG.md`.
export default function(googleMetadataFilePath, metadataInfoFilePath)
{
	let metadata_changed = exec(`git ls-files --modified ${googleMetadataFilePath}`)

	if (!metadata_changed)
	{
		console.log()
		console.log('========================================')
		console.log('=   Metadata is up-to-date. Exiting.   =')
		console.log('========================================')
		console.log()

		return
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

	// console.log('* Actually not running tests because if they fail then it won\'t be reported in any way, and if instead tests fail for the Pull Request on github then the repo owner will be notified by Travis CI about that.')
	console.log(exec('npm run build'))
	console.log(exec('npm test'))

	let modified_files = exec('git ls-files --modified').split(/\s/)

	let unexpected_modified_files = modified_files.filter(function(file)
	{
		return file !== googleMetadataFilePath &&
			!/^metadata\.[a-z]+\.json$/.test(file) &&
			!/^examples\.[a-z]+\.json$/.test(file)
	})

	// Turned off this "modified files" check
	// because on Windows random files constantly got "modified"
	// without actually being modified.
	// (perhaps something related to line endings)
	if (false && unexpected_modified_files.length > 0)
	{
		let error

		error += 'Only `' + googleMetadataFilePath + '`, `metadata.*.json` and `examples.*.json` files should be modified. Unexpected modified files:'
		error += '\n'
		error += '\n'
		error += unexpected_modified_files.join('\n')

		console.log()
		console.log('========================================')
		console.log('=                 Error                =')
		console.log('========================================')
		console.log()
		console.log(error)

		throw new Error(error)
	}

	// Doesn't work
	//
	// // http://stackoverflow.com/questions/33610682/git-list-of-staged-files
	// let staged_files = exec('git diff --name-only --cached').split(/\s/)
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

	// Add an entry in `CHANGELOG.md`.
	addMetadataUpdateChangelogEntry(metadataInfoFilePath)

	return true
}

function addMetadataUpdateChangelogEntry(metadataInfoFilePath) {
	const {
		version: metadataVersion,
		changes: metadataChanges
	} = JSON.parse(fs.readFileSync(metadataInfoFilePath, 'utf8'))

	const packageVersion = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version
	const nextPackageVersion = semver.inc(packageVersion, 'patch')

	const now = new Date()

	let changesLog = ''
	changesLog += `${nextPackageVersion} / ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`
	changesLog += '\n'
	changesLog += '==================='
	changesLog += '\n'
	changesLog += '\n'
	changesLog += `* Updated metadata to version ${metadataVersion}`
	if (metadataChanges.length > 0) {
		changesLog += ':'
		changesLog += '\n'
		changesLog += metadataChanges.map(change => `  - ${change.replace(/\n/g, '\n' + '    ')}`).join('\n')
	}

	const changelog = fs.readFileSync('./CHANGELOG.md', 'utf8')

	const changesLogStartMarker = '<!-- CHANGELOG START -->'
	const changesLogStartMarkerStartsAt = changelog.indexOf(changesLogStartMarker)
	if (changesLogStartMarkerStartsAt < 0) {
		throw new Error('Changelog start marker not found in CHANGELOG.md')
	}
	const changesLogStartsAt = changesLogStartMarkerStartsAt + changesLogStartMarker.length
	const changelogPre = changelog.slice(0, changesLogStartsAt)
	const previousChangesLog = changelog.slice(changesLogStartsAt).trim()

	fs.writeFileSync('./CHANGELOG.md', changelogPre + '\n\n' + changesLog + '\n\n' + previousChangesLog)
}
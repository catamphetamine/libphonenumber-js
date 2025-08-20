import fs from 'fs'
import { download } from 'libphonenumber-metadata-generator'

const outputPath = process.argv[2]

download().then(({ version, changes, xml }) => {
	// Print the metadata version and a list of changes.
	console.log('========================================')
	console.log(`= Metadata / ${version}`)
	console.log('=')
	const consoleOutputPrefix = '= '
	console.log(`= Changes:\n${changes.map(_ => consoleOutputPrefix + '* ' + _.replace(/\n/g, '\n' + consoleOutputPrefix + '  ')).join('\n')}`)
	console.log('========================================')
	// Write metadata changes info.
	fs.writeFileSync('./metadata-update.json', JSON.stringify({ version, changes }, null, 2))
	// Write the latest metadata XML to `PhoneNumberMetadata.xml` file.
	fs.writeFileSync(outputPath, xml)
}).catch((error) => {
	console.error(error)
	process.exit(1)
})
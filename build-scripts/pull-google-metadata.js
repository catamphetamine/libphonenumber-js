import fs from 'fs'
import { download } from 'libphonenumber-metadata-generator'

const metadataFileOutputPath = process.argv[2]
const infoFileOutputPath = process.argv[3]

// Pulls the latest released metadata from Google's repostory.
// Updates `PhoneNumberMetadata.xml` and `metadata-info.json` files.
download().then(({ date, version, changes, xml }) => {
	// Print the metadata version and a list of changes.
	console.log('========================================')
	console.log(`= Metadata / ${version}`)
	console.log('=')
	console.log(`= Date: ${date.toUTCString()
		.slice(0, date.toUTCString().indexOf('00:00:00') - 1)
		.slice(date.toUTCString().indexOf(',') + ', '.length)
	}`)
	console.log('=')
	const consoleOutputPrefix = '= '
	console.log(`= Changes:\n${changes.map(_ => consoleOutputPrefix + '* ' + _.replace(/\n/g, '\n' + consoleOutputPrefix + '  ')).join('\n')}`)
	console.log('========================================')
	// Write metadata changes info.
	fs.writeFileSync(infoFileOutputPath, JSON.stringify({ date, version, changes }, null, 2))
	// Write the latest metadata XML to `PhoneNumberMetadata.xml` file.
	fs.writeFileSync(metadataFileOutputPath, xml)
}).catch((error) => {
	console.error(error)
	process.exit(1)
})
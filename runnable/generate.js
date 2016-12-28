import generate from '../source/tools/generate'
import compress from '../source/tools/compress'

import path from 'path'
import fs   from 'fs'

const input = fs.readFileSync(path.join(__dirname, process.argv[2]), 'utf8')

// Included countries
let included_countries
if (process.argv[3])
{
	included_countries = process.argv[3].split(',')
	console.log('Included countries:', included_countries)
	included_countries = new Set(included_countries)
}

// Include all regular expressions
let extended = false
if (process.argv[4] === 'extended')
{
	console.log('Include extra validation regular expressions')
	extended = true
}

// Generate and compress metadata
generate(input, included_countries, extended).then((output) =>
{
	// Write uncompressed metadata into a file for easier debugging
	fs.writeFileSync(path.join(__dirname, '../metadata.json'), JSON.stringify(output, undefined, 3))

	// Compress the generated metadata
	fs.writeFileSync(path.join(__dirname, '../metadata.min.json'), JSON.stringify(compress(output)))
})
import generate from '../source/tools/generate'
import compress from '../source/tools/compress'

import minimist from 'minimist'
import path from 'path'
import fs   from 'fs'

const input = fs.readFileSync(path.join(__dirname, process.argv[2]), 'utf8')
const output_file = process.argv[3]

const command_line_arguments = minimist(process.argv.slice(4))

// Included countries
let included_countries
if (command_line_arguments.countries)
{
	included_countries = command_line_arguments.countries.split(',')
	console.log('Included countries:', included_countries)
	included_countries = new Set(included_countries)
}

// Include all regular expressions
let extended = false
if (command_line_arguments.extended)
{
	console.log('Include extra validation regular expressions')
	extended = true
}

// Included phone number types
let included_phone_number_types
if (command_line_arguments.types)
{
	included_phone_number_types = command_line_arguments.types.split(',')
	console.log('Included phone number types:', included_phone_number_types)
	included_phone_number_types = new Set(included_phone_number_types)
}

// Generate and compress metadata
generate(input, included_countries, extended, included_phone_number_types).then((output) =>
{
	// Write uncompressed metadata into a file for easier debugging
	if (command_line_arguments.debug)
	{
		console.log('Output uncompressed JSON for debugging')
		fs.writeFileSync(path.join(__dirname, '../metadata.json'), JSON.stringify(output, undefined, 3))
	}

	// Compress the generated metadata
	fs.writeFileSync(path.join(__dirname, output_file), JSON.stringify(compress(output)))
})
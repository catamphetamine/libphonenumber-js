// Generates JSON metadata from Google's `PhoneNumberMetadata.xml` file.

import minimist from 'minimist'
import fs from 'fs'

import { version, generate, compress } from 'libphonenumber-metadata-generator'

// const REGION_CODE_FOR_NON_GEO_ENTITY = '001'

const input_file = process.argv[2]
const output_file = process.argv[3]

const input = fs.readFileSync(input_file, 'utf8')

const command_line_arguments = minimist(process.argv.slice(4))

// Included countries
let included_countries
if (command_line_arguments.countries) {
	included_countries = command_line_arguments.countries.split(',')
	console.log('Included countries:', included_countries)
	included_countries = new Set(included_countries)
}

// Include all regular expressions
let extended = false
if (command_line_arguments.extended) {
	console.log('Include extra validation regular expressions')
	extended = true
}

// Included phone number types
let included_phone_number_types
if (command_line_arguments.types) {
	included_phone_number_types = command_line_arguments.types.split(',')
	console.log('Included phone number types:', included_phone_number_types)
	included_phone_number_types = new Set(included_phone_number_types)
}

// Generate and compress metadata
generate(input, version, included_countries, extended, included_phone_number_types).then((output) => {
	// Write uncompressed metadata into a file for easier debugging
	if (command_line_arguments.debug) {
		console.log('Output uncompressed JSON for debugging')
		fs.writeFileSync('./metadata.json', JSON.stringify(output, undefined, 3))
	}

	// Compress the generated metadata
	fs.writeFileSync(output_file, JSON.stringify(compress(output)))

	// Output mobile phone number type examples
	if (command_line_arguments.examples === 'mobile') {
		var examples = Object.keys(output.countries).reduce(function(out, country_code) {
			// if (country_code === REGION_CODE_FOR_NON_GEO_ENTITY) {
			// 	return out
			// }
			var mobile = output.countries[country_code].examples.mobile
			var fixed_line = output.countries[country_code].examples.fixed_line
			if (mobile) {
				out[country_code] = mobile
			}
			// "TA" country doesn't have any mobile phone number example
			else if (fixed_line) {
				console.warn(`Country ${country_code} doesn't have a mobile phone number example. Substituting with a fixed line phone number example.`)
				out[country_code] = fixed_line
			} else {
				console.error(`Country ${country_code} doesn't have neither a mobile phone number example nor a fixed line phone number example.`)
				// `async` errors aren't being caught at the top level in Node.js
				process.exit(1)
			}
			return out
		}, {})
		fs.writeFileSync('./examples.mobile.json', JSON.stringify(examples))
	}
})
// Generates JSON metadata from Google's `PhoneNumberMetadata.xml` file.

import minimist from 'minimist'
import fs from 'fs'

import { generate, minify } from 'libphonenumber-metadata-generator'

// const REGION_CODE_FOR_NON_GEO_ENTITY = '001'

const input_file_path = process.argv[2]
const output_file_path = process.argv[3]

const metadata_xml = fs.readFileSync(input_file_path, 'utf8')

const command_line_arguments = minimist(process.argv.slice(4))

// Whether it should output non-minified metadata or not
var non_minified = false
if (command_line_arguments['non-minified']) {
	console.log('Output non-minified metadata')
	non_minified = true
}

// Included countries
var included_countries
if (command_line_arguments.countries) {
	included_countries = command_line_arguments.countries.split(',')
	console.log('Included countries:', included_countries)
}

// Whether it should include the regular expressions for phone number types or not
var with_phone_number_types = false
if (command_line_arguments['with-phone-number-types']) {
	console.log('Include regular expressions for phone number types')
	with_phone_number_types = true
	if (!non_minified && !command_line_arguments['phone-number-types']) {
		console.warn('Phone number type examples will be removed at the minification stage')
	}
}

// Included phone number types
var included_phone_number_types
if (command_line_arguments['phone-number-types']) {
	if (!with_phone_number_types) {
		throw new Error('`--phone-number-types` argument requires `--with-phone-number-types` argument')
	}
	included_phone_number_types = command_line_arguments['phone-number-types'].split(',')
	console.log('Included phone number types:', included_phone_number_types)
}

// Whether it should include example phone numbers
var with_phone_number_type_examples = false
if (command_line_arguments['with-phone-number-type-examples']) {
	with_phone_number_type_examples = true
	console.log('Include phone number type examples')
}

// Included phone number type examples
var included_phone_number_type_examples
if (command_line_arguments['phone-number-type-examples']) {
	if (!with_phone_number_type_examples) {
		throw new Error('`--phone-number-type-examples` argument requires `--with-phone-number-type-examples` argument')
	}
	included_phone_number_type_examples = command_line_arguments['phone-number-type-examples'].split(',')
	console.log('Included phone number type examples:', included_phone_number_type_examples)
}

// Generate and minify metadata
generate(metadata_xml, {
	countries: included_countries,
	withPhoneNumberTypes: with_phone_number_types,
	phoneNumberTypes: included_phone_number_types,
	withPhoneNumberTypeExamples: with_phone_number_type_examples
}).then((metadataJson) => {
	if (included_phone_number_type_examples) {
		if (included_phone_number_type_examples.length === 1 && included_phone_number_type_examples[0] === 'mobile') {
			// Output mobile phone number type examples
			fs.writeFileSync(output_file_path, JSON.stringify(getMobilePhoneNumberExamples(metadataJson)))
		} else {
			throw new Error('`--phone-number-type-examples` argument currently only supports "mobile" value')
		}
	} else {
		// Output the metadata into a file
		fs.writeFileSync(output_file_path,
			non_minified
				? JSON.stringify(metadataJson, undefined, 2)
				: JSON.stringify(minify(metadataJson))
		)
	}
}).catch(function(error) {
	console.error(error)
	process.exit(1)
})

function getMobilePhoneNumberExamples(metadataJson) {
	return Object.keys(metadataJson.countries).reduce(function(out, country_code) {
		// if (country_code === REGION_CODE_FOR_NON_GEO_ENTITY) {
		// 	return out
		// }
		var mobile = metadataJson.countries[country_code].examples.mobile
		var fixed_line = metadataJson.countries[country_code].examples.fixed_line
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
}
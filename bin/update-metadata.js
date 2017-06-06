#!/usr/bin/env node

var path     = require('path')
var fs       = require('fs')
var minimist = require('minimist')

var download = require('../build/tools/download').default
var generate = require('../build/tools/generate').default
var compress = require('../build/tools/compress').default

var metadata_path = process.argv[2]

if (!metadata_path)
{
	return usage('Path to the output metadata file not specified')
}

metadata_path = path.resolve(metadata_path)

console.log('Metadata path:', metadata_path)

var command_line_arguments = minimist(process.argv.slice(3))

// Included countries
var included_countries
if (command_line_arguments.countries)
{
	included_countries = command_line_arguments.countries.split(',')
	console.log('Included countries:', included_countries)
	included_countries = new Set(included_countries)
}

// Include all regular expressions
var extended = false
if (command_line_arguments.extended)
{
	console.log('Include extra validation regular expressions')
	extended = true
}

// Included phone number types
var included_phone_number_types
if (command_line_arguments.types)
{
	included_phone_number_types = command_line_arguments.types.split(',')
	console.log('Included phone number types:', included_phone_number_types)
	included_phone_number_types = new Set(included_phone_number_types)
}

// Download the latest `PhoneNumberMetadata.xml`
// from Google's `libphonenumber` github repository.
download('https://raw.githubusercontent.com/googlei18n/libphonenumber/master/resources/PhoneNumberMetadata.xml')
	.then(function(xml)
	{
		// Generate and compress metadata
		return generate(xml, included_countries, extended, included_phone_number_types)
	})
	.then(function(output)
	{
		// Compare metadata
		var previous_metadata = fs.existsSync(metadata_path) && fs.readFileSync(metadata_path, 'utf8')
		var new_metadata = JSON.stringify(compress(output))

		if (!previous_metadata || previous_metadata !== new_metadata)
		{
			console.log('========================================')
			console.log('=       Metadata has been updated      =')
			console.log('========================================')

			// Write the new metadata to file
			fs.writeFileSync(metadata_path, new_metadata)
		}
	})
	.catch(function(error)
	{
		console.error(error)
		process.exit(1)
	})

function usage(reason)
{
	if (reason)
	{
		console.log(reason)
		console.log('')
	}

	console.log('Usage:')
	console.log('')
	console.log('libphonenumber-generate-metadata <path-to-the-output-metadata.min.json> [options]')
	console.log('')
	console.log('Options:')
	console.log('')
	console.log('   countries - Include only specific countries')
	console.log('')
	console.log('               Example: "--countries RU,FR,DE"')
	console.log('')
	console.log('   extended - Include all the extra regular expressions for more precise phone number validation')
	console.log('')
	console.log('              Example: "--extended"')

	if (reason)
	{
		return process.exit(1)
	}

	process.exit(0)
}
import { describe, it } from 'mocha'
import { expect } from 'chai'

import Metadata, { getCountryCallingCode } from '../metadata.js'
import metadata from '../../metadata.max.json' with { type: 'json' }
import oldMetadata from '../../test/metadata/1.0.0/metadata.min.json' with { type: 'json' }

import checkNumberLength, { checkNumberLengthForType } from './checkNumberLength.js'

describe('checkNumberLength', () => {
	it('should check phone number length (`country` is pre-selected in metadata instance)', () => {
		// Too short.
		expect(checkNumberLengthWithCountry('800555353', 'RU', 'FIXED_LINE')).to.equal('TOO_SHORT')
		// Normal.
		expect(checkNumberLengthWithCountry('8005553535', 'RU', 'FIXED_LINE')).to.equal('IS_POSSIBLE')
		// Too long.
		expect(checkNumberLengthWithCountry('80055535355', 'RU', 'FIXED_LINE')).to.equal('TOO_LONG')

		// No such type.
		expect(checkNumberLengthWithCountry('169454850', 'AC', 'VOIP')).to.equal('INVALID_LENGTH')
		// No such possible length.
		expect(checkNumberLengthWithCountry('1694548', 'AD', undefined)).to.equal('INVALID_LENGTH')

		// FIXED_LINE_OR_MOBILE
		expect(checkNumberLengthWithCountry('1694548', 'AD', 'FIXED_LINE_OR_MOBILE')).to.equal('INVALID_LENGTH')
		// No mobile phones.
		expect(checkNumberLengthWithCountry('8123', 'TA', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE')
		// No "possible lengths" for "mobile".
		expect(checkNumberLengthWithCountry('81234567', 'SZ', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE')
	})

	it('should check phone number length (`country` override)', () => {
		const metadataInstance = new Metadata(metadata)
		metadataInstance.selectNumberingPlan('US')

		// The country code "US" will be overridden with "CA".
		//
		// How to find a suitable override for tests:
		//
		// for (const callingCode of Object.keys(metadata.country_calling_codes)) {
		// 	const countries = metadata.country_calling_codes[callingCode]
		// 	if (countries.length > 1) {
		// 		const mainCountry = countries.shift()
		// 		for (const country of countries) {
		// 			if (JSON.stringify(metadata.countries[country].possible_lengths) !== JSON.stringify(metadata.countries[mainCountry].possible_lengths)) {
		// 				console.log(country, 'has different possible lengths from the default country', mainCountry)
		// 			}
		// 		}
		// 	}
		// }

		// "UAN" phone number type doesn't exist in "US".
		// Hence, it returns "INVALID_LENGTH".
		expect(checkNumberLengthForType('2133734253', 'UAN', undefined, metadataInstance)).to.equal('INVALID_LENGTH')
		expect(checkNumberLengthForType('2133734253', 'UAN', 'CA', metadataInstance)).to.equal('TOO_LONG')
		// "UAN" phone number type doesn't exist in "US".
		// Hence, it returns "INVALID_LENGTH".
		expect(checkNumberLengthForType('2133734', 'UAN', undefined, metadataInstance)).to.equal('INVALID_LENGTH')
		expect(checkNumberLengthForType('2133734', 'UAN', 'CA', metadataInstance)).to.equal('IS_POSSIBLE')
	})

	it('should work for old metadata (`country` specified)', function() {
		const oldMetadataInstance = new Metadata(oldMetadata)
		oldMetadataInstance.selectNumberingPlan('KZ')
		expect(checkNumberLengthForType('8005553535', 'FIXED_LINE', 'RU', oldMetadataInstance)).to.equal('IS_POSSIBLE')
	})

	it('should work for old metadata (no `country` specified)', function() {
		const oldMetadataInstance = new Metadata(oldMetadata)
		oldMetadataInstance.selectNumberingPlan('RU')
		expect(checkNumberLengthForType('8005553535', 'FIXED_LINE', undefined, oldMetadataInstance)).to.equal('IS_POSSIBLE')
	})

	it('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', () => {
		const metadataInstance = new Metadata(metadata)
		metadataInstance.selectNumberingPlan('1')
		expect(checkNumberLength('3100000', undefined, metadataInstance)).to.equal('TOO_SHORT');
		expect(checkNumberLength('3100000', 'US', metadataInstance)).to.equal('TOO_SHORT');
		expect(checkNumberLength('3100000', 'CA', metadataInstance)).to.equal('IS_POSSIBLE');
	})
})

function checkNumberLengthWithCountry(number, country, type) {
	const metadataInstance = new Metadata(metadata)
	metadataInstance.selectNumberingPlan(country)
	return checkNumberLengthForType(number, type, undefined, metadataInstance)
}
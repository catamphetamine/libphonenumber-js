import { describe, it } from 'mocha'
import { expect } from 'chai'

import extractCountryCallingCodeFromInternationalNumberWithoutPlusSign from './extractCountryCallingCodeFromInternationalNumberWithoutPlusSign.js'
import metadata from '../../metadata.min.json' with { type: 'json' }

describe('helpers/extractCountryCallingCodeFromInternationalNumberWithoutPlusSign', () => {
	it('should detect international numbers without plus sign', () => {
		expect(extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
			'78005553535',
			'RU',
			undefined,
			undefined,
			metadata
		)).to.deep.equal({
			countryCallingCode: '7',
			number: '8005553535'
		})

		expect(extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
			'78005553535',
			undefined,
			'RU',
			undefined,
			metadata
		)).to.deep.equal({
			countryCallingCode: '7',
			number: '8005553535'
		})

		expect(extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
			'78005553535',
			undefined,
			undefined,
			'7',
			metadata
		)).to.deep.equal({
			countryCallingCode: '7',
			number: '8005553535'
		})

		// No source of country calling code was passed.
		expect(extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
			'78005553535',
			undefined,
			undefined,
			undefined,
			metadata
		)).to.deep.equal({
			number: '78005553535'
		})
	})
})
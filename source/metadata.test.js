import metadata from '../metadata.min.json'

import Metadata, { validateMetadata, getExtPrefix, isSupportedCountry } from './metadata'

describe('metadata', () => {
	it('should return undefined for non-defined types', () => {
		const FR = new Metadata(metadata).country('FR')
		type(FR.type('FIXED_LINE')).should.equal('undefined')
	})

	it('should validate country', () => {
		const thrower = () => new Metadata(metadata).country('RUS')
		thrower.should.throw('Unknown country')
	})

	it('should tell if a country is supported', () => {
		isSupportedCountry('RU', metadata).should.equal(true)
		isSupportedCountry('XX', metadata).should.equal(false)
	})

	it('should return ext prefix for a country', () => {
		getExtPrefix('US', metadata).should.equal(' ext. ')
		getExtPrefix('CA', metadata).should.equal(' ext. ')
		getExtPrefix('GB', metadata).should.equal(' x')
		// expect(getExtPrefix('XX', metadata)).to.equal(undefined)
		getExtPrefix('XX', metadata).should.equal(' ext. ')
	})

	it('should cover non-occuring edge cases', () => {
		new Metadata(metadata).getNumberingPlanMetadata('999')
	})

	it('should support deprecated methods', () => {
		new Metadata(metadata).country('US').nationalPrefixForParsing().should.equal('1')
		new Metadata(metadata).chooseCountryByCountryCallingCode('1').nationalPrefixForParsing().should.equal('1')
	})

	it('should tell if a national prefix is mandatory when formatting a national number', () => {
		const meta = new Metadata(metadata)
		// No "national_prefix_formatting_rule".
		// "national_prefix_is_optional_when_formatting": true
		meta.country('US')
		meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat().should.equal(false)
		// "national_prefix_formatting_rule": "8 ($1)"
		// "national_prefix_is_optional_when_formatting": true
		meta.country('RU')
		meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat().should.equal(false)
		// "national_prefix": "0"
		// "national_prefix_formatting_rule": "0 $1"
		meta.country('FR')
		meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat().should.equal(true)
	})

	it('should validate metadata', () => {
		let thrower = () => validateMetadata()
		thrower.should.throw('`metadata` argument not passed')

		thrower = () => validateMetadata(123)
		thrower.should.throw('Got a number: 123.')

		thrower = () => validateMetadata('abc')
		thrower.should.throw('Got a string: abc.')

		thrower = () => validateMetadata({ a: true, b: 2 })
		thrower.should.throw('Got an object of shape: { a, b }.')

		thrower = () => validateMetadata({ a: true, countries: 2 })
		thrower.should.throw('Got an object of shape: { a, countries }.')

		thrower = () => validateMetadata({ country_calling_codes: true, countries: 2 })
		thrower.should.throw('Got an object of shape')

		thrower = () => validateMetadata({ country_calling_codes: {}, countries: 2 })
		thrower.should.throw('Got an object of shape')

		validateMetadata({ country_calling_codes: {}, countries: {}, b: 3 })
	})
})

function type(something) {
	return typeof something
}
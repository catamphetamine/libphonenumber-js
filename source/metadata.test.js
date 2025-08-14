import metadata from '../metadata.min.json' with { type: 'json' }
import metadataV1 from '../test/metadata/1.0.0/metadata.min.json' with { type: 'json' }
import metadataV2 from '../test/metadata/1.1.11/metadata.min.json' with { type: 'json' }
import metadataV3 from '../test/metadata/1.7.34/metadata.min.json' with { type: 'json' }
import metadataV4 from '../test/metadata/1.7.37/metadata.min.json' with { type: 'json' }

import Metadata, { validateMetadata, getExtPrefix, isSupportedCountry } from './metadata.js'

describe('metadata', () => {
	it('should return undefined for non-defined types', () => {
		const FR = new Metadata(metadata).country('FR')
		expect(type(FR.type('FIXED_LINE'))).to.equal('undefined')
	})

	it('should validate country', () => {
		const thrower = () => new Metadata(metadata).country('RUS')
		expect(thrower).to.throw('Unknown country')
	})

	it('should tell if a country is supported', () => {
		expect(isSupportedCountry('RU', metadata)).to.equal(true)
		expect(isSupportedCountry('XX', metadata)).to.equal(false)
	})

	it('should return ext prefix for a country', () => {
		expect(getExtPrefix('US', metadata)).to.equal(' ext. ')
		expect(getExtPrefix('CA', metadata)).to.equal(' ext. ')
		expect(getExtPrefix('GB', metadata)).to.equal(' x')
		// expect(getExtPrefix('XX', metadata)).to.equal(undefined)
		expect(getExtPrefix('XX', metadata)).to.equal(' ext. ')
	})

	it('should cover non-occuring edge cases', () => {
		new Metadata(metadata).getNumberingPlanMetadata('999')
	})

	it('should support deprecated methods', () => {
		expect(new Metadata(metadata).country('US').nationalPrefixForParsing()).to.equal('1')
		expect(
            new Metadata(metadata).chooseCountryByCountryCallingCode('1').nationalPrefixForParsing()
        ).to.equal('1')
	})

	it('should tell if a national prefix is mandatory when formatting a national number', () => {
		const meta = new Metadata(metadata)
		// No "national_prefix_formatting_rule".
		// "national_prefix_is_optional_when_formatting": true
		meta.country('US')
		expect(
            meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat()
        ).to.equal(false)
		// "national_prefix_formatting_rule": "8 ($1)"
		// "national_prefix_is_optional_when_formatting": true
		meta.country('RU')
		expect(
            meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat()
        ).to.equal(false)
		// "national_prefix": "0"
		// "national_prefix_formatting_rule": "0 $1"
		meta.country('FR')
		expect(
            meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat()
        ).to.equal(true)
	})

	it('should validate metadata', () => {
		let thrower = () => validateMetadata()
		expect(thrower).to.throw('`metadata` argument not passed')

		thrower = () => validateMetadata(123)
		expect(thrower).to.throw('Got a number: 123.')

		thrower = () => validateMetadata('abc')
		expect(thrower).to.throw('Got a string: abc.')

		thrower = () => validateMetadata({ a: true, b: 2 })
		expect(thrower).to.throw('Got an object of shape: { a, b }.')

		thrower = () => validateMetadata({ a: true, countries: 2 })
		expect(thrower).to.throw('Got an object of shape: { a, countries }.')

		thrower = () => validateMetadata({ country_calling_codes: true, countries: 2 })
		expect(thrower).to.throw('Got an object of shape')

		thrower = () => validateMetadata({ country_calling_codes: {}, countries: 2 })
		expect(thrower).to.throw('Got an object of shape')

		validateMetadata({ country_calling_codes: {}, countries: {}, b: 3 })
	})

	it('should work around `nonGeographical` typo in metadata generated from `1.7.35` to `1.7.37`', function() {
		const meta = new Metadata(metadataV4)
		meta.selectNumberingPlan('888')
		expect(type(meta.nonGeographic())).to.equal('object')
	})

	it('should work around `nonGeographic` metadata not existing before `1.7.35`', function() {
		const meta = new Metadata(metadataV3)
		expect(type(meta.getNumberingPlanMetadata('800'))).to.equal('object')
		expect(type(meta.getNumberingPlanMetadata('000'))).to.equal('undefined')
	})

	it('should work with metadata from version `1.1.11`', function() {
		const meta = new Metadata(metadataV2)

		meta.selectNumberingPlan('US')
		expect(meta.numberingPlan.possibleLengths()).to.deep.equal([10])
		expect(meta.numberingPlan.formats().length).to.equal(1)
		expect(meta.numberingPlan.nationalPrefix()).to.equal('1')
		expect(meta.numberingPlan.nationalPrefixForParsing()).to.equal('1')
		expect(meta.numberingPlan.type('MOBILE').pattern()).to.equal('')

		meta.selectNumberingPlan('AG')
		expect(meta.numberingPlan.leadingDigits()).to.equal('268')
		// Should've been "268$1" but apparently there was a bug in metadata generator
		// and no national prefix transform rules were written.
		expect(meta.numberingPlan.nationalPrefixTransformRule()).to.equal(null)

		meta.selectNumberingPlan('AF')
		expect(meta.numberingPlan.formats()[0].nationalPrefixFormattingRule()).to.equal('0$1')

		meta.selectNumberingPlan('RU')
		expect(
            meta.numberingPlan.formats()[0].nationalPrefixIsOptionalWhenFormattingInNationalFormat()
        ).to.equal(true)
	})

	it('should work with metadata from version `1.0.0`', function() {
		const meta = new Metadata(metadataV1)

		meta.selectNumberingPlan('US')
		expect(meta.numberingPlan.formats().length).to.equal(1)
		expect(meta.numberingPlan.nationalPrefix()).to.equal('1')
		expect(meta.numberingPlan.nationalPrefixForParsing()).to.equal('1')
		expect(type(meta.numberingPlan.type('MOBILE'))).to.equal('undefined')

		meta.selectNumberingPlan('AG')
		expect(meta.numberingPlan.leadingDigits()).to.equal('268')
		// Should've been "268$1" but apparently there was a bug in metadata generator
		// and no national prefix transform rules were written.
		expect(meta.numberingPlan.nationalPrefixTransformRule()).to.equal(null)

		meta.selectNumberingPlan('AF')
		expect(meta.numberingPlan.formats()[0].nationalPrefixFormattingRule()).to.equal('0$1')

		meta.selectNumberingPlan('RU')
		expect(
            meta.numberingPlan.formats()[0].nationalPrefixIsOptionalWhenFormattingInNationalFormat()
        ).to.equal(true)
	})

	it('should work around "ext" data not present in metadata from version `1.0.0`', function() {
		const meta = new Metadata(metadataV1)
		meta.selectNumberingPlan('GB')
		expect(meta.ext()).to.equal(' ext. ')

		const metaNew = new Metadata(metadata)
		metaNew.selectNumberingPlan('GB')
		expect(metaNew.ext()).to.equal(' x')
	})

	it('should work around "default IDD prefix" data not present in metadata from version `1.0.0`', function() {
		const meta = new Metadata(metadataV1)
		meta.selectNumberingPlan('AU')
		expect(type(meta.defaultIDDPrefix())).to.equal('undefined')

		const metaNew = new Metadata(metadata)
		metaNew.selectNumberingPlan('AU')
		expect(metaNew.defaultIDDPrefix()).to.equal('0011')
	})
})

function type(something) {
	return typeof something
}
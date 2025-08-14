import metadata from '../../metadata.min.json' with { type: 'json' }
import _formatNumber from './format.js'

function formatNumber(...parameters) {
	parameters.push(metadata)
	return _formatNumber.apply(this, parameters)
}

describe('format', () => {
	it('should work with the first argument being a E.164 number', () => {
		expect(formatNumber('+12133734253', 'NATIONAL')).to.equal('(213) 373-4253')
		expect(formatNumber('+12133734253', 'INTERNATIONAL')).to.equal('+1 213 373 4253')

		// Invalid number.
		expect(formatNumber('+12111111111', 'NATIONAL')).to.equal('(211) 111-1111')

		// Formatting invalid E.164 numbers.
		expect(formatNumber('+11111', 'INTERNATIONAL')).to.equal('+1 1111')
		expect(formatNumber('+11111', 'NATIONAL')).to.equal('1111')
	})

	it('should work with the first object argument expanded', () => {
		expect(formatNumber('2133734253', 'US', 'NATIONAL')).to.equal('(213) 373-4253')
		expect(formatNumber('2133734253', 'US', 'INTERNATIONAL')).to.equal('+1 213 373 4253')
	})

	it('should support legacy "National" / "International" formats', () => {
		expect(formatNumber('2133734253', 'US', 'National')).to.equal('(213) 373-4253')
		expect(formatNumber('2133734253', 'US', 'International')).to.equal('+1 213 373 4253')
	})

	it('should format using formats with no leading digits (`format.leadingDigitsPatterns().length === 0`)', () => {
		expect(
            formatNumber({ phone: '12345678901', countryCallingCode: 888 }, 'INTERNATIONAL')
        ).to.equal('+888 123 456 78901')
	})

	it('should sort out the arguments', () => {
		const options = {
			formatExtension: (number, extension) => `${number} доб. ${extension}`
		}

		expect(formatNumber({
			phone   : '8005553535',
			country : 'RU',
			ext     : '123'
		},
		'NATIONAL', options)).to.equal('8 (800) 555-35-35 доб. 123')

		// Parse number from string.
		expect(formatNumber('+78005553535', 'NATIONAL', options)).to.equal('8 (800) 555-35-35')
		expect(formatNumber('8005553535', 'RU', 'NATIONAL', options)).to.equal('8 (800) 555-35-35')
	})

	it('should format with national prefix when specifically instructed', () => {
		// With national prefix.
		expect(formatNumber('88005553535', 'RU', 'NATIONAL')).to.equal('8 (800) 555-35-35')
		// Without national prefix via an explicitly set option.
		expect(formatNumber('88005553535', 'RU', 'NATIONAL', { nationalPrefix: false })).to.equal('800 555-35-35')
	})

	it('should format valid phone numbers', () => {
		// Switzerland
		expect(formatNumber({ country: 'CH', phone: '446681800' }, 'INTERNATIONAL')).to.equal('+41 44 668 18 00')
		expect(formatNumber({ country: 'CH', phone: '446681800' }, 'E.164')).to.equal('+41446681800')
		expect(formatNumber({ country: 'CH', phone: '446681800' }, 'RFC3966')).to.equal('tel:+41446681800')
		expect(formatNumber({ country: 'CH', phone: '446681800' }, 'NATIONAL')).to.equal('044 668 18 00')

		// France
		expect(formatNumber({ country: 'FR', phone: '169454850' }, 'NATIONAL')).to.equal('01 69 45 48 50')

		// Kazakhstan
		expect(formatNumber('+7 702 211 1111', 'NATIONAL')).to.equal('8 (702) 211 1111')
	})

	it('should format national numbers with national prefix even if it\'s optional', () => {
		// Russia
		expect(formatNumber({ country: 'RU', phone: '9991234567' }, 'NATIONAL')).to.equal('8 (999) 123-45-67')
	})

	it('should work in edge cases', () => {
		let thrower

		// No phone number
		expect(formatNumber('', 'RU', 'INTERNATIONAL')).to.equal('')
		expect(formatNumber('', 'RU', 'NATIONAL')).to.equal('')

		expect(formatNumber({ country: 'RU', phone: '' }, 'INTERNATIONAL')).to.equal('+7')
		expect(formatNumber({ country: 'RU', phone: '' }, 'NATIONAL')).to.equal('')

		// No suitable format
		expect(formatNumber('+121337342530', 'US', 'NATIONAL')).to.equal('21337342530')
		// No suitable format (leading digits mismatch)
		expect(formatNumber('28199999', 'AD', 'NATIONAL')).to.equal('28199999')

		// Numerical `value`
		thrower = () => formatNumber(89150000000, 'RU', 'NATIONAL')
		expect(thrower).to.throw(
            'A phone number must either be a string or an object of shape { phone, [country] }.'
        )

		// No metadata for country
		expect(() => formatNumber('+121337342530', 'USA', 'NATIONAL')).to.throw('Unknown country')
		expect(() => formatNumber('21337342530', 'USA', 'NATIONAL')).to.throw('Unknown country')

		// No format type
		thrower = () => formatNumber('+123')
		expect(thrower).to.throw('`format` argument not passed')

		// Unknown format type
		thrower = () => formatNumber('123', 'US', 'Gay')
		expect(thrower).to.throw('Unknown "format" argument')

		// No metadata
		thrower = () => _formatNumber('123', 'US', 'E.164')
		expect(thrower).to.throw('`metadata`')

		// No formats
		expect(formatNumber('012345', 'AC', 'NATIONAL')).to.equal('012345')

		// No `fromCountry` for `IDD` format.
		expect(formatNumber('+78005553535', 'IDD')).to.be.undefined

		// `fromCountry` has no default IDD prefix.
		expect(formatNumber('+78005553535', 'IDD', { fromCountry: 'BO' })).to.be.undefined

		// No such country.
		expect(() => formatNumber({ phone: '123', country: 'USA' }, 'NATIONAL')).to.throw('Unknown country')
	})

	it('should format phone number extensions', () => {
		// National
		expect(formatNumber({
			country: 'US',
			phone: '2133734253',
			ext: '123'
		},
		'NATIONAL')).to.equal('(213) 373-4253 ext. 123')

		// International
		expect(formatNumber({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'INTERNATIONAL')).to.equal('+1 213 373 4253 ext. 123')

		// International
		expect(formatNumber({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'INTERNATIONAL')).to.equal('+1 213 373 4253 ext. 123')

		// E.164
		expect(formatNumber({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'E.164')).to.equal('+12133734253')

		// RFC3966
		expect(formatNumber({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'RFC3966')).to.equal('tel:+12133734253;ext=123')

		// Custom ext prefix.
		expect(formatNumber({
			country : 'GB',
			phone   : '7912345678',
			ext     : '123'
		},
		'INTERNATIONAL')).to.equal('+44 7912 345678 x123')
	})

	it('should work with Argentina numbers', () => {
		// The same mobile number is written differently
		// in different formats in Argentina:
		// `9` gets prepended in international format.
		expect(formatNumber({ country: 'AR', phone: '3435551212' }, 'INTERNATIONAL')).to.equal('+54 3435 55 1212')
		expect(formatNumber({ country: 'AR', phone: '3435551212' }, 'NATIONAL')).to.equal('03435 55-1212')
	})

	it('should work with Mexico numbers', () => {
		// Fixed line.
		expect(formatNumber({ country: 'MX', phone: '4499780001' }, 'INTERNATIONAL')).to.equal('+52 449 978 0001')
		expect(formatNumber({ country: 'MX', phone: '4499780001' }, 'NATIONAL')).to.equal('449 978 0001')
			// or '(449)978-0001'.
		// Mobile.
		// `1` is prepended before area code to mobile numbers in international format.
		expect(formatNumber({ country: 'MX', phone: '3312345678' }, 'INTERNATIONAL')).to.equal('+52 33 1234 5678')
		expect(formatNumber({ country: 'MX', phone: '3312345678' }, 'NATIONAL')).to.equal('33 1234 5678')
			// or '045 33 1234-5678'.
	})

	it('should format possible numbers', () => {
		expect(formatNumber({ countryCallingCode: '7', phone: '1111111111' }, 'E.164')).to.equal('+71111111111')

		expect(formatNumber({ countryCallingCode: '7', phone: '1111111111' }, 'NATIONAL')).to.equal('1111111111')

		expect(
            formatNumber({ countryCallingCode: '7', phone: '1111111111' }, 'INTERNATIONAL')
        ).to.equal('+7 1111111111')
	})

	it('should format IDD-prefixed number', () => {
		// No `fromCountry`.
		expect(formatNumber('+78005553535', 'IDD')).to.be.undefined

		// No default IDD prefix.
		expect(formatNumber('+78005553535', 'IDD', { fromCountry: 'BO' })).to.be.undefined

		// Same country calling code.
		expect(
            formatNumber('+12133734253', 'IDD', { fromCountry: 'CA', humanReadable: true })
        ).to.equal('1 (213) 373-4253')
		expect(
            formatNumber('+78005553535', 'IDD', { fromCountry: 'KZ', humanReadable: true })
        ).to.equal('8 (800) 555-35-35')

		// formatNumber('+78005553535', 'IDD', { fromCountry: 'US' }).should.equal('01178005553535')
		expect(
            formatNumber('+78005553535', 'IDD', { fromCountry: 'US', humanReadable: true })
        ).to.equal('011 7 800 555 35 35')
	})

	it('should format non-geographic numbering plan phone numbers', () => {
		// https://github.com/catamphetamine/libphonenumber-js/issues/323
		expect(formatNumber('+870773111632', 'INTERNATIONAL')).to.equal('+870 773 111 632')
		expect(formatNumber('+870773111632', 'NATIONAL')).to.equal('773 111 632')
	})

	it('should use the default IDD prefix when formatting a phone number', () => {
		// Testing preferred international prefixes with ~ are supported.
		// ("~" designates waiting on a line until proceeding with the input).
		expect(formatNumber('+390236618300', 'IDD', { fromCountry: 'BY' })).to.equal('8~10 39 02 3661 8300')
	})
})
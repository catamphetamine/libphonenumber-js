import _parsePhoneNumber from './parsePhoneNumberWithError.js'
import metadata from '../metadata.min.json' with { type: 'json' }
import metadataFull from '../metadata.max.json' with { type: 'json' }

function parsePhoneNumber(...parameters) {
	parameters.push(metadata)
	return _parsePhoneNumber.apply(this, parameters)
}

function parsePhoneNumberFull(...parameters) {
	parameters.push(metadataFull)
	return _parsePhoneNumber.apply(this, parameters)
}

describe('parsePhoneNumberWithError', () => {
	it('should parse phone numbers', () => {
		const phoneNumber = parsePhoneNumber('The phone number is: 8 (800) 555 35 35. Some other text.', 'RU')
		expect(phoneNumber.country).to.equal('RU')
		expect(phoneNumber.countryCallingCode).to.equal('7')
		expect(phoneNumber.nationalNumber).to.equal('8005553535')
		expect(phoneNumber.number).to.equal('+78005553535')
		expect(phoneNumber.isPossible()).to.equal(true)
		expect(phoneNumber.isValid()).to.equal(true)
		// phoneNumber.isValidForRegion('RU').should.equal(true)
		// Russian phone type regexps aren't included in default metadata.
		expect(parsePhoneNumberFull('Phone: 8 (800) 555 35 35.', 'RU').getType()).to.equal('TOLL_FREE')
	})

	it('shouldn\'t set country when it\'s non-derivable', () => {
		const phoneNumber = parsePhoneNumber('+7 111 555 35 35')
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.countryCallingCode).to.equal('7')
		expect(phoneNumber.nationalNumber).to.equal('1115553535')
	})

	it('should parse carrier code', () => {
		const phoneNumber = parsePhoneNumber('0 15 21 5555-5555', 'BR')
		expect(phoneNumber.carrierCode).to.equal('15')
	})

	it('should parse phone extension', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35 ext. 1234.', 'RU')
		expect(phoneNumber.ext).to.equal('1234')
	})

	it('should validate numbers for countries with no type regular expressions', () => {
		expect(parsePhoneNumber('+380391234567').isValid()).to.equal(true)
		expect(parsePhoneNumber('+380191234567').isValid()).to.equal(false)
	})

	it('should format numbers', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35.', 'RU')
		expect(phoneNumber.format('NATIONAL')).to.equal('8 (800) 555-35-35')
		expect(phoneNumber.formatNational()).to.equal('8 (800) 555-35-35')
		expect(phoneNumber.format('INTERNATIONAL')).to.equal('+7 800 555 35 35')
		expect(phoneNumber.formatInternational()).to.equal('+7 800 555 35 35')
	})

	it('should get tel: URI', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35 ext. 1234.', 'RU')
		expect(phoneNumber.getURI()).to.equal('tel:+78005553535;ext=1234')
	})

	it('should work in edge cases', () => {
		expect(() => parsePhoneNumber('+78005553535', -1, {})).to.throw('Invalid second argument')
	})

	it('should throw parse errors', () => {
		expect(() => parsePhoneNumber('8005553535', 'XX')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('+', 'RU')).to.throw('NOT_A_NUMBER')
		expect(() => parsePhoneNumber('a', 'RU')).to.throw('NOT_A_NUMBER')
		expect(() => parsePhoneNumber('1', 'RU')).to.throw('TOO_SHORT')
		expect(() => parsePhoneNumber('+4')).to.throw('TOO_SHORT')
		expect(() => parsePhoneNumber('+44')).to.throw('TOO_SHORT')
		expect(() => parsePhoneNumber('+443')).to.throw('TOO_SHORT')
		expect(() => parsePhoneNumber('+370')).to.throw('TOO_SHORT')
		expect(() => parsePhoneNumber('88888888888888888888', 'RU')).to.throw('TOO_LONG')
		expect(() => parsePhoneNumber('8 (800) 555 35 35')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('+9991112233')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('+9991112233', 'US')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('8005553535                                                                                                                                                                                                                                                 ', 'RU')).to.throw('TOO_LONG')
	})

	it('should parse incorrect international phone numbers', () => {
		// Parsing national prefixes and carrier codes
		// is only required for local phone numbers
		// but some people don't understand that
		// and sometimes write international phone numbers
		// with national prefixes (or maybe even carrier codes).
		// http://ucken.blogspot.ru/2016/03/trunk-prefixes-in-skype4b.html
		// Google's original library forgives such mistakes
		// and so does this library, because it has been requested:
		// https://github.com/catamphetamine/libphonenumber-js/issues/127

		let phoneNumber

		// For complete numbers it should strip national prefix.
		phoneNumber = parsePhoneNumber('+1 1877 215 5230')
		expect(phoneNumber.nationalNumber).to.equal('8772155230')
		expect(phoneNumber.country).to.equal('US')

		// For complete numbers it should strip national prefix.
		phoneNumber = parsePhoneNumber('+7 8800 555 3535')
		expect(phoneNumber.nationalNumber).to.equal('8005553535')
		expect(phoneNumber.country).to.equal('RU')

		// For incomplete numbers it shouldn't strip national prefix.
		phoneNumber = parsePhoneNumber('+7 8800 555 353')
		expect(phoneNumber.nationalNumber).to.equal('8800555353')
		expect(phoneNumber.country).to.be.undefined
	})
})

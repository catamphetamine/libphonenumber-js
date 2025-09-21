import _parsePhoneNumber from './parsePhoneNumber.js'
import metadata from '../metadata.min.json' with { type: 'json' }

function parsePhoneNumber(...parameters) {
	parameters.push(metadata)
	return _parsePhoneNumber.apply(this, parameters)
}

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

describe('parsePhoneNumber', () => {
	it('should parse phone numbers from string', () => {
		expect(parsePhoneNumber('Phone: 8 (800) 555 35 35.', 'RU').nationalNumber).to.equal('8005553535')
		expect(parsePhoneNumber('3', 'RU')).to.be.undefined
	})

	it('should work in edge cases', () => {
		expect(parsePhoneNumber('')).to.be.undefined
	})

	it('should parse phone numbers when invalid country code is passed', () => {
		expect(parsePhoneNumber('Phone: +7 (800) 555 35 35.', 'XX').nationalNumber).to.equal('8005553535')
		expect(parsePhoneNumber('Phone: 8 (800) 555-35-35.', 'XX')).to.be.undefined
	})


	it('should parse non-geographic numbering plan phone numbers (extended)', () => {
		const phoneNumber = parsePhoneNumber('+870773111632')
		expect(phoneNumber.number).to.equal('+870773111632')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			expect(phoneNumber.country).to.equal('001')
		} else {
			expect(phoneNumber.country).to.be.undefined
		}
		expect(phoneNumber.countryCallingCode).to.equal('870')
	})

	it('should parse non-geographic numbering plan phone numbers (default country code) (extended)', () => {
		const phoneNumber = parsePhoneNumber('773111632', { defaultCallingCode: '870' })
		expect(phoneNumber.number).to.equal('+870773111632')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			expect(phoneNumber.country).to.equal('001')
		} else {
			expect(phoneNumber.country).to.be.undefined
		}
		expect(phoneNumber.countryCallingCode).to.equal('870')
	})

	it('should determine the possibility of non-geographic phone numbers', () => {
		const phoneNumber = parsePhoneNumber('+870773111632')
		expect(phoneNumber.isPossible()).to.equal(true)
		const phoneNumber2 = parsePhoneNumber('+8707731116321')
		expect(phoneNumber2.isPossible()).to.equal(false)
	})

	it('should support `extract: false` flag', () => {
		const testCorrectness = (number, expectedResult) => {
			const result = expect(parsePhoneNumber(number, { extract: false, defaultCountry: 'US' }))
			if (expectedResult) {
				result.to.not.be.undefined
			} else {
				result.to.be.undefined
			}
		}
		testCorrectness('Call: (213) 373-4253', false)
		testCorrectness('(213) 373-4253x', false)
		testCorrectness('(213) 373-4253', true)
		testCorrectness('- (213) 373-4253 -', true)
		testCorrectness('+1 (213) 373-4253', true)
		testCorrectness(' +1 (213) 373-4253', false)
	})

	it('should not prematurely strip a possible national prefix from Chinese numbers', () => {
		// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/57
		const phoneNumber = parsePhoneNumber('+86123456789')
		expect(phoneNumber.isPossible()).to.equal(true)
		expect(phoneNumber.isValid()).to.equal(false)
		expect(phoneNumber.nationalNumber).to.equal('123456789')
	})

	it('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', () => {
		// Tests that Californian numbers `+1310xxxx` are considered possible.
		// https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/228#note_1872536721

		const phoneNumber = parsePhoneNumber('+13100000')
		expect(phoneNumber.country).to.equal('CA')
		expect(phoneNumber.isPossible()).to.equal(true)
		expect(phoneNumber.isValid()).to.equal(true)
		expect(phoneNumber.nationalNumber).to.equal('3100000')

		const phoneNumberLocal = parsePhoneNumber('3100000', 'CA')
		expect(phoneNumberLocal.country).to.equal('CA')
		expect(phoneNumberLocal.isPossible()).to.equal(true)
		expect(phoneNumberLocal.isValid()).to.equal(true)
		expect(phoneNumberLocal.nationalNumber).to.equal('3100000')
	})
})

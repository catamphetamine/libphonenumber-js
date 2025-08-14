import _parsePhoneNumberFromString from '../../../../source/parsePhoneNumber.js'
import metadata from '../metadata.min.json' with { type: 'json' }

function parsePhoneNumberFromString(...parameters) {
	parameters.push(metadata)
	return _parsePhoneNumberFromString.apply(this, parameters)
}

describe('parsePhoneNumberFromString', () => {
	it('should parse phone numbers from string', () => {
		expect(
            parsePhoneNumberFromString('Phone: 8 (800) 555 35 35.', 'RU').nationalNumber
        ).to.equal('8005553535')
		expect(parsePhoneNumberFromString('3', 'RU')).to.be.undefined
	})

	it('should work in edge cases', () => {
		expect(parsePhoneNumberFromString('')).to.be.undefined
	})

	it('should parse phone numbers when invalid country code is passed', () => {
		expect(
            parsePhoneNumberFromString('Phone: +7 (800) 555 35 35.', 'XX').nationalNumber
        ).to.equal('8005553535')
		expect(parsePhoneNumberFromString('Phone: 8 (800) 555-35-35.', 'XX')).to.be.undefined
	})
})

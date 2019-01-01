import _parsePhoneNumberFromString from './parsePhoneNumberFromString'
import metadata from '../metadata.min.json'

function parsePhoneNumberFromString(...parameters) {
	parameters.push(metadata)
	return _parsePhoneNumberFromString.apply(this, parameters)
}

describe('parsePhoneNumberFromString', () => {
	it('should parse phone numbers from string', () => {
		parsePhoneNumberFromString('Phone: 8 (800) 555 35 35.', 'RU').nationalNumber.should.equal('8005553535')
		expect(parsePhoneNumberFromString('3', 'RU')).to.be.undefined
	})
})

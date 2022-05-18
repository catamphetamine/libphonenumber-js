import _parsePhoneNumberFromString from '../../../../source/parsePhoneNumberFromString.js'
import metadata from '../metadata.min.json'

function parsePhoneNumberFromString(...parameters) {
	parameters.push(metadata)
	return _parsePhoneNumberFromString.apply(this, parameters)
}

describe('parsePhoneNumberFromString', () => {
	it('should handle the bug when non-geographic numbering plans didn\'t have "possible_lengths" set', () => {
		const phoneNumber = parsePhoneNumberFromString('+870773111632')
		expect(phoneNumber.country).to.be.undefined
		phoneNumber.countryCallingCode.should.equal('870')
		phoneNumber.isPossible().should.equal(true)
		// All numbers are assumed being possible.
		const phoneNumber2 = parsePhoneNumberFromString('+8707731116321')
		phoneNumber2.isPossible().should.equal(true)
	})
})

import _parsePhoneNumberFromString from '../../../../source/parsePhoneNumber.js'
import metadata from '../metadata.min.json' with { type: 'json' }

function parsePhoneNumberFromString(...parameters) {
	parameters.push(metadata)
	return _parsePhoneNumberFromString.apply(this, parameters)
}

describe('parsePhoneNumberFromString', () => {
	it('should handle the bug when non-geographic numbering plans didn\'t have "possible_lengths" set', () => {
		const phoneNumber = parsePhoneNumberFromString('+870773111632')
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.countryCallingCode).to.equal('870')
		expect(phoneNumber.isPossible()).to.equal(true)
		// All numbers are assumed being possible.
		const phoneNumber2 = parsePhoneNumberFromString('+8707731116321')
		expect(phoneNumber2.isPossible()).to.equal(true)
	})
})

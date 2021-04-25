import _isPossiblePhoneNumber from './isPossiblePhoneNumber'
import metadata from '../metadata.min.json'

function isPossiblePhoneNumber(...parameters) {
	parameters.push(metadata)
	return _isPossiblePhoneNumber.apply(this, parameters)
}

describe('isPossiblePhoneNumber', () => {
	it('should detect whether a phone number is possible', () => {
		isPossiblePhoneNumber('8 (800) 555 35 35', 'RU').should.equal(true)
		isPossiblePhoneNumber('8 (800) 555 35 35 0', 'RU').should.equal(false)
		isPossiblePhoneNumber('Call: 8 (800) 555 35 35', 'RU').should.equal(false)
		isPossiblePhoneNumber('8 (800) 555 35 35', { defaultCountry: 'RU' }).should.equal(true)
		isPossiblePhoneNumber('+7 (800) 555 35 35').should.equal(true)
		isPossiblePhoneNumber('+7 1 (800) 555 35 35').should.equal(false)
		isPossiblePhoneNumber(' +7 (800) 555 35 35').should.equal(false)
		isPossiblePhoneNumber(' ').should.equal(false)
	})
})
import _isPossiblePhoneNumber from './isPossiblePhoneNumber.js'
import metadata from '../metadata.min.json' with { type: 'json' }
import oldMetadata from '../test/metadata/1.0.0/metadata.min.json' with { type: 'json' }

function isPossiblePhoneNumber(...parameters) {
	parameters.push(metadata)
	return _isPossiblePhoneNumber.apply(this, parameters)
}

describe('isPossiblePhoneNumber', () => {
	it('should detect whether a phone number is possible', () => {
		expect(isPossiblePhoneNumber('8 (800) 555 35 35', 'RU')).to.equal(true)
		expect(isPossiblePhoneNumber('8 (800) 555 35 35 0', 'RU')).to.equal(false)
		expect(isPossiblePhoneNumber('Call: 8 (800) 555 35 35', 'RU')).to.equal(false)
		expect(isPossiblePhoneNumber('8 (800) 555 35 35', { defaultCountry: 'RU' })).to.equal(true)
		expect(isPossiblePhoneNumber('+7 (800) 555 35 35')).to.equal(true)
		expect(isPossiblePhoneNumber('+7 1 (800) 555 35 35')).to.equal(false)
		expect(isPossiblePhoneNumber(' +7 (800) 555 35 35')).to.equal(false)
		expect(isPossiblePhoneNumber(' ')).to.equal(false)
	})

	it('should detect whether a phone number is possible when using old metadata', () => {
		expect(() => _isPossiblePhoneNumber('8 (800) 555 35 35', 'RU', oldMetadata)).to.throw('Missing "possibleLengths" in metadata.')
		expect(_isPossiblePhoneNumber('+888 123 456 78901', oldMetadata)).to.equal(true)
	})

	it('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', () => {
		// Tests that Californian numbers `+1310xxxx` are considered possible.
		// https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/228#note_1872536721
		expect(isPossiblePhoneNumber('+13100000', 'CA')).to.equal(true)
		expect(isPossiblePhoneNumber('3100000', 'CA')).to.equal(true)
	})
})
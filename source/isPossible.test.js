import metadata from '../metadata.min.json' with { type: 'json' }
import _isPossibleNumber from './isPossible.js'
import parsePhoneNumber from './parsePhoneNumber.js'

function isPossibleNumber(...parameters) {
	let v2
	if (parameters.length < 1) {
		// `input` parameter.
		parameters.push(undefined)
	} else {
		// Convert string `input` to a `PhoneNumber` instance.
		if (typeof parameters[0] === 'string') {
			v2 = true
			parameters[0] = parsePhoneNumber(parameters[0], {
				...parameters[1],
				extract: false
			}, metadata)
		}
	}
	if (parameters.length < 2) {
		// `options` parameter.
		parameters.push(undefined)
	}
	// Set `v2` flag.
	parameters[1] = {
		v2,
		...parameters[1]
	}
	// Add `metadata` parameter.
	parameters.push(metadata)
	// Call the function.
	return _isPossibleNumber.apply(this, parameters)
}

describe('isPossible', () => {
	it('should work', function()
	{
		expect(isPossibleNumber('+79992223344')).to.equal(true)

		expect(isPossibleNumber({ phone: '1112223344', country: 'RU' })).to.equal(true)
		expect(isPossibleNumber({ phone: '111222334', country: 'RU' })).to.equal(false)
		expect(isPossibleNumber({ phone: '11122233445', country: 'RU' })).to.equal(false)

		expect(isPossibleNumber({ phone: '1112223344', countryCallingCode: 7 })).to.equal(true)
	})

	it('should work v2', () => {
		expect(
            isPossibleNumber({ nationalNumber: '111222334', countryCallingCode: 7 }, { v2: true })
        ).to.equal(false)
		expect(
            isPossibleNumber({ nationalNumber: '1112223344', countryCallingCode: 7 }, { v2: true })
        ).to.equal(true)
		expect(
            isPossibleNumber({ nationalNumber: '11122233445', countryCallingCode: 7 }, { v2: true })
        ).to.equal(false)
	})

	it('should work in edge cases', () => {
		// Invalid `PhoneNumber` argument.
		expect(() => isPossibleNumber({}, { v2: true })).to.throw('Invalid phone number object passed')

		// Empty input is passed.
		// This is just to support `isValidNumber({})`
		// for cases when `parseNumber()` returns `{}`.
		expect(isPossibleNumber({})).to.equal(false)
		expect(() => isPossibleNumber({ phone: '1112223344' })).to.throw('Invalid phone number object passed')

		// Incorrect country.
		expect(() => isPossibleNumber({ phone: '1112223344', country: 'XX' })).to.throw('Unknown country')
	})


	it('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', () => {
		// Tests that Californian numbers `+1310xxxx` are considered possible.
		// https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/228#note_1872536721
		const phoneNumber = parsePhoneNumber('+13100000', undefined, metadata)
		expect(phoneNumber.country).to.equal('CA')
		expect(phoneNumber.isPossible()).to.equal(true)
		expect(phoneNumber.isValid()).to.equal(true)
		expect(phoneNumber.nationalNumber).to.equal('3100000')
	})
})
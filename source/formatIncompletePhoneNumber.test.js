import formatIncompletePhoneNumber from './formatIncompletePhoneNumber.js'

import metadata from '../metadata.min.json' with { type: 'json' }

describe('formatIncompletePhoneNumber', () => {
	it('should format parsed input value', () => {
		let result

		// National input.
		expect(formatIncompletePhoneNumber('880055535', 'RU', metadata)).to.equal('8 (800) 555-35')

		// International input, no country.
		expect(formatIncompletePhoneNumber('+780055535', null, metadata)).to.equal('+7 800 555 35')

		// International input, no country argument.
		expect(formatIncompletePhoneNumber('+780055535', metadata)).to.equal('+7 800 555 35')

		// International input, with country.
		expect(formatIncompletePhoneNumber('+780055535', 'RU', metadata)).to.equal('+7 800 555 35')
	})

	it('should support an object argument', () => {
		expect(
            formatIncompletePhoneNumber('880055535', { defaultCountry: 'RU' }, metadata)
        ).to.equal('8 (800) 555-35')
		expect(
            formatIncompletePhoneNumber('880055535', { defaultCallingCode: '7' }, metadata)
        ).to.equal('8 (800) 555-35')
	})
})
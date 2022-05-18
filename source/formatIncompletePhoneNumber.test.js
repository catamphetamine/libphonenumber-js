import formatIncompletePhoneNumber from './formatIncompletePhoneNumber.js'

import metadata from '../metadata.min.json'

describe('formatIncompletePhoneNumber', () => {
	it('should format parsed input value', () => {
		let result

		// National input.
		formatIncompletePhoneNumber('880055535', 'RU', metadata).should.equal('8 (800) 555-35')

		// International input, no country.
		formatIncompletePhoneNumber('+780055535', null, metadata).should.equal('+7 800 555 35')

		// International input, no country argument.
		formatIncompletePhoneNumber('+780055535', metadata).should.equal('+7 800 555 35')

		// International input, with country.
		formatIncompletePhoneNumber('+780055535', 'RU', metadata).should.equal('+7 800 555 35')
	})
})
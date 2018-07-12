import formatIncompletePhoneNumber from './formatIncompletePhoneNumber'

import metadata from '../metadata.min'

describe('formatIncompletePhoneNumber', () =>
{
	it('should format parsed input value', () =>
	{
		let result

		// National input.

		// Without template.
		formatIncompletePhoneNumber('880055535', 'RU', metadata).should.equal('8 (800) 555-35')

		// With template.
		result = formatIncompletePhoneNumber('880055535', 'RU', metadata, { template: true })
		result.number.should.equal('8 (800) 555-35')
		result.template.should.equal('x (xxx) xxx-xx-xx')

		// International input, no country.

		// Without template.
		formatIncompletePhoneNumber('+780055535', null, metadata).should.equal('+7 800 555 35')

		// With template.
		result = formatIncompletePhoneNumber('+780055535', null, metadata, { template: true })
		result.number.should.equal('+7 800 555 35')
		result.template.should.equal('xx xxx xxx xx xx')

		// International input, with country.

		// Without template.
		formatIncompletePhoneNumber('+780055535', 'RU', metadata).should.equal('+7 800 555 35')

		// With template.
		result = formatIncompletePhoneNumber('+780055535', 'RU', metadata, { template: true })
		result.number.should.equal('+7 800 555 35')
		result.template.should.equal('xx xxx xxx xx xx')
	})
})
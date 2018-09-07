import { matches_entirely } from './common'

describe('common', () =>
{
	it('`matches_entirely` should work in edge cases', function()
	{
		// No text.
		matches_entirely(undefined, '').should.equal(true)

		// "OR" in regexp.
		matches_entirely('911231231', '4\d{8}|[1-9]\d{7}').should.equal(false)
	})
})
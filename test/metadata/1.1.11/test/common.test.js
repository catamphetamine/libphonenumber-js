import { matches_entirely } from '../../../../source/common'

describe('common', () =>
{
	it('`matches_entirely` should work in edge cases', function()
	{
		// No text
		matches_entirely(undefined, '').should.equal(true)
	})
})
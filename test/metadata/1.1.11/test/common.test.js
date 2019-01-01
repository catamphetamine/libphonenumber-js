import { matchesEntirely } from '../../../../source/util'

describe('common', () =>
{
	it('`matchesEntirely()` should work in edge cases', function()
	{
		// No text
		matchesEntirely(undefined, '').should.equal(true)
	})
})
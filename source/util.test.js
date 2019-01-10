import { matchesEntirely, mergeArrays } from './util'

describe('util', () => {
	it('`matchesEntirely()` should work in edge cases', () => {
		// No text.
		matchesEntirely(undefined, '').should.equal(true)

		// "OR" in regexp.
		matchesEntirely('911231231', '4\d{8}|[1-9]\d{7}').should.equal(false)
	})

	it('should merge arrays', () => {
		mergeArrays([1, 2], [2, 3]).should.deep.equal([1, 2, 3])
	})
})
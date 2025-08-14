import matchesEntirely from './matchesEntirely.js'

describe('matchesEntirely', () => {
	it('should work in edge cases', () => {
		// No text.
		expect(matchesEntirely(undefined, '')).to.equal(true)

		// "OR" in regexp.
		expect(matchesEntirely('911231231', '4\d{8}|[1-9]\d{7}')).to.equal(false)
	})
})
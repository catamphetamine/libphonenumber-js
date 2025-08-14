import mergeArrays from './mergeArrays.js'

describe('mergeArrays', () => {
	it('should merge arrays', () => {
		expect(mergeArrays([1, 2], [2, 3])).to.deep.equal([1, 2, 3])
	})
})
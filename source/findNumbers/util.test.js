import {
	limit,
	trimAfterFirstMatch,
	startsWith,
	endsWith
} from './util.js'

describe('findNumbers/util', () => {
	it('should generate regexp limit', () => {
		let thrower = () => limit(1, 0)
		expect(thrower).to.throw()

		thrower = () => limit(-1, 1)
		expect(thrower).to.throw()

		thrower = () => limit(0, 0)
		expect(thrower).to.throw()
	})

	it('should trimAfterFirstMatch', () => {
		expect(trimAfterFirstMatch(/\d/, 'abc123')).to.equal('abc')
		expect(trimAfterFirstMatch(/\d/, 'abc')).to.equal('abc')
	})

	it('should determine if a string starts with a substring', () => {
		expect(startsWith('𐍈123', '𐍈')).to.equal(true)
		expect(startsWith('1𐍈', '𐍈')).to.equal(false)
	})

	it('should determine if a string ends with a substring', () => {
		expect(endsWith('123𐍈', '𐍈')).to.equal(true)
		expect(endsWith('𐍈1', '𐍈')).to.equal(false)
	})
})
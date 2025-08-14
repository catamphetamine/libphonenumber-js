import { closeNonPairedParens, stripNonPairedParens, repeat } from './AsYouTypeFormatter.util.js'

describe('closeNonPairedParens', () => {
	it('should close non-paired braces', () => {
		expect(closeNonPairedParens('(000) 123-45 (9  )', 15)).to.equal('(000) 123-45 (9  )')
	})
})

describe('stripNonPairedParens', () => {
	it('should strip non-paired braces', () => {
		expect(stripNonPairedParens('(000) 123-45 (9')).to.equal('(000) 123-45 9')
		expect(stripNonPairedParens('(000) 123-45 (9)')).to.equal('(000) 123-45 (9)')
	})
})

describe('repeat', () => {
	it('should repeat string N times', () => {
		expect(repeat('a', 0)).to.equal('')
		expect(repeat('a', 3)).to.equal('aaa')
		expect(repeat('a', 4)).to.equal('aaaa')
	})
})
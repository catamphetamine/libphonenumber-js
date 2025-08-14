import applyInternationalSeparatorStyle from './applyInternationalSeparatorStyle.js'

describe('applyInternationalSeparatorStyle', () => {
	it('should change Google\'s international format style', () => {
		expect(applyInternationalSeparatorStyle('(xxx) xxx-xx-xx')).to.equal('xxx xxx xx xx')
		expect(applyInternationalSeparatorStyle('(xxx)xxx')).to.equal('xxx xxx')
	})
})
import { parseRFC3966, formatRFC3966 } from './RFC3966'

describe('RFC3966', () =>
{
	it('should work in edge cases', function()
	{
		expect(() => formatRFC3966({ number: '123' })).to.throw('expects country calling code')
		formatRFC3966({}).should.equal('')
		formatRFC3966({ number: '+78005553535'}).should.equal('tel:+78005553535')
		formatRFC3966({ countryCallingCode: '123', number: '+78005553535'}).should.equal('tel:+78005553535')
	})
})

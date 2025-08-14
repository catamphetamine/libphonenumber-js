import { parseRFC3966, formatRFC3966 } from './RFC3966.js'

describe('RFC3966', () => {
	it('should format', () => {
		expect(() => formatRFC3966({ number: '123' })).to.throw('expects "number" to be in E.164 format')
		expect(formatRFC3966({})).to.equal('')
		expect(formatRFC3966({ number: '+78005553535' })).to.equal('tel:+78005553535')
		expect(formatRFC3966({ number: '+78005553535', ext: '123' })).to.equal('tel:+78005553535;ext=123')
	})

	it('should parse', () => {
		expect(parseRFC3966('tel:+78005553535')).to.deep.equal({
			number : '+78005553535'
		})

		expect(parseRFC3966('tel:+78005553535;ext=123')).to.deep.equal({
			number : '+78005553535',
			ext    : '123'
		})

		// With `phone-context`
		expect(parseRFC3966('tel:8005553535;ext=123;phone-context=+7')).to.deep.equal({
			number : '+78005553535',
			ext    : '123'
		})

		// "Domain contexts" are ignored
		expect(parseRFC3966('tel:8005553535;ext=123;phone-context=www.leningrad.spb.ru')).to.deep.equal({
			number : '8005553535',
			ext    : '123'
		})

		// Not a viable phone number.
		expect(parseRFC3966('tel:3')).to.deep.equal({})
	})
})

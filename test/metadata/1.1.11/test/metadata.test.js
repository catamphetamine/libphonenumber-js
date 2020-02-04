import metadata from '../metadata.min.json'

import Metadata, { validateMetadata } from '../../../../source/metadata'

describe('metadata', () =>
{
	it('should return undefined for non-defined types', function()
	{
		const FR = new Metadata(metadata).country('FR')
		type(FR.type('FIXED_LINE')).should.equal('undefined')
	})

	it('should validate country', function()
	{
		const thrower = () => new Metadata(metadata).country('RUS')
		thrower.should.throw('Unknown country')
	})

	it('should validate metadata', function()
	{
		let thrower = () => validateMetadata()
		thrower.should.throw('`metadata` argument not passed')

		thrower = () => validateMetadata(123)
		thrower.should.throw('Got a number: 123.')

		thrower = () => validateMetadata('abc')
		thrower.should.throw('Got a string: abc.')

		thrower = () => validateMetadata({ a: true, b: 2 })
		thrower.should.throw('Got an object of shape: { a, b }.')

		thrower = () => validateMetadata({ a: true, countries: 2 })
		thrower.should.throw('Got an object of shape: { a, countries }.')

		thrower = () => validateMetadata({ country_calling_codes: true, countries: 2 })
		thrower.should.throw('Got an object of shape')

		thrower = () => validateMetadata({ country_calling_codes: {}, countries: 2 })
		thrower.should.throw('Got an object of shape')

		validateMetadata({ country_calling_codes: {}, countries: {}, b: 3 })
	})

	it('should support new metadata', () =>
	{
		const US = new Metadata(metadata).country('US')
		expect(US.IDDPrefix()).to.be.undefined
		expect(US.defaultIDDPrefix()).to.be.undefined
	})
})

function type(something)
{
	return typeof something
}
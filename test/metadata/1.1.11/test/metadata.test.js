import { describe, it } from 'mocha'
import { expect } from 'chai'

import metadata from '../metadata.min.json' with { type: 'json' }

import Metadata, { validateMetadata } from '../../../../source/metadata.js'

describe('metadata', () =>
{
	it('should return undefined for non-defined types', function()
	{
		const FR = new Metadata(metadata).country('FR')
		expect(type(FR.type('FIXED_LINE'))).to.equal('undefined')
	})

	it('should validate country', function()
	{
		const thrower = () => new Metadata(metadata).country('RUS')
		expect(thrower).to.throw('Unknown country')
	})

	it('should validate metadata', function()
	{
		let thrower = () => validateMetadata()
		expect(thrower).to.throw('`metadata` argument not passed')

		thrower = () => validateMetadata(123)
		expect(thrower).to.throw('Got a number: 123.')

		thrower = () => validateMetadata('abc')
		expect(thrower).to.throw('Got a string: abc.')

		thrower = () => validateMetadata({ a: true, b: 2 })
		expect(thrower).to.throw('Got an object of shape: { a, b }.')

		thrower = () => validateMetadata({ a: true, countries: 2 })
		expect(thrower).to.throw('Got an object of shape: { a, countries }.')

		thrower = () => validateMetadata({ country_calling_codes: true, countries: 2 })
		expect(thrower).to.throw('Got an object of shape')

		thrower = () => validateMetadata({ country_calling_codes: {}, countries: 2 })
		expect(thrower).to.throw('Got an object of shape')

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
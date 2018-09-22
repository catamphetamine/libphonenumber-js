import metadata from '../metadata.min.json'
import isValidNumberForRegionCustom from './isValidNumberForRegion'

function isValidNumberForRegion(...parameters)
{
	parameters.push(metadata)
	return isValidNumberForRegionCustom.apply(this, parameters)
}

describe('isValidNumberForRegion', () =>
{
	it('should detect if is valid number for region', function()
	{
		isValidNumberForRegion('07624369230', 'GB').should.equal(false)
		isValidNumberForRegion('07624369230', 'IM').should.equal(true)
	})

	it('should validate arguments', function()
	{
		expect(() => isValidNumberForRegion({ phone: '7624369230', country: 'GB' })).to.throw('number must be a string')
		expect(() => isValidNumberForRegion('7624369230')).to.throw('country must be a string')
	})
})
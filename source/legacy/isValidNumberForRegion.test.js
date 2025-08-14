import metadata from '../../metadata.min.json' with { type: 'json' }
import isValidNumberForRegionCustom from './isValidNumberForRegion.js'
import _isValidNumberForRegion from './isValidNumberForRegion_.js'

function isValidNumberForRegion(...parameters) {
	parameters.push(metadata)
	return isValidNumberForRegionCustom.apply(this, parameters)
}

describe('isValidNumberForRegion', () => {
	it('should detect if is valid number for region', () => {
		expect(isValidNumberForRegion('07624369230', 'GB')).to.equal(false)
		expect(isValidNumberForRegion('07624369230', 'IM')).to.equal(true)
	})

	it('should validate arguments', () => {
		expect(() => isValidNumberForRegion({ phone: '7624369230', country: 'GB' })).to.throw('number must be a string')
		expect(() => isValidNumberForRegion('7624369230')).to.throw('country must be a string')
	})

	it('should work in edge cases', () => {
		// Not a "viable" phone number.
		expect(isValidNumberForRegion('7', 'GB')).to.equal(false)

		// `options` argument `if/else` coverage.
		expect(_isValidNumberForRegion('07624369230', 'GB', {}, metadata)).to.equal(false)
	})
})
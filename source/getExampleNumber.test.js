import examples from '../examples.mobile.json' with { type: 'json' }
import metadata from '../metadata.min.json' with { type: 'json' }
import getExampleNumber from './getExampleNumber.js'

describe('getExampleNumber', () => {
	it('should get an example number', () => {
		const phoneNumber = getExampleNumber('RU', examples, metadata)
		expect(phoneNumber.nationalNumber).to.equal('9123456789')
		expect(phoneNumber.number).to.equal('+79123456789')
		expect(phoneNumber.countryCallingCode).to.equal('7')
		expect(phoneNumber.country).to.equal('RU')
	})

	it('should handle a non-existing country', () => {
		expect(getExampleNumber('XX', examples, metadata)).to.be.undefined
	})
})
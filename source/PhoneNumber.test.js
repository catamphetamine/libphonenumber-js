import metadata from '../metadata.min'
import PhoneNumber from './PhoneNumber'

describe('PhoneNumber', () => {
	it('should validate constructor arguments', () => {
		expect(() => new PhoneNumber()).to.throw('`countryCallingCode` not passed')
		expect(() => new PhoneNumber('7')).to.throw('`nationalNumber` not passed')
	})

	it('should accept country code argument', () => {
		const phoneNumber = new PhoneNumber('RU', '8005553535', metadata)
		phoneNumber.countryCallingCode.should.equal('7')
		phoneNumber.country.should.equal('RU')
		phoneNumber.number.should.equal('+78005553535')
	})

	it('should format number with options', () => {
		const phoneNumber = new PhoneNumber('7', '8005553535', metadata)
		phoneNumber.ext = '123'
		phoneNumber.format('NATIONAL', {
			formatExtension: (number, extension) => `${number} доб. ${extension}`
		})
		.should.equal('8 (800) 555-35-35 доб. 123')
	})

	it('should compare phone numbers', () => {
		new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('RU', '8005553535', metadata)).should.equal(true)
		new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('7', '8005553535', metadata)).should.equal(true)
		new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('RU', '8005553536', metadata)).should.equal(false)
	})

	it('should tell if a number is non-geographic', () => {
		new PhoneNumber('7', '8005553535', metadata).isNonGeographic().should.equal(false)
		new PhoneNumber('870', '773111632', metadata).isNonGeographic().should.equal(true)
	})
})
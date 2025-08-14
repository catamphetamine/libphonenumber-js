import metadata from '../metadata.min.json' with { type: 'json' }
import PhoneNumber from './PhoneNumber.js'

describe('PhoneNumber', () => {
	it('should create a phone number via a public constructor', () => {
		const phoneNumber = new PhoneNumber('+78005553535', metadata)
		phoneNumber.setExt('1234')
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.countryCallingCode).to.equal('7')
		expect(phoneNumber.nationalNumber).to.equal('8005553535')
		expect(phoneNumber.formatNational()).to.equal('8 (800) 555-35-35 ext. 1234')
	})

	it('should validate constructor arguments (public constructor)', () => {
		expect(() => new PhoneNumber()).to.throw('argument is required')
		expect(() => new PhoneNumber(undefined, metadata)).to.throw('argument is required')
		expect(() => new PhoneNumber('7', metadata)).to.throw('must consist of a "+"')
		expect(() => new PhoneNumber('+7', metadata)).to.throw('too short')
		expect(() => new PhoneNumber('+7800')).to.throw('`metadata` argument not passed')
		expect(() => new PhoneNumber(1234567890)).to.throw('must be a string')
		expect(() => new PhoneNumber('+1', 1234567890)).to.throw('must be a string')
	})

	it('should validate constructor arguments (private constructor)', () => {
		expect(() => new PhoneNumber(undefined, '800', metadata)).to.throw('First argument is required')
		expect(() => new PhoneNumber('7', undefined, metadata)).to.throw('`nationalNumber` argument is required')
		expect(() => new PhoneNumber('7', '8005553535')).to.throw('`metadata` argument not passed')
	})

	it('should accept country code argument', () => {
		const phoneNumber = new PhoneNumber('RU', '8005553535', metadata)
		expect(phoneNumber.countryCallingCode).to.equal('7')
		expect(phoneNumber.country).to.equal('RU')
		expect(phoneNumber.number).to.equal('+78005553535')
	})

	it('should format number with options', () => {
		const phoneNumber = new PhoneNumber('7', '8005553535', metadata)
		phoneNumber.ext = '123'
		expect(phoneNumber.format('NATIONAL', {
			formatExtension: (number, extension) => `${number} доб. ${extension}`
		})).to.equal('8 (800) 555-35-35 доб. 123')
	})

	it('should compare phone numbers', () => {
		expect(
            new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('RU', '8005553535', metadata))
        ).to.equal(true)
		expect(
            new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('7', '8005553535', metadata))
        ).to.equal(true)
		expect(
            new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('RU', '8005553536', metadata))
        ).to.equal(false)
	})

	it('should tell if a number is non-geographic', () => {
		expect(new PhoneNumber('7', '8005553535', metadata).isNonGeographic()).to.equal(false)
		expect(new PhoneNumber('870', '773111632', metadata).isNonGeographic()).to.equal(true)
	})

	it('should allow setting extension', () => {
		const phoneNumber = new PhoneNumber('1', '2133734253', metadata)
		phoneNumber.setExt('1234')
		expect(phoneNumber.ext).to.equal('1234')
		expect(phoneNumber.formatNational()).to.equal('(213) 373-4253 ext. 1234')
	})

	it('should return possible countries', () => {
      // "599": [
      //    "CW", //  "possible_lengths": [7, 8]
      //    "BQ" //  "possible_lengths": [7]
      // ]

		let phoneNumber = new PhoneNumber('599', '123456', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries()).to.deep.equal([])

		phoneNumber = new PhoneNumber('599', '1234567', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries()).to.deep.equal(['CW', 'BQ'])

		phoneNumber = new PhoneNumber('599', '12345678', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries()).to.deep.equal(['CW'])

		phoneNumber = new PhoneNumber('599', '123456789', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries()).to.deep.equal([])
	})

	it('should return possible countries in case of ambiguity', () => {
		const phoneNumber = new PhoneNumber('1', '2223334444', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries().indexOf('US')).to.equal(0)
		expect(phoneNumber.getPossibleCountries().length).to.equal(25)
	})

	// it('should return empty possible countries when no national number has been input', () => {
	// 	const phoneNumber = new PhoneNumber('1', '', metadata)
	// 	expect(phoneNumber.country).toBe.undefined
	// 	phoneNumber.getPossibleCountries().should.deep.equal([])
	// })

	it('should return empty possible countries when not enough national number digits have been input', () => {
		const phoneNumber = new PhoneNumber('1', '222', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries()).to.deep.equal([])
	})

	it('should return possible countries in case of no ambiguity', () => {
		const phoneNumber = new PhoneNumber('US', '2133734253', metadata)
		expect(phoneNumber.country).to.equal('US')
		expect(phoneNumber.getPossibleCountries()).to.deep.equal(['US'])
	})

	it('should return empty possible countries in case of an unknown calling code', () => {
		const phoneNumber = new PhoneNumber('777', '123', metadata)
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.getPossibleCountries()).to.deep.equal([])
	})

	// it('should validate phone number length', () => {
	// 	const phoneNumber = new PhoneNumber('RU', '800', metadata)
	// 	expect(phoneNumber.validateLength()).to.equal('TOO_SHORT')
	//
	// 	const phoneNumberValid = new PhoneNumber('RU', '8005553535', metadata)
	// 	expect(phoneNumberValid.validateLength()).toBe.undefined
	// })
})
import _parsePhoneNumber from './parsePhoneNumber'
import metadata from '../metadata.min.json'

function parsePhoneNumber(...parameters)
{
	parameters.push(metadata)
	return _parsePhoneNumber.apply(this, parameters)
}

describe('parsePhoneNumber', () => {
	it('should parse phone numbers', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35.', 'RU')
		phoneNumber.country.should.equal('RU')
		phoneNumber.countryCallingCode.should.equal('7')
		phoneNumber.nationalNumber.should.equal('8005553535')
		phoneNumber.number.should.equal('+78005553535')
		phoneNumber.isPossible().should.equal(true)
		phoneNumber.isValid().should.equal(true)
		phoneNumber.getType().should.equal('TOLL_FREE')
	})

	it('shouldn\'t set country when it\'s non-derivable', () => {
		const phoneNumber = parsePhoneNumber('+7 111 555 35 35')
		expect(phoneNumber.country).to.be.undefined
		phoneNumber.countryCallingCode.should.equal('7')
		phoneNumber.nationalNumber.should.equal('1115553535')
	})

	it('should parse carrier code', () => {
		const phoneNumber = parsePhoneNumber('0 15 21 5555-5555', 'BR')
		phoneNumber.carrierCode.should.equal('15')
	})

	it('should parse phone extension', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35 ext. 1234.', 'RU')
		phoneNumber.ext.should.equal('1234')
	})

	it('should validate numbers for countries with no type regular expressions', () => {
		parsePhoneNumber('+380391234567').isValid().should.equal(true)
		parsePhoneNumber('+380191234567').isValid().should.equal(false)
	})

	it('should format numbers', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35.', 'RU')
		phoneNumber.format('NATIONAL').should.equal('8 (800) 555-35-35')
		phoneNumber.formatNational().should.equal('8 (800) 555-35-35')
		phoneNumber.format('INTERNATIONAL').should.equal('+7 800 555 35 35')
		phoneNumber.formatInternational().should.equal('+7 800 555 35 35')
	})

	it('should get tel: URI', () => {
		const phoneNumber = parsePhoneNumber('Phone: 8 (800) 555 35 35 ext. 1234.', 'RU')
		phoneNumber.getURI().should.equal('tel:+78005553535;ext=1234')
	})

	it('should throw errors', () => {
		expect(() => parsePhoneNumber('8005553535', 'XX')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('8', 'RU')).to.throw('NOT_A_NUMBER')
		// Won't throw here because the regexp already demands length > 1.
		// expect(() => parsePhoneNumber('11', 'RU')).to.throw('TOO_SHORT')
		expect(() => parsePhoneNumber('88888888888888888888', 'RU')).to.throw('TOO_LONG')
		expect(() => parsePhoneNumber('8 (800) 555 35 35')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('+9991112233')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('+9991112233', 'US')).to.throw('INVALID_COUNTRY')
		expect(() => parsePhoneNumber('8005553535                                                                                                                                                                                                                                                 ', 'RU')).to.throw('TOO_LONG')
	})
})
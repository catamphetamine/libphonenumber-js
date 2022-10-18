import findPhoneNumbersInText from './findPhoneNumbersInText.js'
import metadata from '../metadata.min.json' assert { type: 'json' }

describe('findPhoneNumbersInText', () => {
	it('should find phone numbers in text (with default country)', () => {
		findPhoneNumbersInText('+7 (800) 555-35-35', 'US', metadata)[0].number.number.should.equal('+78005553535')
	})

	it('should find phone numbers in text (with default country in options)', () => {
		findPhoneNumbersInText('+7 (800) 555-35-35', { defaultCountry: 'US' }, metadata)[0].number.number.should.equal('+78005553535')
	})

	it('should find phone numbers in text (with default country and options)', () => {
		findPhoneNumbersInText('+7 (800) 555-35-35', 'US', {}, metadata)[0].number.number.should.equal('+78005553535')
	})

	it('should find phone numbers in text (without default country, with options)', () => {
		findPhoneNumbersInText('+7 (800) 555-35-35', undefined, {}, metadata)[0].number.number.should.equal('+78005553535')
	})

	it('should find phone numbers in text (with default country, without options)', () => {
		findPhoneNumbersInText('+7 (800) 555-35-35', 'US', undefined, metadata)[0].number.number.should.equal('+78005553535')
	})

	it('should find phone numbers in text (with empty default country)', () => {
		findPhoneNumbersInText('+7 (800) 555-35-35', undefined, metadata)[0].number.number.should.equal('+78005553535')
	})

	it('should find phone numbers in text', () => {
		const NUMBERS = ['+78005553535', '+12133734253']
		const results = findPhoneNumbersInText('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', metadata)
		let i = 0
		while (i < results.length) {
			results[i].number.number.should.equal(NUMBERS[i])
			i++
		}
	})

	it('should find phone numbers in text (default country calling code)', () => {
		const NUMBERS = ['+870773111632']
		const results = findPhoneNumbersInText('The number is 773 111 632', { defaultCallingCode: '870' }, metadata)
		let i = 0
		while (i < results.length) {
			results[i].number.number.should.equal(NUMBERS[i])
			i++
		}
	})
})
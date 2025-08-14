import findPhoneNumbersInText from '../../../../source/findPhoneNumbersInText.js'
import metadata from '../metadata.min.json' with { type: 'json' }

describe('findPhoneNumbersInText', () => {
	it('should find phone numbers in text (with default country)', () => {
		expect(
            findPhoneNumbersInText('+7 (800) 555-35-35', 'US', metadata)[0].number.number
        ).to.equal('+78005553535')
	})

	it('should find phone numbers in text (with default country in options)', () => {
		expect(
            findPhoneNumbersInText('+7 (800) 555-35-35', { defaultCountry: 'US' }, metadata)[0].number.number
        ).to.equal('+78005553535')
	})

	it('should find phone numbers in text (with default country and options)', () => {
		expect(
            findPhoneNumbersInText('+7 (800) 555-35-35', 'US', {}, metadata)[0].number.number
        ).to.equal('+78005553535')
	})

	it('should find phone numbers in text (without default country, with options)', () => {
		expect(
            findPhoneNumbersInText('+7 (800) 555-35-35', undefined, {}, metadata)[0].number.number
        ).to.equal('+78005553535')
	})

	it('should find phone numbers in text (with default country, without options)', () => {
		expect(
            findPhoneNumbersInText('+7 (800) 555-35-35', 'US', undefined, metadata)[0].number.number
        ).to.equal('+78005553535')
	})

	it('should find phone numbers in text (with empty default country)', () => {
		expect(
            findPhoneNumbersInText('+7 (800) 555-35-35', undefined, metadata)[0].number.number
        ).to.equal('+78005553535')
	})

	it('should find phone numbers in text', () => {
		const NUMBERS = ['+78005553535', '+12133734253']
		const results = findPhoneNumbersInText('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', metadata)
		let i = 0
		while (i < results.length) {
			expect(results[i].number.number).to.equal(NUMBERS[i])
			i++
		}
	})
})
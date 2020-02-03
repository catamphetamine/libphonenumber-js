import searchPhoneNumbersInText from './searchPhoneNumbersInText'
import metadata from '../metadata.min.json'

describe('searchPhoneNumbersInText', () => {
	it('should find phone numbers (with default country)', () => {
		const NUMBERS = ['+78005553535', '+12133734253']
		for (const number of searchPhoneNumbersInText('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata)) {
			number.number.number.should.equal(NUMBERS[0])
			NUMBERS.shift()
		}
	})

	it('should find phone numbers', () => {
		const NUMBERS = ['+78005553535', '+12133734253']
		for (const number of searchPhoneNumbersInText('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', metadata)) {
			number.number.number.should.equal(NUMBERS[0])
			NUMBERS.shift()
		}
	})
})
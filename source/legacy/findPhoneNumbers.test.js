// This is a legacy function.
// Use `findNumbers()` instead.

import findNumbers, { searchPhoneNumbers } from './findPhoneNumbers.js'
import { PhoneNumberSearch } from './findPhoneNumbersInitialImplementation.js'
import metadata from '../../metadata.min.json' with { type: 'json' }

describe('findPhoneNumbers', () => {
	it('should find numbers', () => {
		expect(findNumbers('2133734253', 'US', metadata)).to.deep.equal([{
			phone    : '2133734253',
			country  : 'US',
			startsAt : 0,
			endsAt   : 10
		}])

		expect(findNumbers('(213) 373-4253', 'US', metadata)).to.deep.equal([{
			phone    : '2133734253',
			country  : 'US',
			startsAt : 0,
			endsAt   : 14
		}])

		expect(
            findNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}, {
			phone    : '2133734253',
			country  : 'US',
			startsAt : 41,
			endsAt   : 55
		}])

		// Opening parenthesis issue.
		// https://github.com/catamphetamine/libphonenumber-js/issues/252
		expect(
            findNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 (that\'s not even in the same country!) as written in the document.', 'US', metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}, {
			phone    : '2133734253',
			country  : 'US',
			startsAt : 41,
			endsAt   : 55
		}])

		// No default country.
		expect(
            findNumbers('The number is +7 (800) 555-35-35 as written in the document.', metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}])

		// Passing `options` and default country.
		expect(
            findNumbers('The number is +7 (800) 555-35-35 as written in the document.', 'US', { leniency: 'VALID' }, metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}])

		// Passing `options`.
		expect(
            findNumbers('The number is +7 (800) 555-35-35 as written in the document.', { leniency: 'VALID' }, metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}])

		// Not a phone number and a phone number.
		expect(
            findNumbers('Digits 12 are not a number, but +7 (800) 555-35-35 is.', { leniency: 'VALID' }, metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 32,
			endsAt   : 50
		}])

		// Phone number extension.
		expect(
            findNumbers('Date 02/17/2018 is not a number, but +7 (800) 555-35-35 ext. 123 is.', { leniency: 'VALID' }, metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			ext      : '123',
			startsAt : 37,
			endsAt   : 64
		}])
	})

	it('shouldn\'t find non-valid numbers', () => {
		// Not a valid phone number for US.
		expect(findNumbers('1111111111', 'US', metadata)).to.deep.equal([])
	})

	it('should find non-European digits', () => {
		// E.g. in Iraq they don't write `+442323234` but rather `+٤٤٢٣٢٣٢٣٤`.
		expect(findNumbers('العَرَبِيَّة‎ +٤٤٣٣٣٣٣٣٣٣٣٣عَرَبِيّ‎', metadata)).to.deep.equal([{
			country  : 'GB',
			phone    : '3333333333',
			startsAt : 14,
			endsAt   : 27
		}])
	})

	it('should iterate', () => {
		const expected_numbers = [{
			country : 'RU',
			phone   : '8005553535',
			// number   : '+7 (800) 555-35-35',
			startsAt : 14,
			endsAt   : 32
		}, {
			country : 'US',
			phone   : '2133734253',
			// number   : '(213) 373-4253',
			startsAt : 41,
			endsAt   : 55
		}]

		for (const number of searchPhoneNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata)) {
			expect(number).to.deep.equal(expected_numbers.shift())
		}

		expect(expected_numbers.length).to.equal(0)
	})

	it('should work in edge cases', () => {
		let thrower

		// No input
		expect(findNumbers('', metadata)).to.deep.equal([])

		// No country metadata for this `require` country code
		thrower = () => findNumbers('123', 'ZZ', metadata)
		expect(thrower).to.throw('Unknown country')

		// Numerical `value`
		thrower = () => findNumbers(2141111111, 'US')
		expect(thrower).to.throw('A text for parsing must be a string.')

		// // No metadata
		// thrower = () => findNumbers('')
		// thrower.should.throw('`metadata` argument not passed')
	})

	it('shouldn\'t find phone numbers which are not phone numbers', () => {
		// A timestamp.
		expect(findNumbers('2012-01-02 08:00', 'US', metadata)).to.deep.equal([])

		// A valid number (not a complete timestamp).
		expect(findNumbers('2012-01-02 08', 'US', metadata)).to.deep.equal([{
			country  : 'US',
			phone    : '2012010208',
			startsAt : 0,
			endsAt   : 13
		}])

		// Invalid parens.
		expect(findNumbers('213(3734253', 'US', metadata)).to.deep.equal([])

		// Letters after phone number.
		expect(findNumbers('2133734253a', 'US', metadata)).to.deep.equal([])

		// Valid phone (same as the one found in the UUID below).
		expect(findNumbers('The phone number is 231354125.', 'FR', metadata)).to.deep.equal([{
			country  : 'FR',
			phone    : '231354125',
			startsAt : 20,
			endsAt   : 29
		}])

		// Not a phone number (part of a UUID).
		// Should parse in `{ extended: true }` mode.
		const possibleNumbers = findNumbers('The UUID is CA801c26f98cd16e231354125ad046e40b.', 'FR', { extended: true }, metadata)
		expect(possibleNumbers.length).to.equal(3)
		expect(possibleNumbers[1].country).to.equal('FR')
		expect(possibleNumbers[1].phone).to.equal('231354125')

		// Not a phone number (part of a UUID).
		// Shouldn't parse by default.
		expect(
            findNumbers('The UUID is CA801c26f98cd16e231354125ad046e40b.', 'FR', metadata)
        ).to.deep.equal([])
	})
})

describe('PhoneNumberSearch', () => {
	it('should search for phone numbers', () => {
		const finder = new PhoneNumberSearch('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', { defaultCountry: 'US' }, metadata)

		expect(finder.hasNext()).to.equal(true)
		expect(finder.next()).to.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			// number   : '+7 (800) 555-35-35',
			startsAt : 14,
			endsAt   : 32
		})

		expect(finder.hasNext()).to.equal(true)
		expect(finder.next()).to.deep.equal({
			country : 'US',
			phone   : '2133734253',
			// number   : '(213) 373-4253',
			startsAt : 41,
			endsAt   : 55
		})

		expect(finder.hasNext()).to.equal(false)
	})

	it('should search for phone numbers (no options)', () => {
		const finder = new PhoneNumberSearch('The number is +7 (800) 555-35-35', undefined, metadata)
		expect(finder.hasNext()).to.equal(true)
		expect(finder.next()).to.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			// number   : '+7 (800) 555-35-35',
			startsAt : 14,
			endsAt   : 32
		})
		expect(finder.hasNext()).to.equal(false)
	})

	it('should work in edge cases', () => {
		// No options
		const search = new PhoneNumberSearch('', undefined, metadata)

		// No next element
		let thrower = () => search.next()
		expect(thrower).to.throw('No next element')
	})
})
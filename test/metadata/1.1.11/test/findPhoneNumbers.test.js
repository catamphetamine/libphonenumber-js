import findNumbers, { searchPhoneNumbers } from '../../../../source/legacy/findPhoneNumbers.js'
import { PhoneNumberSearch } from '../../../../source/legacy/findPhoneNumbersInitialImplementation.js'
import metadata from '../metadata.min.json' with { type: 'json' }

describe('findPhoneNumbers', () =>
{
	it('should find numbers', function()
	{
		expect(
            findNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata)
        ).to.deep.equal([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		},
		{
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

	it('should iterate', function()
	{
		const expected_numbers =
		[{
			country : 'RU',
			phone   : '8005553535',
			// number   : '+7 (800) 555-35-35',
			startsAt : 14,
			endsAt   : 32
		},
		{
			country : 'US',
			phone   : '2133734253',
			// number   : '(213) 373-4253',
			startsAt : 41,
			endsAt   : 55
		}]

		for (const number of searchPhoneNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata))
		{
			expect(number).to.deep.equal(expected_numbers.shift())
		}

		expect(expected_numbers.length).to.equal(0)
	})

	it('should work in edge cases', function()
	{
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
})

describe('PhoneNumberSearch', () =>
{
	it('should search for phone numbers', function()
	{
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

	it('should work in edge cases', function()
	{
		// No options
		const search = new PhoneNumberSearch('', undefined, metadata)

		// No next element
		let thrower = () => search.next()
		expect(thrower).to.throw('No next element')
	})
})
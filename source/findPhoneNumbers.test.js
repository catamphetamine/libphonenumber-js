import findNumbers, { extract_formatted_phone_numbers } from './findPhoneNumbers'
import metadata from '../metadata.min'

describe('findPhoneNumbers', () =>
{
	it('should find numbers', function()
	{
		findNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata).should.deep.equal
		([{
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
		findNumbers('The number is +7 (800) 555-35-35 as written in the document.', metadata).should.deep.equal
		([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}])

		// Passing `options` and default country.
		findNumbers('The number is +7 (800) 555-35-35 as written in the document.', 'US', { leniency: 'VALID' }, metadata).should.deep.equal
		([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}])

		// Passing `options`.
		findNumbers('The number is +7 (800) 555-35-35 as written in the document.', { leniency: 'VALID' }, metadata).should.deep.equal
		([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 14,
			endsAt   : 32
		}])

		// Not a phone number and a phone number.
		findNumbers('Digits 12 are not a number, but +7 (800) 555-35-35 is.', { leniency: 'VALID' }, metadata).should.deep.equal
		([{
			phone    : '8005553535',
			country  : 'RU',
			startsAt : 32,
			endsAt   : 50
		}])

		// Phone number extension.
		findNumbers('Date 02/17/2018 is not a number, but +7 (800) 555-35-35 ext. 123 is.', { leniency: 'VALID' }, metadata).should.deep.equal
		([{
			phone    : '8005553535',
			country  : 'RU',
			ext      : '123',
			startsAt : 37,
			endsAt   : 64
		}])
	})

	it('should work in edge cases', function()
	{
		let thrower

		// No input
		findNumbers('', metadata).should.deep.equal([])

		// No country metadata for this `require` country code
		thrower = () => findNumbers('123', 'ZZ', metadata)
		thrower.should.throw('Unknown country')

		// Numerical `value`
		thrower = () => findNumbers(2141111111, 'US')
		thrower.should.throw('A text for parsing must be a string.')

		// No metadata
		thrower = () => findNumbers('')
		thrower.should.throw('Metadata is required')
	})

	it('should extract formatted numbers', function()
	{
		extract_formatted_phone_numbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.').should.deep.equal
		([{
			number   : '+7 (800) 555-35-35',
			startsAt : 14
		},
		{
			number   : '(213) 373-4253',
			startsAt : 41
		}])
	})
})
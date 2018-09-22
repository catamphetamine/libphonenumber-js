import metadata from '../metadata.min.json'
import validate from '../../../../source/validate'

function is_valid_number(...parameters)
{
	parameters.push(metadata)
	return validate.apply(this, parameters)
}

describe('validate', () =>
{
	it('should validate phone numbers', function()
	{
		is_valid_number('+1-213-373-4253').should.equal(true)
		is_valid_number('+1-213-373').should.equal(false)

		is_valid_number('+1-213-373-4253', undefined).should.equal(true)

		is_valid_number('(213) 373-4253', 'US').should.equal(true)
		is_valid_number('(213) 37', 'US').should.equal(false)

		is_valid_number({ country: 'US', phone: '2133734253' }).should.equal(true)

		// No "types" info: should return `true`.
		is_valid_number('+380972423740').should.equal(true)

		is_valid_number('0912345678', 'TW').should.equal(true)
	})

	it('should refine phone number validation in case extended regular expressions are set for a country', () =>
	{
		// Germany general validation must pass
		is_valid_number('123456', 'DE').should.equal(true)
		is_valid_number('0123456', 'DE').should.equal(true)

		// Extra regular expressions for precise national number validation.
		// `types` index in compressed array is `9`
		metadata.countries.DE[10] =
		[
         ["[246]\\d{5,13}|3(?:0\\d{3,13}|2\\d{9}|[3-9]\\d{4,13})|5(?:0[2-8]|[1256]\\d|[38][0-8]|4\\d{0,2}|[79][0-7])\\d{3,11}|7(?:0[2-8]|[1-9]\\d)\\d{3,10}|8(?:0[2-9]|[1-9]\\d)\\d{3,10}|9(?:0[6-9]\\d{3,10}|1\\d{4,12}|[2-9]\\d{4,11})"],
         ["1(?:5[0-25-9]\\d{8}|6[023]\\d{7,8}|7(?:[0-57-9]\\d?|6\\d)\\d{7})"],
         ["800\\d{7,12}"],
         ["137[7-9]\\d{6}|900(?:[135]\\d{6}|9\\d{7})"],
         ["700\\d{8}"],
         ["1(?:5(?:(?:2\\d55|7\\d99|9\\d33)\\d{7}|(?:[034568]00|113)\\d{8})|6(?:013|255|399)\\d{7,8}|7(?:[015]13|[234]55|[69]33|[78]99)\\d{7,8})"],
         ["18(?:1\\d{5,11}|[2-9]\\d{8})"],
         ["16(?:4\\d{1,10}|[89]\\d{1,11})"]
      ]

		// Germany extended validation must not pass for an invalid phone number
		is_valid_number('123456', 'DE').should.equal(false)
		is_valid_number('0123456', 'DE').should.equal(false)

		// // Germany extended validation must pass for a valid phone number,
		// // but still must demand the national prefix (`0`).
		// // https://github.com/catamphetamine/libphonenumber-js/issues/6
		// is_valid_number('30123456', 'DE').should.equal(false)
		is_valid_number('030123456', 'DE').should.equal(true)
	})

	it('should work in edge cases', function()
	{
		// No metadata
		let thrower = () => validate('+78005553535')
		thrower.should.throw('`metadata` argument not passed')

		// Non-phone-number characters in a phone number
		is_valid_number('+499821958a').should.equal(false)
		is_valid_number('88005553535x', 'RU').should.equal(false)

		// Numerical `value`
		thrower = () => is_valid_number(88005553535, 'RU')
		thrower.should.throw('A phone number must either be a string or an object of shape { phone, [country] }.')

		// Long country phone code
		is_valid_number('+3725555555').should.equal(true)

		// Invalid country
		thrower = () => is_valid_number({ phone: '8005553535', country: 'RUS' })
		thrower.should.throw('Unknown country')
	})

	it('should accept phone number extensions', function()
	{
		// International
		is_valid_number('+12133734253 ext. 123').should.equal(true)
		// National
		is_valid_number('88005553535 x123', 'RU').should.equal(true)
	})
})
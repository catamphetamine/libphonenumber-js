import metadata from '../metadata.min.json' with { type: 'json' }
import formatter from '../../../../source/legacy/format.js'

function format(...parameters)
{
	parameters.push(metadata)
	return formatter.apply(this, parameters)
}

describe('format', () =>
{
	it('should work with the first object argument expanded', function()
	{
		expect(format('+12133734253', 'National')).to.equal('(213) 373-4253')
		expect(format('2133734253', 'US', 'International')).to.equal('+1 213 373 4253')
	})

	it('should sort out the arguments', function()
	{
		const options =
		{
			formatExtension: (number, extension) => `${number} доб. ${extension}`
		}

		expect(format
		({
			phone   : '8005553535',
			country : 'RU',
			ext     : '123'
		},
		'National', options)).to.equal('8 (800) 555-35-35 доб. 123')

		expect(format('+78005553535', 'National', options)).to.equal('8 (800) 555-35-35')
		expect(format('8005553535', 'RU', 'National', options)).to.equal('8 (800) 555-35-35')
	})

	it('should format valid phone numbers', function()
	{
		// Switzerland
		expect(format({ country: 'CH', phone: '446681800' }, 'International')).to.equal('+41 44 668 18 00')
		expect(format({ country: 'CH', phone: '446681800' }, 'E.164')).to.equal('+41446681800')
		expect(format({ country: 'CH', phone: '446681800' }, 'RFC3966')).to.equal('tel:+41446681800')
		expect(format({ country: 'CH', phone: '446681800' }, 'National')).to.equal('044 668 18 00')

		// France
		expect(format({ country: 'FR', phone: '169454850' }, 'National')).to.equal('01 69 45 48 50')

		// KZ
		expect(format('+7 702 211 1111', 'National')).to.equal('8 (702) 211 1111')
	})

	it('should work in edge cases', function()
	{
		let thrower

		// // Explicitly specified country and derived country conflict
		// format('+12133734253', 'RU', 'National').should.equal('+12133734253')

		// No phone number
		expect(format('', 'RU', 'International')).to.equal('')
		expect(format('', 'RU', 'National')).to.equal('')

		// No suitable format
		expect(format('+121337342530', 'US', 'National')).to.equal('21337342530')
		// No suitable format (leading digits mismatch)
		expect(format('699999', 'AD', 'National')).to.equal('699999')

		// Numerical `value`
		thrower = () => format(89150000000, 'RU', 'National')
		expect(thrower).to.throw(
            'A phone number must either be a string or an object of shape { phone, [country] }.'
        )

		// // No metadata for country
		// format('+121337342530', 'USA', 'National').should.equal('21337342530')
		// format('21337342530', 'USA', 'National').should.equal('21337342530')

		// No format type
		thrower = () => format('+123')
		expect(thrower).to.throw('`format` argument not passed')

		// Unknown format type
		thrower = () => format('123', 'US', 'Gay')
		expect(thrower).to.throw('Unknown "format" argument')

		// // No metadata
		// thrower = () => formatter('123', 'US', 'E.164')
		// thrower.should.throw('`metadata` argument not passed')

		// No formats
		expect(format('012345', 'AC', 'National')).to.equal('012345')
	})

	it('should format phone number extensions', function()
	{
		// National
		expect(format
		({
			country: 'US',
			phone: '2133734253',
			ext: '123'
		},
		'National')).to.equal('(213) 373-4253 ext. 123')

		// International
		expect(format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'International')).to.equal('+1 213 373 4253 ext. 123')

		// International
		expect(format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'International')).to.equal('+1 213 373 4253 ext. 123')

		// E.164
		expect(format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'E.164')).to.equal('+12133734253')

		// RFC3966
		expect(format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'RFC3966')).to.equal('tel:+12133734253;ext=123')
	})

	it('should format possible numbers', function()
	{
		expect(format({ countryCallingCode: '7', phone: '1111111111' }, 'E.164')).to.equal('+71111111111')
	})
})
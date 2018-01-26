import metadata from '../metadata.min'

import
{
	get_type_fixed_line,
	get_country_phone_code
}
from '../source/metadata'

describe('metadata', () =>
{
	it('should return undefined for non-defined types', function()
	{
		type(get_type_fixed_line(metadata.countries.FR)).should.equal('undefined')
	})

	it('should get country phone code', function()
	{
		get_country_phone_code('RU', metadata.countries).should.equal('7')
	})
})

function type(something)
{
	return typeof something
}
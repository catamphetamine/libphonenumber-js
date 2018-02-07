import metadata from '../metadata.min'

import
{
	get_type_fixed_line
}
from '../source/metadata'

describe('metadata', () =>
{
	it('should return undefined for non-defined types', function()
	{
		type(get_type_fixed_line(metadata.countries.FR)).should.equal('undefined')
	})
})

function type(something)
{
	return typeof something
}
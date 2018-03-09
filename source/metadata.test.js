import metadata from '../metadata.min'

import Metadata from './metadata'

describe('metadata', () =>
{
	it('should return undefined for non-defined types', function()
	{
		const FR = new Metadata(metadata).country('FR')
		console.log(FR.type('FIXED_LINE'))
		type(FR.type('FIXED_LINE')).should.equal('undefined')
	})

	it('should validate country', function()
	{
		const thrower = () => new Metadata(metadata).country('RUS')
		thrower.should.throw('Unknown country')
	})
})

function type(something)
{
	return typeof something
}
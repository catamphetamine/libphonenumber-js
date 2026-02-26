import { describe, it } from 'mocha'
import { expect } from 'chai'

import metadata from './metadata.min.json' with { type: 'json' }

import Metadata from '../../../source/metadata.js'

describe('metadata', () =>
{
	it('should return undefined for non-defined types', function()
	{
		const FR = new Metadata(metadata).country('FR')
		expect(type(FR.type('FIXED_LINE'))).to.equal('undefined')
	})
})

function type(something)
{
	return typeof something
}
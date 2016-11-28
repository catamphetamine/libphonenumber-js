import chai, { expect } from 'chai'
chai.should()

import is_valid_number from '../source/validate'

describe('validate', () =>
{
	it('should validate phone numbers', function()
	{
		is_valid_number('+1-213-373-4253').should.equal(true)
		is_valid_number('+1-213-373').should.equal(false)
		is_valid_number('(213) 373-4253', 'US').should.equal(true)
		is_valid_number('(213) 37', 'US').should.equal(false)
	})
})
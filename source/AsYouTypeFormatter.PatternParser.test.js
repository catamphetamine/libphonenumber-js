import PatternParser from './AsYouTypeFormatter.PatternParser.js'

describe('PatternParser', function() {
	it('should parse single-character patterns', function() {
		expect(new PatternParser().parse('2')).to.equal('2')
	})

	it('should parse string patterns', function() {
		expect(new PatternParser().parse('123')).to.deep.equal(['1', '2', '3'])
	})

	it('should parse "one of" patterns', function() {
		expect(new PatternParser().parse('[5-9]')).to.deep.equal({
			op: '[]',
			args: ['5', '6', '7', '8', '9']
		})
	})

	it('should parse "or" patterns', function() {
		expect(new PatternParser().parse('123|[5-9]')).to.deep.equal({
			op: '|',
			args: [
				['1', '2', '3'],
				{
					op: '[]',
					args: ['5', '6', '7', '8', '9']
				}
			]
		})

		expect(new PatternParser().parse('123|[5-9]0')).to.deep.equal({
			op: '|',
			args: [
				['1', '2', '3'],
				[
					{
						op: '[]',
						args: ['5', '6', '7', '8', '9']
					},
					'0'
				]
			]
		})
	})

	it('should parse nested "or" patterns', function() {
		expect(new PatternParser().parse('123|(?:2|34)[5-9]')).to.deep.equal({
			op: '|',
			args: [
				['1', '2', '3'],
				[
					{
						op: '|',
						args: [
							'2',
							['3', '4']
						]
					},
					{
						op: '[]',
						args: ['5', '6', '7', '8', '9']
					}
				]
			]
		})
	})
})
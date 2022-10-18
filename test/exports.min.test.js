import parse, {
	ParseError,
	parsePhoneNumber,
	parsePhoneNumberWithError,
	parsePhoneNumberFromString,

	isValidPhoneNumber,
	isPossiblePhoneNumber,
	validatePhoneNumberLength,

	findNumbers,
	searchNumbers,
	findPhoneNumbersInText,
	searchPhoneNumbersInText,
	PhoneNumberMatcher,

	AsYouType,

	Metadata,
	isSupportedCountry,
	getCountries,
	getCountryCallingCode,
	getExtPrefix,

	formatIncompletePhoneNumber,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	getExampleNumber,

	parseRFC3966,
	formatRFC3966
} from '../min/index.js'

import Library from '../min/index.cjs'

import examples from '../examples.mobile.json' assert { type: 'json' }

describe('exports/min', () => {
	it('should export ES6', () => {
		expect(ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		parsePhoneNumber('+12133734253').nationalNumber.should.equal('2133734253')
		parsePhoneNumber('2133734253', 'US').nationalNumber.should.equal('2133734253')
		parsePhoneNumber('2133734253', { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')
		parsePhoneNumber('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')

		parsePhoneNumberWithError('+12133734253').nationalNumber.should.equal('2133734253')
		parsePhoneNumberWithError('2133734253', 'US').nationalNumber.should.equal('2133734253')
		parsePhoneNumberWithError('2133734253', { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')
		parsePhoneNumberWithError('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')

		parse('+12133734253').nationalNumber.should.equal('2133734253')

		parsePhoneNumberFromString('+12133734253').nationalNumber.should.equal('2133734253')
		expect(parsePhoneNumberFromString('2133734253')).to.be.undefined

		// Test "min" metadata.
		expect(parsePhoneNumber('9150000000', 'RU').getType()).to.be.undefined
		expect(parsePhoneNumber('91187654321', 'AR').getType()).to.be.undefined
		expect(parsePhoneNumber('51234567', 'EE').getType()).to.be.undefined

		isValidPhoneNumber('+12133734253').should.equal(true)
		isPossiblePhoneNumber('+12133734253').should.equal(true)
		expect(validatePhoneNumberLength('+12133734253')).to.be.undefined

		findNumbers('+12133734253').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		findNumbers('2133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 10 }])
		findNumbers('2133734253', { defaultCountry: 'US' }).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 10 }])
		findNumbers('2133734253', undefined, { defaultCountry: 'US' }).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 10 }])

		searchNumbers('+12133734253')[Symbol.iterator]().next.should.be.a('function')
		searchNumbers('2133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		searchNumbers('2133734253', { defaultCountry: 'US' })[Symbol.iterator]().next.should.be.a('function')
		searchNumbers('2133734253', undefined, { defaultCountry: 'US' })[Symbol.iterator]().next.should.be.a('function')

		findPhoneNumbersInText('+12133734253')[0].number.number.should.equal('+12133734253')
		searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next.should.be.a('function')

		new PhoneNumberMatcher('+12133734253').find.should.be.a('function')

		new AsYouType().input('+12133734253').should.equal('+1 213 373 4253')
		new AsYouType('US').input('2133734253').should.equal('(213) 373-4253')

		isSupportedCountry('KZ').should.equal(true)
		expect(getCountries().indexOf('KZ') > 0).to.be.true
		getCountryCallingCode('KZ').should.equal('7')
		getExtPrefix('US').should.equal(' ext. ')

		formatIncompletePhoneNumber('+121337342').should.deep.equal('+1 213 373 42')
		formatIncompletePhoneNumber('21337342', 'US').should.deep.equal('(213) 373-42')

		parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
		parsePhoneNumberCharacter('+').should.equal('+')
		parseDigits('+123').should.equal('123')

		new Metadata().getCountryCodeForCallingCode('1').should.equal('US')
		getExampleNumber('RU', examples).nationalNumber.should.equal('9123456789')

		parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')
	})

	it('should export CommonJS', () => {
		expect(Library.ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		Library.parsePhoneNumber('+12133734253').nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumber('2133734253', 'US').nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumber('2133734253', { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumber('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')

		Library.parsePhoneNumberWithError('+12133734253').nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumberWithError('2133734253', 'US').nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumberWithError('2133734253', { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumberWithError('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber.should.equal('2133734253')

		Library('+12133734253').nationalNumber.should.equal('2133734253')
		Library.default('+12133734253').nationalNumber.should.equal('2133734253')

		Library.parsePhoneNumberFromString('+12133734253').nationalNumber.should.equal('2133734253')
		expect(Library.parsePhoneNumberFromString('2133734253')).to.be.undefined

		Library.isValidPhoneNumber('+12133734253').should.equal(true)
		Library.isPossiblePhoneNumber('+12133734253').should.equal(true)
		expect(Library.validatePhoneNumberLength('+12133734253')).to.be.undefined

		Library.findNumbers('+12133734253').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		Library.findNumbers('2133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 10 }])
		Library.findNumbers('2133734253', { defaultCountry: 'US' }).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 10 }])
		Library.findNumbers('2133734253', undefined, { defaultCountry: 'US' }).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 10 }])

		Library.searchNumbers('+12133734253')[Symbol.iterator]().next.should.be.a('function')
		Library.searchNumbers('2133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		Library.searchNumbers('2133734253', { defaultCountry: 'US' })[Symbol.iterator]().next.should.be.a('function')
		Library.searchNumbers('2133734253', undefined, { defaultCountry: 'US' })[Symbol.iterator]().next.should.be.a('function')

		Library.findPhoneNumbersInText('+12133734253')[0].number.number.should.equal('+12133734253')
		Library.searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next.should.be.a('function')

		new Library.PhoneNumberMatcher('+12133734253', undefined).find.should.be.a('function')

		new Library.AsYouType().input('+12133734253').should.equal('+1 213 373 4253')
		new Library.AsYouType('US').input('2133734253').should.equal('(213) 373-4253')

		Library.isSupportedCountry('KZ').should.equal(true)
		expect(Library.getCountries().indexOf('KZ') > 0).to.be.true
		Library.getCountryCallingCode('KZ').should.equal('7')
		Library.getExtPrefix('US').should.equal(' ext. ')

		Library.formatIncompletePhoneNumber('+121337342').should.deep.equal('+1 213 373 42')
		Library.formatIncompletePhoneNumber('21337342', 'US').should.deep.equal('(213) 373-42')

		Library.parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
		Library.parsePhoneNumberCharacter('+').should.equal('+')
		Library.parseDigits('+123').should.equal('123')

		Library.getExampleNumber('RU', examples).nationalNumber.should.equal('9123456789')

		Library.parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		Library.formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')
	})
})
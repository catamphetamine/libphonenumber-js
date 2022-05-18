import defaultExportParse,
{
	ParseError,
	parsePhoneNumber,
	parsePhoneNumberWithError,
	parsePhoneNumberFromString,

	isValidPhoneNumber,
	isPossiblePhoneNumber,
	validatePhoneNumberLength,

	// Deprecated: `format()` was renamed to `formatNumber()`.
	format,
	formatNumber,
	// Deprecated: `parse()` was renamed to `parseNumber()`.
	parse,
	parseNumber,
	getNumberType,
	isPossibleNumber,
	isValidNumber,
	isValidNumberForRegion,

	Metadata,
	getExampleNumber,

	// Deprecated
	findPhoneNumbers,
	searchPhoneNumbers,
	PhoneNumberSearch,

	findNumbers,
	searchNumbers,
	findPhoneNumbersInText,
	searchPhoneNumbersInText,
	PhoneNumberMatcher,

	AsYouType,
	getCountries,
	getCountryCallingCode,
	// `getPhoneCode` name is deprecated.
	getPhoneCode,

	// Deprecated.
	formatCustom,
	parseCustom,
	getNumberTypeCustom,
	isValidNumberCustom,
	searchPhoneNumbersCustom,
	findPhoneNumbersCustom,
	PhoneNumberSearchCustom,
	getCountryCallingCodeCustom,
	// `getPhoneCodeCustom` name is deprecated.
	getPhoneCodeCustom,

	formatIncompletePhoneNumber,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	isSupportedCountry,
	getExtPrefix,
	parseRFC3966,
	formatRFC3966,

	DIGIT_PLACEHOLDER,
	DIGITS
}
from '../index.js'

import Library from '../index.cjs'

import metadata from '../metadata.min.json'
import examples from '../examples.mobile.json'

describe(`exports`, () => {
	it(`should export ES6`, () => {
		defaultExportParse('+12133734253').nationalNumber.should.equal('2133734253')

		expect(ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		parsePhoneNumber('+12133734253').nationalNumber.should.equal('2133734253')
		parsePhoneNumberWithError('+12133734253').nationalNumber.should.equal('2133734253')

		parsePhoneNumberFromString('+12133734253').nationalNumber.should.equal('2133734253')

		isValidPhoneNumber('+12133734253').should.equal(true)
		isPossiblePhoneNumber('+12133734253').should.equal(true)
		expect(validatePhoneNumberLength('+12133734253')).to.be.undefined

		// Deprecated: `parse()` was renamed to `parseNumber()`.
		parse('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		parseNumber('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		// Deprecated: `format()` was renamed to `formatNumber()`.
		format('2133734253', 'US', 'E.164').should.equal('+12133734253')
		formatNumber('2133734253', 'US', 'E.164').should.equal('+12133734253')
		getNumberType('2133734253', 'US').should.equal('FIXED_LINE_OR_MOBILE')
		isPossibleNumber('+12133734253', 'US').should.equal(true)
		isValidNumber('+12133734253', 'US').should.equal(true)
		isValidNumberForRegion('+12133734253', 'US').should.equal(true)

		new Metadata().getCountryCodeForCallingCode('1').should.equal('US')
		getExampleNumber('RU', examples).nationalNumber.should.equal('9123456789')

		// Deprecated.
		findPhoneNumbers('+12133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		searchPhoneNumbers('+12133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		new PhoneNumberSearch('+12133734253', undefined).find.should.be.a('function')

		findNumbers('+12133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		searchNumbers('+12133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		findPhoneNumbersInText('+12133734253')[0].number.number.should.equal('+12133734253')
		searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next.should.be.a('function')
		new PhoneNumberMatcher('+12133734253', undefined).find.should.be.a('function')

		new AsYouType('US').input('+12133734253').should.equal('+1 213 373 4253')

		DIGIT_PLACEHOLDER.should.equal('x')
		Object.keys(DIGITS).length.should.be.above(0)

		// `getPhoneCode` name is deprecated.
		getPhoneCode('KZ').should.equal('7')
		expect(getCountries().indexOf('KZ') > 0).to.be.true
		getCountryCallingCode('KZ').should.equal('7')

		isSupportedCountry('US', metadata).should.equal(true)
		getExtPrefix('US', metadata).should.equal(' ext. ')
		parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')

		formatIncompletePhoneNumber('+121337342').should.deep.equal('+1 213 373 42')
		parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
		parsePhoneNumberCharacter('+').should.equal('+')
		parseDigits('+123').should.equal('123')
	})

	// Deprecated exports: remove in `2.0.0`.
	it(`should export ES6 custom functions`, () => {
		parseCustom('+12133734253', metadata).should.deep.equal({ country: 'US', phone: '2133734253' })
		formatCustom('2133734253', 'US', 'E.164', metadata).should.equal('+12133734253')
		getNumberTypeCustom('2133734253', 'US', metadata).should.equal('FIXED_LINE_OR_MOBILE')
		isValidNumberCustom('', 'US', metadata)
		findPhoneNumbers('', 'US', metadata)
		searchPhoneNumbers('', 'US', metadata)
		new PhoneNumberSearchCustom('', metadata)
		// `getPhoneCode` name is deprecated.
		getPhoneCodeCustom('KZ', metadata)
		getCountryCallingCodeCustom('KZ', metadata)
	})

	it(`should export CommonJS`, () => {
		Library('+12133734253').nationalNumber.should.equal('2133734253')
		Library.default('+12133734253').nationalNumber.should.equal('2133734253')

		expect(Library.ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		Library.parsePhoneNumber('+12133734253').nationalNumber.should.equal('2133734253')
		Library.parsePhoneNumberWithError('+12133734253').nationalNumber.should.equal('2133734253')

		Library.parsePhoneNumberFromString('+12133734253').nationalNumber.should.equal('2133734253')

		// Deprecated: `parse()` was renamed to `parseNumber()`.
		Library.parse('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		Library.parseNumber('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		// Deprecated: `format()` was renamed to `formatNumber()`.
		Library.format('2133734253', 'US', 'E.164').should.equal('+12133734253')
		Library.formatNumber('2133734253', 'US', 'E.164').should.equal('+12133734253')
		Library.getNumberType('2133734253', 'US').should.equal('FIXED_LINE_OR_MOBILE')
		Library.isPossibleNumber('+12133734253', 'US').should.equal(true)
		Library.isValidNumber('+12133734253', 'US').should.equal(true)
		Library.isValidNumberForRegion('+12133734253', 'US').should.equal(true)

		Library.isValidPhoneNumber('+12133734253').should.equal(true)
		Library.isPossiblePhoneNumber('+12133734253').should.equal(true)
		expect(Library.validatePhoneNumberLength('+12133734253')).to.be.undefined

		new Library.Metadata().getCountryCodeForCallingCode('1').should.equal('US')
		Library.getExampleNumber('RU', examples).nationalNumber.should.equal('9123456789')

		// Deprecated.
		Library.findPhoneNumbers('+12133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		Library.searchPhoneNumbers('+12133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		new Library.PhoneNumberSearch('+12133734253', undefined).find.should.be.a('function')

		Library.findNumbers('+12133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		Library.searchNumbers('+12133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		Library.findPhoneNumbersInText('+12133734253')[0].number.number.should.equal('+12133734253')
		Library.searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next.should.be.a('function')
		new Library.PhoneNumberMatcher('+12133734253', undefined).find.should.be.a('function')

		new Library.AsYouType('US').input('+12133734253').should.equal('+1 213 373 4253')

		Library.DIGIT_PLACEHOLDER.should.equal('x')
		Object.keys(Library.DIGITS).length.should.be.above(0)

		// `getPhoneCode` name is deprecated.
		Library.getPhoneCode('KZ').should.equal('7')
		expect(Library.getCountries().indexOf('KZ') > 0).to.be.true
		Library.getCountryCallingCode('KZ').should.equal('7')

		Library.isSupportedCountry('US').should.equal(true)
		Library.getExtPrefix('US').should.equal(' ext. ')

		Library.parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		Library.formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')

		Library.formatIncompletePhoneNumber('+121337342').should.deep.equal('+1 213 373 42')
		Library.parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
		Library.parsePhoneNumberCharacter('+').should.equal('+')
		Library.parseDigits('+123').should.equal('123')
	})

	// it(`should export CommonJS custom functions`, () => {
	// 	const Library = require('../custom.js')

	// 	expect(Library.ParseError).to.be.a('function')

	// 	// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
	// 	Library.parsePhoneNumber('+12133734253', metadata).nationalNumber.should.equal('2133734253')
	// 	Library.parsePhoneNumberWithError('+12133734253', metadata).nationalNumber.should.equal('2133734253')

	// 	Library.parsePhoneNumberFromString('+12133734253', metadata).nationalNumber.should.equal('2133734253')

	// 	// Deprecated: `parse()` was renamed to `parseNumber()`.
	// 	Library.parse('+12133734253', metadata).should.deep.equal({ country: 'US', phone: '2133734253' })
	// 	Library.parseNumber('+12133734253', metadata).should.deep.equal({ country: 'US', phone: '2133734253' })
	// 	// Deprecated: `format()` was renamed to `formatNumber()`.
	// 	Library.format('2133734253', 'US', 'E.164', metadata).should.equal('+12133734253')
	// 	Library.formatNumber('2133734253', 'US', 'E.164', metadata).should.equal('+12133734253')
	// 	Library.getNumberType('2133734253', 'US', metadata).should.equal('FIXED_LINE_OR_MOBILE')
	// 	Library.getExampleNumber('RU', examples, metadata).nationalNumber.should.equal('9123456789')
	// 	Library.isPossibleNumber('+12133734253', 'US', metadata).should.equal(true)
	// 	Library.isValidNumber('+12133734253', 'US', metadata).should.equal(true)
	// 	Library.isValidNumberForRegion('+12133734253', 'US', metadata).should.equal(true)

	// 	// Deprecated.
	// 	Library.findPhoneNumbers('+12133734253', 'US', metadata).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
	// 	Library.searchPhoneNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next.should.be.a('function')
	// 	new Library.PhoneNumberSearch('+12133734253', undefined, metadata).find.should.be.a('function')

	// 	Library.findNumbers('+12133734253', 'US', metadata).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
	// 	Library.searchNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next.should.be.a('function')
	// 	new Library.PhoneNumberMatcher('+12133734253', undefined, metadata).find.should.be.a('function')

	// 	// `getPhoneCode` name is deprecated.
	// 	Library.getPhoneCode('KZ', metadata).should.equal('7')
	// 	Library.getCountryCallingCode('KZ', metadata).should.equal('7')
	// 	new Library.AsYouType('US', metadata).input('+12133734253').should.equal('+1 213 373 4253')
	// 	Library.isSupportedCountry('US', metadata).should.equal(true)
	// 	Library.getExtPrefix('US', metadata).should.equal(' ext. ')
	// 	Library.parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
	// 	Library.formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')

	// 	Library.formatIncompletePhoneNumber('+121337342', null, metadata).should.deep.equal('+1 213 373 42')
	// 	Library.parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
	// 	Library.parsePhoneNumberCharacter('+').should.equal('+')
	// 	Library.parseDigits('+123').should.equal('123')
	// })
})
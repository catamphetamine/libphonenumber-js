import { describe, it } from 'mocha'
import { expect } from 'chai'

import defaultExportParse, {
	PhoneNumber,
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
} from '../../index.js'

import Library from '../../index.cjs'

import metadata from '../../metadata.min.json' with { type: 'json' }
import examples from '../../examples.mobile.json' with { type: 'json' }

describe(`exports`, () => {
	it(`should export ES6`, () => {
		expect(defaultExportParse('+12133734253').nationalNumber).to.equal('2133734253')

		expect(new PhoneNumber('+12133734253').formatNational).to.be.a('function')
		expect(ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		expect(parsePhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumberWithError('+12133734253').nationalNumber).to.equal('2133734253')

		expect(parsePhoneNumberFromString('+12133734253').nationalNumber).to.equal('2133734253')

		expect(isValidPhoneNumber('+12133734253')).to.equal(true)
		expect(isPossiblePhoneNumber('+12133734253')).to.equal(true)
		expect(validatePhoneNumberLength('+12133734253')).to.be.undefined

		// Deprecated: `parse()` was renamed to `parseNumber()`.
		expect(parse('+12133734253').phone).to.equal('2133734253')
		expect(parseNumber('+12133734253').phone).to.equal('2133734253')
		// Deprecated: `format()` was renamed to `formatNumber()`.
		expect(format('2133734253', 'US', 'E.164')).to.equal('+12133734253')
		expect(formatNumber('2133734253', 'US', 'E.164')).to.equal('+12133734253')
		expect(getNumberType('2133734253', 'US')).to.equal('FIXED_LINE_OR_MOBILE')
		expect(isPossibleNumber('+12133734253', 'US')).to.equal(true)
		expect(isValidNumber('+12133734253', 'US')).to.equal(true)
		expect(isValidNumberForRegion('+12133734253', 'US')).to.equal(true)

		expect(new Metadata().getCountryCodeForCallingCode('1')).to.equal('US')
		expect(getExampleNumber('RU', examples).nationalNumber).to.equal('9123456789')

		// Deprecated.
		expect(findPhoneNumbers('+12133734253', 'US')[0].endsAt).to.equal(12)
		expect(searchPhoneNumbers('+12133734253', 'US')[Symbol.iterator]().next).to.be.a('function')
		expect(new PhoneNumberSearch('+12133734253', undefined).find).to.be.a('function')

		expect(findNumbers('+12133734253', 'US')[0].endsAt).to.equal(12)
		expect(searchNumbers('+12133734253', 'US')[Symbol.iterator]().next).to.be.a('function')
		expect(findPhoneNumbersInText('+12133734253')[0].number.number).to.equal('+12133734253')
		expect(searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next).to.be.a('function')
		expect(new PhoneNumberMatcher('+12133734253', undefined).find).to.be.a('function')

		expect(new AsYouType('US').input('+12133734253')).to.equal('+1 213 373 4253')

		expect(DIGIT_PLACEHOLDER).to.equal('x')
		expect(Object.keys(DIGITS).length > 0).to.equal(true)

		// `getPhoneCode` name is deprecated.
		expect(getPhoneCode('KZ')).to.equal('7')
		expect(getCountries().indexOf('KZ') > 0).to.equal(true)
		expect(getCountryCallingCode('KZ')).to.equal('7')

		expect(isSupportedCountry('US', metadata)).to.equal(true)
		expect(getExtPrefix('US', metadata)).to.equal(' ext. ')
		expect(parseRFC3966('tel:+12133734253').number).to.equal('+12133734253')
		expect(formatRFC3966({ number: '+12133734253' })).to.equal('tel:+12133734253')

		expect(formatIncompletePhoneNumber('+121337342')).to.equal('+1 213 373 42')
		expect(parseIncompletePhoneNumber('+1 213 373 42')).to.equal('+121337342')
		expect(parsePhoneNumberCharacter('+')).to.equal('+')
		expect(parseDigits('+123')).to.equal('123')
	})

	// Deprecated exports: remove in `2.0.0`.
	it(`should export ES6 custom functions`, () => {
		expect(parseCustom('+12133734253', metadata).phone).to.equal('2133734253')
		expect(formatCustom('2133734253', 'US', 'E.164', metadata)).to.equal('+12133734253')
		expect(getNumberTypeCustom('2133734253', 'US', metadata)).to.equal('FIXED_LINE_OR_MOBILE')
		isValidNumberCustom('', 'US', metadata)
		findPhoneNumbers('', 'US', metadata)
		searchPhoneNumbers('', 'US', metadata)
		new PhoneNumber('+7800', metadata)
		new PhoneNumberSearchCustom('', metadata)
		// `getPhoneCode` name is deprecated.
		getPhoneCodeCustom('KZ', metadata)
		getCountryCallingCodeCustom('KZ', metadata)
	})

	it(`should export CommonJS`, () => {
		expect(Library('+12133734253').nationalNumber).to.equal('2133734253')
		expect(Library.default('+12133734253').nationalNumber).to.equal('2133734253')

		expect(new Library.PhoneNumber('+12133734253').formatNational).to.be.a('function')
		expect(Library.ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		expect(Library.parsePhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(Library.parsePhoneNumberWithError('+12133734253').nationalNumber).to.equal('2133734253')

		expect(Library.parsePhoneNumberFromString('+12133734253').nationalNumber).to.equal('2133734253')

		// Deprecated: `parse()` was renamed to `parseNumber()`.
		expect(Library.parse('+12133734253').phone).to.equal('2133734253')
		expect(Library.parseNumber('+12133734253').phone).to.equal('2133734253')
		// Deprecated: `format()` was renamed to `formatNumber()`.
		expect(Library.format('2133734253', 'US', 'E.164')).to.equal('+12133734253')
		expect(Library.formatNumber('2133734253', 'US', 'E.164')).to.equal('+12133734253')
		expect(Library.getNumberType('2133734253', 'US')).to.equal('FIXED_LINE_OR_MOBILE')
		expect(Library.isPossibleNumber('+12133734253', 'US')).to.equal(true)
		expect(Library.isValidNumber('+12133734253', 'US')).to.equal(true)
		expect(Library.isValidNumberForRegion('+12133734253', 'US')).to.equal(true)

		expect(Library.isValidPhoneNumber('+12133734253')).to.equal(true)
		expect(Library.isPossiblePhoneNumber('+12133734253')).to.equal(true)
		expect(Library.validatePhoneNumberLength('+12133734253')).to.be.undefined

		expect(new Library.Metadata().getCountryCodeForCallingCode('1')).to.equal('US')
		expect(Library.getExampleNumber('RU', examples).nationalNumber).to.equal('9123456789')

		// Deprecated.
		expect(Library.findPhoneNumbers('+12133734253', 'US')[0].endsAt).to.equal(12)
		expect(Library.searchPhoneNumbers('+12133734253', 'US')[Symbol.iterator]().next).to.be.a('function')
		expect(new Library.PhoneNumberSearch('+12133734253', undefined).find).to.be.a('function')

		expect(Library.findNumbers('+12133734253', 'US')[0].endsAt).to.equal(12)
		expect(Library.searchNumbers('+12133734253', 'US')[Symbol.iterator]().next).to.be.a('function')
		expect(Library.findPhoneNumbersInText('+12133734253')[0].number.number).to.equal('+12133734253')
		expect(Library.searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next).to.be.a('function')
		expect(new Library.PhoneNumberMatcher('+12133734253', undefined).find).to.be.a('function')

		expect(new Library.AsYouType('US').input('+12133734253')).to.equal('+1 213 373 4253')

		expect(Library.DIGIT_PLACEHOLDER).to.equal('x')
		expect(Object.keys(Library.DIGITS).length > 0).to.equal(true)

		// `getPhoneCode` name is deprecated.
		expect(Library.getPhoneCode('KZ')).to.equal('7')
		expect(Library.getCountries().indexOf('KZ') > 0).to.equal(true)
		expect(Library.getCountryCallingCode('KZ')).to.equal('7')

		expect(Library.isSupportedCountry('US')).to.equal(true)
		expect(Library.getExtPrefix('US')).to.equal(' ext. ')

		expect(Library.parseRFC3966('tel:+12133734253').number).to.equal('+12133734253')
		expect(Library.formatRFC3966({ number: '+12133734253' })).to.equal('tel:+12133734253')

		expect(Library.formatIncompletePhoneNumber('+121337342')).to.equal('+1 213 373 42')
		expect(Library.parseIncompletePhoneNumber('+1 213 373 42')).to.equal('+121337342')
		expect(Library.parsePhoneNumberCharacter('+')).to.equal('+')
		expect(Library.parseDigits('+123')).to.equal('123')
	})

	// Tests that the exported `parsePhoneNumber()` function returns an instance of the exported `PhoneNumber` class.
	// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/201
	it('should export `parsePhoneNumber()` function that returns an instance of the exported `PhoneNumber` class', () => {
		const phoneNumber = parsePhoneNumber('+13100000')
		expect(phoneNumber instanceof PhoneNumber).to.equal(true)
	})

	// it(`should export CommonJS custom functions`, () => {
	// 	const Library = require('../custom.js')

	// 	expect(Library.ParseError).toBe.a('function')

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
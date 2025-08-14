import { expect } from 'chai'

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
} from '../max/index.js'

import Library from '../max/index.cjs'

import examples from '../examples.mobile.json' with { type: 'json' }

describe('exports/max', () => {
	it('should export ES6', () => {
		expect(ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		expect(parsePhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumber('2133734253', 'US').nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumber('2133734253', { defaultCountry: 'US' }).nationalNumber).to.equal('2133734253')
		expect(
            parsePhoneNumber('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')

		expect(parsePhoneNumberWithError('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumberWithError('2133734253', 'US').nationalNumber).to.equal('2133734253')
		expect(
            parsePhoneNumberWithError('2133734253', { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')
		expect(
            parsePhoneNumberWithError('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')

		expect(parse('+12133734253').nationalNumber).to.equal('2133734253')

		expect(parsePhoneNumberFromString('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumberFromString('2133734253')).to.be.undefined

		// Test "max" metadata.
		expect(parsePhoneNumber('9150000000', 'RU').getType()).to.equal('MOBILE')
		expect(parsePhoneNumber('51234567', 'EE').getType()).to.equal('MOBILE')

		expect(isValidPhoneNumber('+12133734253')).to.equal(true)
		expect(isPossiblePhoneNumber('+12133734253')).to.equal(true)
		expect(validatePhoneNumberLength('+12133734253')).to.be.undefined

		expect(findNumbers('+12133734253')[0].endsAt).to.equal(12)
		expect(findNumbers('2133734253', 'US')[0].endsAt).to.equal(10)
		expect(findNumbers('2133734253', { defaultCountry: 'US' })[0].endsAt).to.equal(10)
		expect(findNumbers('2133734253', undefined, { defaultCountry: 'US' })[0].endsAt).to.equal(10)

		expect(searchNumbers('+12133734253')[Symbol.iterator]().next).to.be.a('function')
		expect(searchNumbers('2133734253', 'US')[Symbol.iterator]().next).to.be.a('function')
		expect(
            searchNumbers('2133734253', { defaultCountry: 'US' })[Symbol.iterator]().next
        ).to.be.a('function')
		expect(
            searchNumbers('2133734253', undefined, { defaultCountry: 'US' })[Symbol.iterator]().next
        ).to.be.a('function')

		expect(findPhoneNumbersInText('+12133734253')[0].number.number).to.equal('+12133734253')
		expect(searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next).to.be.a('function')

		expect(new PhoneNumberMatcher('+12133734253').find).to.be.a('function')

		expect(new AsYouType().input('+12133734253')).to.equal('+1 213 373 4253')
		expect(new AsYouType('US').input('2133734253')).to.equal('(213) 373-4253')

		expect(isSupportedCountry('KZ')).to.equal(true)
		expect(getCountries().indexOf('KZ') > 0).to.equal(true)
		expect(getCountryCallingCode('KZ')).to.equal('7')
		expect(getExtPrefix('US')).to.equal(' ext. ')

		expect(formatIncompletePhoneNumber('+121337342')).to.equal('+1 213 373 42')
		expect(formatIncompletePhoneNumber('21337342', 'US')).to.equal('(213) 373-42')

		expect(parseIncompletePhoneNumber('+1 213 373 42')).to.equal('+121337342')
		expect(parsePhoneNumberCharacter('+')).to.equal('+')
		expect(parseDigits('+123')).to.equal('123')

		expect(new Metadata().getCountryCodeForCallingCode('1')).to.equal('US')
		expect(getExampleNumber('RU', examples).nationalNumber).to.equal('9123456789')

		expect(parseRFC3966('tel:+12133734253')).to.deep.equal({ number: '+12133734253' })
		expect(formatRFC3966({ number: '+12133734253' })).to.equal('tel:+12133734253')
	})

	it('should export CommonJS', () => {
		expect(Library.ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		expect(Library.parsePhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(Library.parsePhoneNumber('2133734253', 'US').nationalNumber).to.equal('2133734253')
		expect(
            Library.parsePhoneNumber('2133734253', { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')
		expect(
            Library.parsePhoneNumber('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')

		expect(Library.parsePhoneNumberWithError('+12133734253').nationalNumber).to.equal('2133734253')
		expect(Library.parsePhoneNumberWithError('2133734253', 'US').nationalNumber).to.equal('2133734253')
		expect(
            Library.parsePhoneNumberWithError('2133734253', { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')
		expect(
            Library.parsePhoneNumberWithError('2133734253', undefined, { defaultCountry: 'US' }).nationalNumber
        ).to.equal('2133734253')

		expect(Library('+12133734253').nationalNumber).to.equal('2133734253')
		expect(Library.default('+12133734253').nationalNumber).to.equal('2133734253')

		expect(Library.parsePhoneNumberFromString('+12133734253').nationalNumber).to.equal('2133734253')
		expect(Library.parsePhoneNumberFromString('2133734253')).to.be.undefined

		expect(Library.isValidPhoneNumber('+12133734253')).to.equal(true)
		expect(Library.isPossiblePhoneNumber('+12133734253')).to.equal(true)
		expect(Library.validatePhoneNumberLength('+12133734253')).to.be.undefined

		expect(Library.findNumbers('+12133734253')[0].endsAt).to.equal(12)
		expect(Library.findNumbers('2133734253', 'US')[0].endsAt).to.equal(10)
		expect(Library.findNumbers('2133734253', { defaultCountry: 'US' })[0].endsAt).to.equal(10)
		expect(Library.findNumbers('2133734253', undefined, { defaultCountry: 'US' })[0].endsAt).to.equal(10)

		expect(Library.searchNumbers('+12133734253')[Symbol.iterator]().next).to.be.a('function')
		expect(Library.searchNumbers('2133734253', 'US')[Symbol.iterator]().next).to.be.a('function')
		expect(
            Library.searchNumbers('2133734253', { defaultCountry: 'US' })[Symbol.iterator]().next
        ).to.be.a('function')
		expect(
            Library.searchNumbers('2133734253', undefined, { defaultCountry: 'US' })[Symbol.iterator]().next
        ).to.be.a('function')

		expect(Library.findPhoneNumbersInText('+12133734253')[0].number.number).to.equal('+12133734253')
		expect(Library.searchPhoneNumbersInText('+12133734253')[Symbol.iterator]().next).to.be.a('function')

		expect(new Library.PhoneNumberMatcher('+12133734253', undefined).find).to.be.a('function')

		expect(new Library.AsYouType().input('+12133734253')).to.equal('+1 213 373 4253')
		expect(new Library.AsYouType('US').input('2133734253')).to.equal('(213) 373-4253')

		expect(Library.isSupportedCountry('KZ')).to.equal(true)
		expect(Library.getCountries().indexOf('KZ') > 0).to.equal(true)
		expect(Library.getCountryCallingCode('KZ')).to.equal('7')
		expect(Library.getExtPrefix('US')).to.equal(' ext. ')

		expect(Library.formatIncompletePhoneNumber('+121337342')).to.equal('+1 213 373 42')
		expect(Library.formatIncompletePhoneNumber('21337342', 'US')).to.equal('(213) 373-42')

		expect(Library.parseIncompletePhoneNumber('+1 213 373 42')).to.equal('+121337342')
		expect(Library.parsePhoneNumberCharacter('+')).to.equal('+')
		expect(Library.parseDigits('+123')).to.equal('123')

		expect(Library.getExampleNumber('RU', examples).nationalNumber).to.equal('9123456789')

		expect(Library.parseRFC3966('tel:+12133734253')).to.deep.equal({ number: '+12133734253' })
		expect(Library.formatRFC3966({ number: '+12133734253' })).to.equal('tel:+12133734253')
	})
})
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
	PhoneNumber,
	Metadata,
	isSupportedCountry,
	getCountries,
	getCountryCallingCode,
	getExtPrefix,

	getExampleNumber,

	formatIncompletePhoneNumber,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	parseRFC3966,
	formatRFC3966
} from '../core/index.js'

import Library from '../core/index.cjs'

import metadata from '../metadata.min.json' with { type: 'json' }
import examples from '../examples.mobile.json' with { type: 'json' }

describe('exports/core', () => {
	it('should export ES6', () => {
		expect(ParseError).to.be.a('function')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		expect(parsePhoneNumber('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumberWithError('+12133734253', metadata).nationalNumber).to.equal('2133734253')

		expect(parse('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumberFromString('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(parsePhoneNumberFromString('2133734253', metadata)).to.be.undefined

		expect(isValidPhoneNumber('+12133734253', metadata)).to.equal(true)
		expect(isPossiblePhoneNumber('+12133734253', metadata)).to.equal(true)
		expect(validatePhoneNumberLength('+12133734253', metadata)).to.be.undefined

		expect(findNumbers('+12133734253', 'US', metadata)[0].endsAt).to.equal(12)
		expect(searchNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next).to.be.a('function')
		expect(findPhoneNumbersInText('+12133734253', metadata)[0].number.number).to.equal('+12133734253')
		expect(searchPhoneNumbersInText('+12133734253', metadata)[Symbol.iterator]().next).to.be.a('function')
		expect(new PhoneNumberMatcher('+12133734253', undefined, metadata).find).to.be.a('function')

		expect(new AsYouType('US', metadata).input('+12133734253', metadata)).to.equal('+1 213 373 4253')

		expect(new Metadata(metadata).getCountryCodeForCallingCode('1')).to.equal('US')
		expect(isSupportedCountry('KZ', metadata)).to.equal(true)
		expect(getCountries(metadata).indexOf('KZ') > 0).to.equal(true)
		expect(getCountryCallingCode('KZ', metadata)).to.equal('7')
		expect(getExtPrefix('US', metadata)).to.equal(' ext. ')

		expect(getExampleNumber('RU', examples, metadata).nationalNumber).to.equal('9123456789')

		expect(formatIncompletePhoneNumber('+121337342', metadata)).to.equal('+1 213 373 42')
		expect(parseIncompletePhoneNumber('+1 213 373 42')).to.equal('+121337342')
		expect(parsePhoneNumberCharacter('+')).to.equal('+')
		expect(parseDigits('+123')).to.equal('123')

		expect(parseRFC3966('tel:+12133734253', metadata)).to.deep.equal({ number: '+12133734253' })
		expect(formatRFC3966({ number: '+12133734253' }, metadata)).to.equal('tel:+12133734253')
	})

	it('should export CommonJS', () => {
		expect(Library.ParseError).to.be.a('function')

		expect(Library('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(Library.default('+12133734253', metadata).nationalNumber).to.equal('2133734253')

		// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
		expect(Library.parsePhoneNumber('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(Library.parsePhoneNumberWithError('+12133734253', metadata).nationalNumber).to.equal('2133734253')

		expect(
            Library.parsePhoneNumberFromString('+12133734253', metadata).nationalNumber
        ).to.equal('2133734253')
		expect(Library.parsePhoneNumberFromString('2133734253', metadata)).to.be.undefined

		expect(Library.isValidPhoneNumber('+12133734253', metadata)).to.equal(true)
		expect(Library.isPossiblePhoneNumber('+12133734253', metadata)).to.equal(true)
		expect(Library.validatePhoneNumberLength('+12133734253', metadata)).to.be.undefined

		expect(Library.findNumbers('+12133734253', 'US', metadata)[0].endsAt).to.equal(12)
		expect(
            Library.searchNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next
        ).to.be.a('function')
		expect(Library.findPhoneNumbersInText('+12133734253', metadata)[0].number.number).to.equal('+12133734253')
		expect(
            Library.searchPhoneNumbersInText('+12133734253', metadata)[Symbol.iterator]().next
        ).to.be.a('function')
		expect(new Library.PhoneNumberMatcher('+12133734253', undefined, metadata).find).to.be.a('function')

		expect(new Library.AsYouType('US', metadata).input('+12133734253', metadata)).to.equal('+1 213 373 4253')

		new Library.Metadata(metadata)
		expect(Library.isSupportedCountry('KZ', metadata)).to.equal(true)
		expect(Library.getCountries(metadata).indexOf('KZ') > 0).to.equal(true)
		expect(Library.getCountryCallingCode('KZ', metadata)).to.equal('7')
		expect(Library.getExtPrefix('US', metadata)).to.equal(' ext. ')

		expect(Library.getExampleNumber('RU', examples, metadata).nationalNumber).to.equal('9123456789')

		expect(Library.formatIncompletePhoneNumber('+121337342', metadata)).to.equal('+1 213 373 42')
		expect(Library.parseIncompletePhoneNumber('+1 213 373 42')).to.equal('+121337342')
		expect(Library.parsePhoneNumberCharacter('+')).to.equal('+')
		expect(Library.parseDigits('+123')).to.equal('123')

		expect(Library.parseRFC3966('tel:+12133734253')).to.deep.equal({ number: '+12133734253' })
		expect(Library.formatRFC3966({ number: '+12133734253' })).to.equal('tel:+12133734253')
	})

	// Tests that the exported `parsePhoneNumber()` function returns an instance of the exported `PhoneNumber` class.
	// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/201
	it('should export `parsePhoneNumber()` function that returns an instance of the exported `PhoneNumber` class', () => {
		const phoneNumber = parsePhoneNumber('+13100000', metadata)
		expect(phoneNumber instanceof PhoneNumber).to.equal(true)
	})
})
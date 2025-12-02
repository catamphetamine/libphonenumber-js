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

	formatIncompletePhoneNumber,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	getExampleNumber,

	parseRFC3966,
	formatRFC3966
} from '../mobile/index.js'

import Library from '../mobile/index.cjs'

import examples from '../examples.mobile.json' with { type: 'json' }

describe('exports/mobile', () => {
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

		// Test "mobile" metadata.
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

	it('should parse mobile numbers for countries of the same phone numbering plan', () => {
		// +1
		// US
		expect(parsePhoneNumberFromString('+12133734253').country).to.equal('US')
		expect(parsePhoneNumberFromString('+12133734253').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+12133734253').getType()).to.equal('MOBILE')
		// CA
		expect(parsePhoneNumberFromString('+15062345678').country).to.equal('CA')
		expect(parsePhoneNumberFromString('+15062345678').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+15062345678').getType()).to.equal('MOBILE')
		// AG
		expect(parsePhoneNumberFromString('+12684641234').country).to.equal('AG')
		expect(parsePhoneNumberFromString('+12684641234').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+12684641234').getType()).to.equal('MOBILE')
		// AI
		expect(parsePhoneNumberFromString('+12642351234').country).to.equal('AI')
		expect(parsePhoneNumberFromString('+12642351234').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+12642351234').getType()).to.equal('MOBILE')
		// AI. Not a mobile phone number.
		// AI has `leadingDigits`, so an exact country is determined,
		// even though the phone number isn't supported.
		expect(parsePhoneNumberFromString('+12644612345').country).to.equal('AI')
		expect(parsePhoneNumberFromString('+12644612345').isValid()).to.equal(false)
		expect(parsePhoneNumberFromString('+12644612345').getType()).to.be.undefined
		// +7
		// RU
		expect(parsePhoneNumberFromString('+79123456789').country).to.equal('RU')
		expect(parsePhoneNumberFromString('+79123456789').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+79123456789').getType()).to.equal('MOBILE')
		// RU. Not a mobile phone number.
		expect(parsePhoneNumberFromString('+78005553535').country).to.be.undefined
		expect(parsePhoneNumberFromString('+78005553535').isValid()).to.equal(false)
		expect(parsePhoneNumberFromString('+78005553535').getType()).to.be.undefined
		// KZ
		expect(parsePhoneNumberFromString('+77710009998').country).to.equal('KZ')
		expect(parsePhoneNumberFromString('+77710009998').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+77710009998').getType()).to.equal('MOBILE')
		// KZ. Not a mobile phone number.
		// KZ has `leadingDigits`, so an exact country is determined,
		// even though the phone number isn't supported.
		expect(parsePhoneNumberFromString('+77123456789').country).to.equal('KZ')
		expect(parsePhoneNumberFromString('+77123456789').isValid()).to.equal(false)
		expect(parsePhoneNumberFromString('+77123456789').getType()).to.be.undefined
		// +44
		// GB
		expect(parsePhoneNumberFromString('+447400123456').country).to.equal('GB')
		expect(parsePhoneNumberFromString('+447400123456').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+447400123456').getType()).to.equal('MOBILE')
		// GB. Not a mobile phone number.
		expect(parsePhoneNumberFromString('+441212345678').country).to.be.undefined
		expect(parsePhoneNumberFromString('+441212345678').countryCallingCode).to.equal('44')
		expect(parsePhoneNumberFromString('+441212345678').isValid()).to.equal(false)
		expect(parsePhoneNumberFromString('+441212345678').getType()).to.be.undefined
		// GG
		expect(parsePhoneNumberFromString('+447781123456').country).to.equal('GG')
		expect(parsePhoneNumberFromString('+447781123456').isValid()).to.equal(true)
		expect(parsePhoneNumberFromString('+447781123456').getType()).to.equal('MOBILE')
		// GG. Not a mobile phone number.
		expect(parsePhoneNumberFromString('+441212345678').country).to.be.undefined
		expect(parsePhoneNumberFromString('+441212345678').countryCallingCode).to.equal('44')
		expect(parsePhoneNumberFromString('+441481256789').isValid()).to.equal(false)
		expect(parsePhoneNumberFromString('+441481256789').getType()).to.be.undefined
	})

	// Tests that the exported `parsePhoneNumber()` function returns an instance of the exported `PhoneNumber` class.
	// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/201
	it('should export `parsePhoneNumber()` function that returns an instance of the exported `PhoneNumber` class', () => {
		const phoneNumber = parsePhoneNumber('+13100000')
		expect(phoneNumber instanceof PhoneNumber).to.equal(true)
	})
})
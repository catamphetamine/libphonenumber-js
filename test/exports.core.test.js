import parse, {
	ParseError,
	parsePhoneNumber,
	parsePhoneNumberFromString,

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

	getExampleNumber,

	formatIncompletePhoneNumber,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	parseRFC3966,
	formatRFC3966
} from '../core'

import metadata from '../metadata.min.json'
import examples from '../examples.mobile.json'

describe('exports/core', () => {
	it('should export ES6', () => {
		expect(ParseError).to.be.a('function')

		parsePhoneNumber('+12133734253', metadata).nationalNumber.should.equal('2133734253')

		parse('+12133734253', metadata).nationalNumber.should.equal('2133734253')
		parsePhoneNumberFromString('+12133734253', metadata).nationalNumber.should.equal('2133734253')
		expect(parsePhoneNumberFromString('2133734253', metadata)).to.be.undefined

		findNumbers('+12133734253', 'US', metadata).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		searchNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next.should.be.a('function')
		findPhoneNumbersInText('+12133734253', metadata)[0].number.number.should.equal('+12133734253')
		searchPhoneNumbersInText('+12133734253', metadata)[Symbol.iterator]().next.should.be.a('function')
		new PhoneNumberMatcher('+12133734253', undefined, metadata).find.should.be.a('function')

		new AsYouType('US', metadata).input('+12133734253', metadata).should.equal('+1 213 373 4253')

		new Metadata(metadata)
		isSupportedCountry('KZ', metadata).should.equal(true)
		expect(getCountries(metadata).indexOf('KZ') > 0).to.be.true
		getCountryCallingCode('KZ', metadata).should.equal('7')
		getExtPrefix('US', metadata).should.equal(' ext. ')

		getExampleNumber('RU', examples, metadata).nationalNumber.should.equal('9123456789')

		formatIncompletePhoneNumber('+121337342', metadata).should.deep.equal('+1 213 373 42')
		parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
		parsePhoneNumberCharacter('+').should.equal('+')
		parseDigits('+123').should.equal('123')

		parseRFC3966('tel:+12133734253', metadata).should.deep.equal({ number: '+12133734253' })
		formatRFC3966({ number: '+12133734253' }, metadata).should.equal('tel:+12133734253')
	})

	it('should export CommonJS', () => {
		const Library = require('../core/index.commonjs')

		expect(Library.ParseError).to.be.a('function')

		Library('+12133734253', metadata).nationalNumber.should.equal('2133734253')
		Library.default('+12133734253', metadata).nationalNumber.should.equal('2133734253')

		Library.parsePhoneNumber('+12133734253', metadata).nationalNumber.should.equal('2133734253')

		Library.parsePhoneNumberFromString('+12133734253', metadata).nationalNumber.should.equal('2133734253')
		expect(Library.parsePhoneNumberFromString('2133734253', metadata)).to.be.undefined

		Library.findNumbers('+12133734253', 'US', metadata).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		Library.searchNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next.should.be.a('function')
		Library.findPhoneNumbersInText('+12133734253', metadata)[0].number.number.should.equal('+12133734253')
		Library.searchPhoneNumbersInText('+12133734253', metadata)[Symbol.iterator]().next.should.be.a('function')
		new Library.PhoneNumberMatcher('+12133734253', undefined, metadata).find.should.be.a('function')

		new Library.AsYouType('US', metadata).input('+12133734253', metadata).should.equal('+1 213 373 4253')

		new Library.Metadata(metadata)
		Library.isSupportedCountry('KZ', metadata).should.equal(true)
		expect(Library.getCountries(metadata).indexOf('KZ') > 0).to.be.true
		Library.getCountryCallingCode('KZ', metadata).should.equal('7')
		Library.getExtPrefix('US', metadata).should.equal(' ext. ')

		Library.getExampleNumber('RU', examples, metadata).nationalNumber.should.equal('9123456789')

		Library.formatIncompletePhoneNumber('+121337342', metadata).should.deep.equal('+1 213 373 42')
		Library.parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
		Library.parsePhoneNumberCharacter('+').should.equal('+')
		Library.parseDigits('+123').should.equal('123')

		Library.parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		Library.formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')
	})
})
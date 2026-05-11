import { describe, it } from 'mocha'
import { expect } from 'chai'

import parseMin, {
	AsYouType as MinAsYouType,
	Metadata as MinMetadata,
	PhoneNumber as MinPhoneNumber,
	PhoneNumberMatcher as MinPhoneNumberMatcher,
	parsePhoneNumber as parseMinPhoneNumber
} from '../../min/es6/index.js'

import parseMax, {
	PhoneNumber as MaxPhoneNumber,
	parsePhoneNumber as parseMaxPhoneNumber
} from '../../max/es6/index.js'
import parseMobile, {
	PhoneNumber as MobilePhoneNumber,
	parsePhoneNumber as parseMobilePhoneNumber
} from '../../mobile/es6/index.js'

import parseCore, {
	AsYouType as CoreAsYouType,
	Metadata as CoreMetadata,
	PhoneNumber as CorePhoneNumber,
	PhoneNumberMatcher as CorePhoneNumberMatcher,
	parsePhoneNumber as parseCorePhoneNumber
} from '../../core/es6/index.js'

import metadata from '../../metadata.min.json' with { type: 'json' }

describe('exports/*/es6', () => {
	it('should export metadata-bound ES6 subpackages', () => {
		expect(parseMin('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parseMinPhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parseMinPhoneNumber('+12133734253') instanceof MinPhoneNumber).to.equal(true)
		expect(parseMax('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parseMaxPhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parseMaxPhoneNumber('+12133734253') instanceof MaxPhoneNumber).to.equal(true)
		expect(parseMobile('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parseMobilePhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(parseMobilePhoneNumber('+12133734253') instanceof MobilePhoneNumber).to.equal(true)

		expect(new MinAsYouType('US').input('2133734253')).to.equal('(213) 373-4253')
		expect(new MinPhoneNumberMatcher('+12133734253').find).to.be.a('function')
		expect(new MinPhoneNumber('+12133734253').nationalNumber).to.equal('2133734253')
		expect(new MinMetadata().getCountryCodeForCallingCode('1')).to.equal('US')
	})

	it('should export core/es6', () => {
		expect(parseCore('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(parseCorePhoneNumber('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(new CoreAsYouType('US', metadata).input('2133734253')).to.equal('(213) 373-4253')
		expect(new CorePhoneNumberMatcher('+12133734253', undefined, metadata).find).to.be.a('function')
		expect(new CorePhoneNumber('+12133734253', metadata).nationalNumber).to.equal('2133734253')
		expect(new CoreMetadata(metadata).getCountryCodeForCallingCode('1')).to.equal('US')
	})
})

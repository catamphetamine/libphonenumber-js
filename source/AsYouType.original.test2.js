/**
 * Copy-pasted from Google's library.
 * https://github.com/google/libphonenumber/blob/master/javascript/i18n/phonenumbers/asyoutypeformatter_test.js
 * On Jan 20, 2020.
 */

import AsYouType_ from './AsYouType'
import metadata from '../metadata.min.json'

function AsYouType(country) {
  return new AsYouType_(country, metadata)
}

describe('AsYouType', () => {
  it('should pass Google\'s tests', () => {
    testInvalidRegion()
    testInvalidPlusSign()
    testTooLongNumberMatchingMultipleLeadingDigits()
    testCountryWithSpaceInNationalPrefixFormattingRule()
    testCountryWithSpaceInNationalPrefixFormattingRuleAndLongNdd()
    testAYTFUS()
    testAYTFUSFullWidthCharacters()
    testAYTFUSMobileShortCode()
    testAYTFUSVanityNumber()
    testAYTFAndRememberPositionUS()
    testAYTFGBFixedLine()
    testAYTFGBTollFree()
    testAYTFGBPremiumRate()
    testAYTFNZMobile()
    testAYTFDE()
    testAYTFAR()
    testAYTFARMobile()
    testAYTFKR()
    testAYTF_MX()
    testAYTF_International_Toll_Free()
    testAYTFMultipleLeadingDigitPatterns()
    testAYTFLongIDD_AU()
    testAYTFLongIDD_KR()
    testAYTFLongNDD_KR()
    testAYTFLongNDD_SG()
    testAYTFShortNumberFormattingFix_AU()
    testAYTFShortNumberFormattingFix_KR()
    testAYTFShortNumberFormattingFix_MX()
    testAYTFNoNationalPrefix()
    testAYTFNoNationalPrefixFormattingRule()
    testAYTFShortNumberFormattingFix_US()
    testAYTFClearNDDAfterIddExtraction()
    testAYTFNumberPatternsBecomingInvalidShouldNotResultInDigitLoss()
  })
})

function assertEquals(a, b) {
  expect(a).to.equal(b)
}

function testInvalidRegion() {
  var f = AsYouType('ZZ')
  assertEquals('+', f.input('+'))
  assertEquals('+4', f.input('4'))
  assertEquals('+48', f.input('8'))
  assertEquals('+48 8', f.input('8'))
  assertEquals('+48 88', f.input('8'))
  assertEquals('+48 88 1', f.input('1'))
  assertEquals('+48 88 12', f.input('2'))
  assertEquals('+48 88 123', f.input('3'))
  assertEquals('+48 88 123 1', f.input('1'))
  assertEquals('+48 88 123 12', f.input('2'))

  f.reset()
  assertEquals('6', f.input('6'))
  assertEquals('65', f.input('5'))
  assertEquals('650', f.input('0'))
  assertEquals('6502', f.input('2'))
  assertEquals('65025', f.input('5'))
  assertEquals('650253', f.input('3'))
}

function testInvalidPlusSign() {
  var f = AsYouType('ZZ')
  assertEquals('+', f.input('+'))
  assertEquals('+4', f.input('4'))
  assertEquals('+48', f.input('8'))
  assertEquals('+48 8', f.input('8'))
  assertEquals('+48 88', f.input('8'))
  assertEquals('+48 88 1', f.input('1'))
  assertEquals('+48 88 12', f.input('2'))
  assertEquals('+48 88 123', f.input('3'))
  assertEquals('+48 88 123 1', f.input('1'))
  // A plus sign can only appear at the beginning of the number
  // otherwise, no formatting is applied.
  assertEquals('+48881231+', f.input('+'))
  assertEquals('+48881231+2', f.input('2'))
}

function testTooLongNumberMatchingMultipleLeadingDigits() {
  // See https://github.com/google/libphonenumber/issues/36
  // The bug occurred last time for countries which have two formatting rules
  // with exactly the same leading digits pattern but differ in length.
  var f = AsYouType('ZZ')
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+81', f.input('1'))
  assertEquals('+81 9', f.input('9'))
  assertEquals('+81 90', f.input('0'))
  assertEquals('+81 90 1', f.input('1'))
  assertEquals('+81 90 12', f.input('2'))
  assertEquals('+81 90 123', f.input('3'))
  assertEquals('+81 90 1234', f.input('4'))
  assertEquals('+81 90 1234 5', f.input('5'))
  assertEquals('+81 90 1234 56', f.input('6'))
  assertEquals('+81 90 1234 567', f.input('7'))
  assertEquals('+81 90 1234 5678', f.input('8'))
  assertEquals('+81 90 12 345 6789', f.input('9'))
  assertEquals('+81901234567890', f.input('0'))
  assertEquals('+819012345678901', f.input('1'))
}

function testCountryWithSpaceInNationalPrefixFormattingRule() {
  var f = AsYouType('BY')
  assertEquals('8', f.input('8'))
  assertEquals('88', f.input('8'))
  assertEquals('881', f.input('1'))
  assertEquals('8 819', f.input('9'))
  assertEquals('8 8190', f.input('0'))
  // The formatting rule for 5 digit numbers states that no space should be
  // present after the national prefix.
  assertEquals('881 901', f.input('1'))
  assertEquals('8 819 012', f.input('2'))
  // Too long, no formatting rule applies.
  assertEquals('88190123', f.input('3'))
}

function testCountryWithSpaceInNationalPrefixFormattingRuleAndLongNdd() {
  var f = AsYouType('BY')
  assertEquals('9', f.input('9'))
  assertEquals('99', f.input('9'))
  assertEquals('999', f.input('9'))
  assertEquals('9999', f.input('9'))
  assertEquals('99999', f.input('9'))
  assertEquals('99999 1', f.input('1'))
  assertEquals('99999 12', f.input('2'))
  assertEquals('99999 123', f.input('3'))
  assertEquals('99999 1234', f.input('4'))
  assertEquals('99999 12 345', f.input('5'))
}

function testAYTFUS() {
  var f = AsYouType('US')
  assertEquals('6', f.input('6'))
  assertEquals('65', f.input('5'))
  assertEquals('650', f.input('0'))
  assertEquals('650 2', f.input('2'))
  assertEquals('650 25', f.input('5'))
  assertEquals('650 253', f.input('3'))
  // Note this is how a US local number (without area code) should be formatted.
  assertEquals('650 2532', f.input('2'))
  assertEquals('650 253 22', f.input('2'))
  assertEquals('650 253 222', f.input('2'))
  assertEquals('650 253 2222', f.input('2'))

  f.reset()
  assertEquals('1', f.input('1'))
  assertEquals('16', f.input('6'))
  assertEquals('1 65', f.input('5'))
  assertEquals('1 650', f.input('0'))
  assertEquals('1 650 2', f.input('2'))
  assertEquals('1 650 25', f.input('5'))
  assertEquals('1 650 253', f.input('3'))
  assertEquals('1 650 253 2', f.input('2'))
  assertEquals('1 650 253 22', f.input('2'))
  assertEquals('1 650 253 222', f.input('2'))
  assertEquals('1 650 253 2222', f.input('2'))

  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011 4', f.input('4'))
  assertEquals('011 44', f.input('4'))
  assertEquals('011 44 6', f.input('6'))
  assertEquals('011 44 61', f.input('1'))
  assertEquals('011 44 6 12', f.input('2'))
  assertEquals('011 44 6 123', f.input('3'))
  assertEquals('011 44 6 123 1', f.input('1'))
  assertEquals('011 44 6 123 12', f.input('2'))
  assertEquals('011 44 6 123 123', f.input('3'))
  assertEquals('011 44 6 123 123 1', f.input('1'))
  assertEquals('011 44 6 123 123 12', f.input('2'))
  assertEquals('011 44 6 123 123 123', f.input('3'))

  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011 5', f.input('5'))
  assertEquals('011 54', f.input('4'))
  assertEquals('011 54 9', f.input('9'))
  assertEquals('011 54 91', f.input('1'))
  assertEquals('011 54 9 11', f.input('1'))
  assertEquals('011 54 9 11 2', f.input('2'))
  assertEquals('011 54 9 11 23', f.input('3'))
  assertEquals('011 54 9 11 231', f.input('1'))
  assertEquals('011 54 9 11 2312', f.input('2'))
  assertEquals('011 54 9 11 2312 1', f.input('1'))
  assertEquals('011 54 9 11 2312 12', f.input('2'))
  assertEquals('011 54 9 11 2312 123', f.input('3'))
  assertEquals('011 54 9 11 2312 1234', f.input('4'))

  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011 2', f.input('2'))
  assertEquals('011 24', f.input('4'))
  assertEquals('011 244', f.input('4'))
  assertEquals('011 244 2', f.input('2'))
  assertEquals('011 244 28', f.input('8'))
  assertEquals('011 244 280', f.input('0'))
  assertEquals('011 244 280 0', f.input('0'))
  assertEquals('011 244 280 00', f.input('0'))
  assertEquals('011 244 280 000', f.input('0'))
  assertEquals('011 244 280 000 0', f.input('0'))
  assertEquals('011 244 280 000 00', f.input('0'))
  assertEquals('011 244 280 000 000', f.input('0'))

  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+4', f.input('4'))
  assertEquals('+48', f.input('8'))
  assertEquals('+48 8', f.input('8'))
  assertEquals('+48 88', f.input('8'))
  assertEquals('+48 88 1', f.input('1'))
  assertEquals('+48 88 12', f.input('2'))
  assertEquals('+48 88 123', f.input('3'))
  assertEquals('+48 88 123 1', f.input('1'))
  assertEquals('+48 88 123 12', f.input('2'))
  assertEquals('+48 88 123 12 1', f.input('1'))
  assertEquals('+48 88 123 12 12', f.input('2'))
}

function testAYTFUSFullWidthCharacters() {
  var f = AsYouType('US')
  assertEquals('\uFF16', f.input('\uFF16'))
  assertEquals('\uFF16\uFF15', f.input('\uFF15'))
  assertEquals('650', f.input('\uFF10'))
  assertEquals('650 2', f.input('\uFF12'))
  assertEquals('650 25', f.input('\uFF15'))
  assertEquals('650 253', f.input('\uFF13'))
  assertEquals('650 2532', f.input('\uFF12'))
  assertEquals('650 253 22', f.input('\uFF12'))
  assertEquals('650 253 222', f.input('\uFF12'))
  assertEquals('650 253 2222', f.input('\uFF12'))
}

function testAYTFUSMobileShortCode() {
  var f = AsYouType('US')
  assertEquals('*', f.input('*'))
  assertEquals('*1', f.input('1'))
  assertEquals('*12', f.input('2'))
  assertEquals('*121', f.input('1'))
  assertEquals('*121#', f.input('#'))
}

function testAYTFUSVanityNumber() {
  var f = AsYouType('US')
  assertEquals('8', f.input('8'))
  assertEquals('80', f.input('0'))
  assertEquals('800', f.input('0'))
  assertEquals('800', f.input(' '))
  assertEquals('800 M', f.input('M'))
  assertEquals('800 MY', f.input('Y'))
  assertEquals('800 MY', f.input(' '))
  assertEquals('800 MY A', f.input('A'))
  assertEquals('800 MY AP', f.input('P'))
  assertEquals('800 MY APP', f.input('P'))
  assertEquals('800 MY APPL', f.input('L'))
  assertEquals('800 MY APPLE', f.input('E'))
}

function testAYTFAndRememberPositionUS() {
  var f = AsYouType('US')
  assertEquals('1', f.inputDigitAndRememberPosition('1'))
  assertEquals(1, f.getRememberedPosition())
  assertEquals('16', f.input('6'))
  assertEquals('1 65', f.input('5'))
  assertEquals(1, f.getRememberedPosition())
  assertEquals('1 650', f.inputDigitAndRememberPosition('0'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('1 650 2', f.input('2'))
  assertEquals('1 650 25', f.input('5'))
  // Note the remembered position for digit '0' changes from 4 to 5, because a
  // space is now inserted in the front.
  assertEquals(5, f.getRememberedPosition())
  assertEquals('1 650 253', f.input('3'))
  assertEquals('1 650 253 2', f.input('2'))
  assertEquals('1 650 253 22', f.input('2'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('1 650 253 222', f.inputDigitAndRememberPosition('2'))
  assertEquals(13, f.getRememberedPosition())
  assertEquals('1 650 253 2222', f.input('2'))
  assertEquals(13, f.getRememberedPosition())
  assertEquals('165025322222', f.input('2'))
  assertEquals(10, f.getRememberedPosition())
  assertEquals('1650253222222', f.input('2'))
  assertEquals(10, f.getRememberedPosition())

  f.reset()
  assertEquals('1', f.input('1'))
  assertEquals('16', f.inputDigitAndRememberPosition('6'))
  assertEquals(2, f.getRememberedPosition())
  assertEquals('1 65', f.input('5'))
  assertEquals('1 650', f.input('0'))
  assertEquals(3, f.getRememberedPosition())
  assertEquals('1 650 2', f.input('2'))
  assertEquals('1 650 25', f.input('5'))
  assertEquals(3, f.getRememberedPosition())
  assertEquals('1 650 253', f.input('3'))
  assertEquals('1 650 253 2', f.input('2'))
  assertEquals('1 650 253 22', f.input('2'))
  assertEquals(3, f.getRememberedPosition())
  assertEquals('1 650 253 222', f.input('2'))
  assertEquals('1 650 253 2222', f.input('2'))
  assertEquals('165025322222', f.input('2'))
  assertEquals(2, f.getRememberedPosition())
  assertEquals('1650253222222', f.input('2'))
  assertEquals(2, f.getRememberedPosition())

  f.reset()
  assertEquals('6', f.input('6'))
  assertEquals('65', f.input('5'))
  assertEquals('650', f.input('0'))
  assertEquals('650 2', f.input('2'))
  assertEquals('650 25', f.input('5'))
  assertEquals('650 253', f.input('3'))
  assertEquals('650 2532', f.inputDigitAndRememberPosition('2'))
  assertEquals(8, f.getRememberedPosition())
  assertEquals('650 253 22', f.input('2'))
  assertEquals(9, f.getRememberedPosition())
  assertEquals('650 253 222', f.input('2'))
  // No more formatting when semicolon is entered.
  assertEquals('650253222;', f.input(';'))
  assertEquals(7, f.getRememberedPosition())
  assertEquals('650253222;2', f.input('2'))

  f.reset()
  assertEquals('6', f.input('6'))
  assertEquals('65', f.input('5'))
  assertEquals('650', f.input('0'))
  // No more formatting when users choose to do their own formatting.
  assertEquals('650-', f.input('-'))
  assertEquals('650-2', f.inputDigitAndRememberPosition('2'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('650-25', f.input('5'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('650-253', f.input('3'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('650-253-', f.input('-'))
  assertEquals('650-253-2', f.input('2'))
  assertEquals('650-253-22', f.input('2'))
  assertEquals('650-253-222', f.input('2'))
  assertEquals('650-253-2222', f.input('2'))

  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011 4', f.inputDigitAndRememberPosition('4'))
  assertEquals('011 48', f.input('8'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('011 48 8', f.input('8'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('011 48 88', f.input('8'))
  assertEquals('011 48 88 1', f.input('1'))
  assertEquals('011 48 88 12', f.input('2'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('011 48 88 123', f.input('3'))
  assertEquals('011 48 88 123 1', f.input('1'))
  assertEquals('011 48 88 123 12', f.input('2'))
  assertEquals('011 48 88 123 12 1', f.input('1'))
  assertEquals('011 48 88 123 12 12', f.input('2'))

  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+1', f.input('1'))
  assertEquals('+1 6', f.inputDigitAndRememberPosition('6'))
  assertEquals('+1 65', f.input('5'))
  assertEquals('+1 650', f.input('0'))
  assertEquals(4, f.getRememberedPosition())
  assertEquals('+1 650 2', f.input('2'))
  assertEquals(4, f.getRememberedPosition())
  assertEquals('+1 650 25', f.input('5'))
  assertEquals('+1 650 253', f.inputDigitAndRememberPosition('3'))
  assertEquals('+1 650 253 2', f.input('2'))
  assertEquals('+1 650 253 22', f.input('2'))
  assertEquals('+1 650 253 222', f.input('2'))
  assertEquals(10, f.getRememberedPosition())

  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+1', f.input('1'))
  assertEquals('+1 6', f.inputDigitAndRememberPosition('6'))
  assertEquals('+1 65', f.input('5'))
  assertEquals('+1 650', f.input('0'))
  assertEquals(4, f.getRememberedPosition())
  assertEquals('+1 650 2', f.input('2'))
  assertEquals(4, f.getRememberedPosition())
  assertEquals('+1 650 25', f.input('5'))
  assertEquals('+1 650 253', f.input('3'))
  assertEquals('+1 650 253 2', f.input('2'))
  assertEquals('+1 650 253 22', f.input('2'))
  assertEquals('+1 650 253 222', f.input('2'))
  assertEquals('+1650253222;', f.input(';'))
  assertEquals(3, f.getRememberedPosition())
}

function testAYTFGBFixedLine() {
  var f = AsYouType('GB')
  assertEquals('0', f.input('0'))
  assertEquals('02', f.input('2'))
  assertEquals('020', f.input('0'))
  assertEquals('020 7', f.inputDigitAndRememberPosition('7'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('020 70', f.input('0'))
  assertEquals('020 703', f.input('3'))
  assertEquals(5, f.getRememberedPosition())
  assertEquals('020 7031', f.input('1'))
  assertEquals('020 7031 3', f.input('3'))
  assertEquals('020 7031 30', f.input('0'))
  assertEquals('020 7031 300', f.input('0'))
  assertEquals('020 7031 3000', f.input('0'))
}

function testAYTFGBTollFree() {
  var f = AsYouType('GB')
  assertEquals('0', f.input('0'))
  assertEquals('08', f.input('8'))
  assertEquals('080', f.input('0'))
  assertEquals('080 7', f.input('7'))
  assertEquals('080 70', f.input('0'))
  assertEquals('080 703', f.input('3'))
  assertEquals('080 7031', f.input('1'))
  assertEquals('080 7031 3', f.input('3'))
  assertEquals('080 7031 30', f.input('0'))
  assertEquals('080 7031 300', f.input('0'))
  assertEquals('080 7031 3000', f.input('0'))
}

function testAYTFGBPremiumRate() {
  var f = AsYouType('GB')
  assertEquals('0', f.input('0'))
  assertEquals('09', f.input('9'))
  assertEquals('090', f.input('0'))
  assertEquals('090 7', f.input('7'))
  assertEquals('090 70', f.input('0'))
  assertEquals('090 703', f.input('3'))
  assertEquals('090 7031', f.input('1'))
  assertEquals('090 7031 3', f.input('3'))
  assertEquals('090 7031 30', f.input('0'))
  assertEquals('090 7031 300', f.input('0'))
  assertEquals('090 7031 3000', f.input('0'))
}

function testAYTFNZMobile() {
  var f = AsYouType('NZ')
  assertEquals('0', f.input('0'))
  assertEquals('02', f.input('2'))
  assertEquals('021', f.input('1'))
  assertEquals('02-11', f.input('1'))
  assertEquals('02-112', f.input('2'))
  // Note the unittest is using fake metadata which might produce non-ideal
  // results.
  assertEquals('02-112 3', f.input('3'))
  assertEquals('02-112 34', f.input('4'))
  assertEquals('02-112 345', f.input('5'))
  assertEquals('02-112 3456', f.input('6'))
}

function testAYTFDE() {
  var f = AsYouType('DE')
  assertEquals('0', f.input('0'))
  assertEquals('03', f.input('3'))
  assertEquals('030', f.input('0'))
  assertEquals('030/1', f.input('1'))
  assertEquals('030/12', f.input('2'))
  assertEquals('030/123', f.input('3'))
  assertEquals('030/1234', f.input('4'))

  // 04134 1234
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('04', f.input('4'))
  assertEquals('041', f.input('1'))
  assertEquals('041 3', f.input('3'))
  assertEquals('041 34', f.input('4'))
  assertEquals('04134 1', f.input('1'))
  assertEquals('04134 12', f.input('2'))
  assertEquals('04134 123', f.input('3'))
  assertEquals('04134 1234', f.input('4'))

  // 08021 2345
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('08', f.input('8'))
  assertEquals('080', f.input('0'))
  assertEquals('080 2', f.input('2'))
  assertEquals('080 21', f.input('1'))
  assertEquals('08021 2', f.input('2'))
  assertEquals('08021 23', f.input('3'))
  assertEquals('08021 234', f.input('4'))
  assertEquals('08021 2345', f.input('5'))

  // 00 1 650 253 2250
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('00', f.input('0'))
  assertEquals('00 1', f.input('1'))
  assertEquals('00 1 6', f.input('6'))
  assertEquals('00 1 65', f.input('5'))
  assertEquals('00 1 650', f.input('0'))
  assertEquals('00 1 650 2', f.input('2'))
  assertEquals('00 1 650 25', f.input('5'))
  assertEquals('00 1 650 253', f.input('3'))
  assertEquals('00 1 650 253 2', f.input('2'))
  assertEquals('00 1 650 253 22', f.input('2'))
  assertEquals('00 1 650 253 222', f.input('2'))
  assertEquals('00 1 650 253 2222', f.input('2'))
}

function testAYTFAR() {
  var f = AsYouType('AR')
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011 7', f.input('7'))
  assertEquals('011 70', f.input('0'))
  assertEquals('011 703', f.input('3'))
  assertEquals('011 7031', f.input('1'))
  assertEquals('011 7031-3', f.input('3'))
  assertEquals('011 7031-30', f.input('0'))
  assertEquals('011 7031-300', f.input('0'))
  assertEquals('011 7031-3000', f.input('0'))
}

function testAYTFARMobile() {
  var f = AsYouType('AR')
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+54', f.input('4'))
  assertEquals('+54 9', f.input('9'))
  assertEquals('+54 91', f.input('1'))
  assertEquals('+54 9 11', f.input('1'))
  assertEquals('+54 9 11 2', f.input('2'))
  assertEquals('+54 9 11 23', f.input('3'))
  assertEquals('+54 9 11 231', f.input('1'))
  assertEquals('+54 9 11 2312', f.input('2'))
  assertEquals('+54 9 11 2312 1', f.input('1'))
  assertEquals('+54 9 11 2312 12', f.input('2'))
  assertEquals('+54 9 11 2312 123', f.input('3'))
  assertEquals('+54 9 11 2312 1234', f.input('4'))
}

function testAYTFKR() {
  // +82 51 234 5678
  var f = AsYouType('KR')
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+82', f.input('2'))
  assertEquals('+82 5', f.input('5'))
  assertEquals('+82 51', f.input('1'))
  assertEquals('+82 51-2', f.input('2'))
  assertEquals('+82 51-23', f.input('3'))
  assertEquals('+82 51-234', f.input('4'))
  assertEquals('+82 51-234-5', f.input('5'))
  assertEquals('+82 51-234-56', f.input('6'))
  assertEquals('+82 51-234-567', f.input('7'))
  assertEquals('+82 51-234-5678', f.input('8'))

  // +82 2 531 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+82', f.input('2'))
  assertEquals('+82 2', f.input('2'))
  assertEquals('+82 25', f.input('5'))
  assertEquals('+82 2-53', f.input('3'))
  assertEquals('+82 2-531', f.input('1'))
  assertEquals('+82 2-531-5', f.input('5'))
  assertEquals('+82 2-531-56', f.input('6'))
  assertEquals('+82 2-531-567', f.input('7'))
  assertEquals('+82 2-531-5678', f.input('8'))

  // +82 2 3665 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+82', f.input('2'))
  assertEquals('+82 2', f.input('2'))
  assertEquals('+82 23', f.input('3'))
  assertEquals('+82 2-36', f.input('6'))
  assertEquals('+82 2-366', f.input('6'))
  assertEquals('+82 2-3665', f.input('5'))
  assertEquals('+82 2-3665-5', f.input('5'))
  assertEquals('+82 2-3665-56', f.input('6'))
  assertEquals('+82 2-3665-567', f.input('7'))
  assertEquals('+82 2-3665-5678', f.input('8'))

  // 02-114
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('02', f.input('2'))
  assertEquals('021', f.input('1'))
  assertEquals('02-11', f.input('1'))
  assertEquals('02-114', f.input('4'))

  // 02-1300
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('02', f.input('2'))
  assertEquals('021', f.input('1'))
  assertEquals('02-13', f.input('3'))
  assertEquals('02-130', f.input('0'))
  assertEquals('02-1300', f.input('0'))

  // 011-456-7890
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011-4', f.input('4'))
  assertEquals('011-45', f.input('5'))
  assertEquals('011-456', f.input('6'))
  assertEquals('011-456-7', f.input('7'))
  assertEquals('011-456-78', f.input('8'))
  assertEquals('011-456-789', f.input('9'))
  assertEquals('011-456-7890', f.input('0'))

  // 011-9876-7890
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011-9', f.input('9'))
  assertEquals('011-98', f.input('8'))
  assertEquals('011-987', f.input('7'))
  assertEquals('011-9876', f.input('6'))
  assertEquals('011-9876-7', f.input('7'))
  assertEquals('011-9876-78', f.input('8'))
  assertEquals('011-9876-789', f.input('9'))
  assertEquals('011-9876-7890', f.input('0'))
}

function testAYTF_MX() {
  var f = AsYouType('MX')

  // +52 800 123 4567
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+52', f.input('2'))
  assertEquals('+52 8', f.input('8'))
  assertEquals('+52 80', f.input('0'))
  assertEquals('+52 800', f.input('0'))
  assertEquals('+52 800 1', f.input('1'))
  assertEquals('+52 800 12', f.input('2'))
  assertEquals('+52 800 123', f.input('3'))
  assertEquals('+52 800 123 4', f.input('4'))
  assertEquals('+52 800 123 45', f.input('5'))
  assertEquals('+52 800 123 456', f.input('6'))
  assertEquals('+52 800 123 4567', f.input('7'))

  // +52 55 1234 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+52', f.input('2'))
  assertEquals('+52 5', f.input('5'))
  assertEquals('+52 55', f.input('5'))
  assertEquals('+52 55 1', f.input('1'))
  assertEquals('+52 55 12', f.input('2'))
  assertEquals('+52 55 123', f.input('3'))
  assertEquals('+52 55 1234', f.input('4'))
  assertEquals('+52 55 1234 5', f.input('5'))
  assertEquals('+52 55 1234 56', f.input('6'))
  assertEquals('+52 55 1234 567', f.input('7'))
  assertEquals('+52 55 1234 5678', f.input('8'))

  // +52 212 345 6789
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+52', f.input('2'))
  assertEquals('+52 2', f.input('2'))
  assertEquals('+52 21', f.input('1'))
  assertEquals('+52 212', f.input('2'))
  assertEquals('+52 212 3', f.input('3'))
  assertEquals('+52 212 34', f.input('4'))
  assertEquals('+52 212 345', f.input('5'))
  assertEquals('+52 212 345 6', f.input('6'))
  assertEquals('+52 212 345 67', f.input('7'))
  assertEquals('+52 212 345 678', f.input('8'))
  assertEquals('+52 212 345 6789', f.input('9'))

  // +52 1 55 1234 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+52', f.input('2'))
  assertEquals('+52 1', f.input('1'))
  assertEquals('+52 15', f.input('5'))
  assertEquals('+52 1 55', f.input('5'))
  assertEquals('+52 1 55 1', f.input('1'))
  assertEquals('+52 1 55 12', f.input('2'))
  assertEquals('+52 1 55 123', f.input('3'))
  assertEquals('+52 1 55 1234', f.input('4'))
  assertEquals('+52 1 55 1234 5', f.input('5'))
  assertEquals('+52 1 55 1234 56', f.input('6'))
  assertEquals('+52 1 55 1234 567', f.input('7'))
  assertEquals('+52 1 55 1234 5678', f.input('8'))

  // +52 1 541 234 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+52', f.input('2'))
  assertEquals('+52 1', f.input('1'))
  assertEquals('+52 15', f.input('5'))
  assertEquals('+52 1 54', f.input('4'))
  assertEquals('+52 1 541', f.input('1'))
  assertEquals('+52 1 541 2', f.input('2'))
  assertEquals('+52 1 541 23', f.input('3'))
  assertEquals('+52 1 541 234', f.input('4'))
  assertEquals('+52 1 541 234 5', f.input('5'))
  assertEquals('+52 1 541 234 56', f.input('6'))
  assertEquals('+52 1 541 234 567', f.input('7'))
  assertEquals('+52 1 541 234 5678', f.input('8'))
}

function testAYTF_International_Toll_Free() {
  var f = AsYouType('US')
  // +800 1234 5678
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+80', f.input('0'))
  assertEquals('+800', f.input('0'))
  assertEquals('+800 1', f.input('1'))
  assertEquals('+800 12', f.input('2'))
  assertEquals('+800 123', f.input('3'))
  assertEquals('+800 1234', f.input('4'))
  assertEquals('+800 1234 5', f.input('5'))
  assertEquals('+800 1234 56', f.input('6'))
  assertEquals('+800 1234 567', f.input('7'))
  assertEquals('+800 1234 5678', f.input('8'))
  assertEquals('+800123456789', f.input('9'))
}

function testAYTFMultipleLeadingDigitPatterns() {
  // +81 50 2345 6789
  var f = AsYouType('JP')
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+81', f.input('1'))
  assertEquals('+81 5', f.input('5'))
  assertEquals('+81 50', f.input('0'))
  assertEquals('+81 50 2', f.input('2'))
  assertEquals('+81 50 23', f.input('3'))
  assertEquals('+81 50 234', f.input('4'))
  assertEquals('+81 50 2345', f.input('5'))
  assertEquals('+81 50 2345 6', f.input('6'))
  assertEquals('+81 50 2345 67', f.input('7'))
  assertEquals('+81 50 2345 678', f.input('8'))
  assertEquals('+81 50 2345 6789', f.input('9'))

  // +81 222 12 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+81', f.input('1'))
  assertEquals('+81 2', f.input('2'))
  assertEquals('+81 22', f.input('2'))
  assertEquals('+81 22 2', f.input('2'))
  assertEquals('+81 22 21', f.input('1'))
  assertEquals('+81 2221 2', f.input('2'))
  assertEquals('+81 222 12 5', f.input('5'))
  assertEquals('+81 222 12 56', f.input('6'))
  assertEquals('+81 222 12 567', f.input('7'))
  assertEquals('+81 222 12 5678', f.input('8'))

  // 011113
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('01', f.input('1'))
  assertEquals('011', f.input('1'))
  assertEquals('011 1', f.input('1'))
  assertEquals('011 11', f.input('1'))
  assertEquals('011113', f.input('3'))

  // +81 3332 2 5678
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+81', f.input('1'))
  assertEquals('+81 3', f.input('3'))
  assertEquals('+81 33', f.input('3'))
  assertEquals('+81 33 3', f.input('3'))
  assertEquals('+81 3332', f.input('2'))
  assertEquals('+81 3332 2', f.input('2'))
  assertEquals('+81 3332 2 5', f.input('5'))
  assertEquals('+81 3332 2 56', f.input('6'))
  assertEquals('+81 3332 2 567', f.input('7'))
  assertEquals('+81 3332 2 5678', f.input('8'))
}

function testAYTFLongIDD_AU() {
  var f = AsYouType('AU')
  // 0011 1 650 253 2250
  assertEquals('0', f.input('0'))
  assertEquals('00', f.input('0'))
  assertEquals('001', f.input('1'))
  assertEquals('0011', f.input('1'))
  assertEquals('0011 1', f.input('1'))
  assertEquals('0011 1 6', f.input('6'))
  assertEquals('0011 1 65', f.input('5'))
  assertEquals('0011 1 650', f.input('0'))
  assertEquals('0011 1 650 2', f.input('2'))
  assertEquals('0011 1 650 25', f.input('5'))
  assertEquals('0011 1 650 253', f.input('3'))
  assertEquals('0011 1 650 253 2', f.input('2'))
  assertEquals('0011 1 650 253 22', f.input('2'))
  assertEquals('0011 1 650 253 222', f.input('2'))
  assertEquals('0011 1 650 253 2222', f.input('2'))

  // 0011 81 3332 2 5678
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('00', f.input('0'))
  assertEquals('001', f.input('1'))
  assertEquals('0011', f.input('1'))
  assertEquals('00118', f.input('8'))
  assertEquals('0011 81', f.input('1'))
  assertEquals('0011 81 3', f.input('3'))
  assertEquals('0011 81 33', f.input('3'))
  assertEquals('0011 81 33 3', f.input('3'))
  assertEquals('0011 81 3332', f.input('2'))
  assertEquals('0011 81 3332 2', f.input('2'))
  assertEquals('0011 81 3332 2 5', f.input('5'))
  assertEquals('0011 81 3332 2 56', f.input('6'))
  assertEquals('0011 81 3332 2 567', f.input('7'))
  assertEquals('0011 81 3332 2 5678', f.input('8'))

  // 0011 244 250 253 222
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('00', f.input('0'))
  assertEquals('001', f.input('1'))
  assertEquals('0011', f.input('1'))
  assertEquals('00112', f.input('2'))
  assertEquals('001124', f.input('4'))
  assertEquals('0011 244', f.input('4'))
  assertEquals('0011 244 2', f.input('2'))
  assertEquals('0011 244 25', f.input('5'))
  assertEquals('0011 244 250', f.input('0'))
  assertEquals('0011 244 250 2', f.input('2'))
  assertEquals('0011 244 250 25', f.input('5'))
  assertEquals('0011 244 250 253', f.input('3'))
  assertEquals('0011 244 250 253 2', f.input('2'))
  assertEquals('0011 244 250 253 22', f.input('2'))
  assertEquals('0011 244 250 253 222', f.input('2'))
}

function testAYTFLongIDD_KR() {
  var f = AsYouType('KR')
  // 00300 1 650 253 2222
  assertEquals('0', f.input('0'))
  assertEquals('00', f.input('0'))
  assertEquals('003', f.input('3'))
  assertEquals('0030', f.input('0'))
  assertEquals('00300', f.input('0'))
  assertEquals('00300 1', f.input('1'))
  assertEquals('00300 1 6', f.input('6'))
  assertEquals('00300 1 65', f.input('5'))
  assertEquals('00300 1 650', f.input('0'))
  assertEquals('00300 1 650 2', f.input('2'))
  assertEquals('00300 1 650 25', f.input('5'))
  assertEquals('00300 1 650 253', f.input('3'))
  assertEquals('00300 1 650 253 2', f.input('2'))
  assertEquals('00300 1 650 253 22', f.input('2'))
  assertEquals('00300 1 650 253 222', f.input('2'))
  assertEquals('00300 1 650 253 2222', f.input('2'))
}

function testAYTFLongNDD_KR() {
  var f = AsYouType('KR')
  // 08811-9876-7890
  assertEquals('0', f.input('0'))
  assertEquals('08', f.input('8'))
  assertEquals('088', f.input('8'))
  assertEquals('0881', f.input('1'))
  assertEquals('08811', f.input('1'))
  assertEquals('08811-9', f.input('9'))
  assertEquals('08811-98', f.input('8'))
  assertEquals('08811-987', f.input('7'))
  assertEquals('08811-9876', f.input('6'))
  assertEquals('08811-9876-7', f.input('7'))
  assertEquals('08811-9876-78', f.input('8'))
  assertEquals('08811-9876-789', f.input('9'))
  assertEquals('08811-9876-7890', f.input('0'))

  // 08500 11-9876-7890
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('08', f.input('8'))
  assertEquals('085', f.input('5'))
  assertEquals('0850', f.input('0'))
  assertEquals('08500', f.input('0'))
  assertEquals('08500 1', f.input('1'))
  assertEquals('08500 11', f.input('1'))
  assertEquals('08500 11-9', f.input('9'))
  assertEquals('08500 11-98', f.input('8'))
  assertEquals('08500 11-987', f.input('7'))
  assertEquals('08500 11-9876', f.input('6'))
  assertEquals('08500 11-9876-7', f.input('7'))
  assertEquals('08500 11-9876-78', f.input('8'))
  assertEquals('08500 11-9876-789', f.input('9'))
  assertEquals('08500 11-9876-7890', f.input('0'))
}

function testAYTFLongNDD_SG() {
  var f = AsYouType('SG')
  // 777777 9876 7890
  assertEquals('7', f.input('7'))
  assertEquals('77', f.input('7'))
  assertEquals('777', f.input('7'))
  assertEquals('7777', f.input('7'))
  assertEquals('77777', f.input('7'))
  assertEquals('777777', f.input('7'))
  assertEquals('777777 9', f.input('9'))
  assertEquals('777777 98', f.input('8'))
  assertEquals('777777 987', f.input('7'))
  assertEquals('777777 9876', f.input('6'))
  assertEquals('777777 9876 7', f.input('7'))
  assertEquals('777777 9876 78', f.input('8'))
  assertEquals('777777 9876 789', f.input('9'))
  assertEquals('777777 9876 7890', f.input('0'))
}

function testAYTFShortNumberFormattingFix_AU() {
  // For Australia, the national prefix is not optional when formatting.
  var f = AsYouType('AU')

  // 1234567890 - For leading digit 1, the national prefix formatting rule has
  // first group only.
  assertEquals('1', f.input('1'))
  assertEquals('12', f.input('2'))
  assertEquals('123', f.input('3'))
  assertEquals('1234', f.input('4'))
  assertEquals('1234 5', f.input('5'))
  assertEquals('1234 56', f.input('6'))
  assertEquals('1234 567', f.input('7'))
  assertEquals('1234 567 8', f.input('8'))
  assertEquals('1234 567 89', f.input('9'))
  assertEquals('1234 567 890', f.input('0'))

  // +61 1234 567 890 - Test the same number, but with the country code.
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+6', f.input('6'))
  assertEquals('+61', f.input('1'))
  assertEquals('+61 1', f.input('1'))
  assertEquals('+61 12', f.input('2'))
  assertEquals('+61 123', f.input('3'))
  assertEquals('+61 1234', f.input('4'))
  assertEquals('+61 1234 5', f.input('5'))
  assertEquals('+61 1234 56', f.input('6'))
  assertEquals('+61 1234 567', f.input('7'))
  assertEquals('+61 1234 567 8', f.input('8'))
  assertEquals('+61 1234 567 89', f.input('9'))
  assertEquals('+61 1234 567 890', f.input('0'))

  // 212345678 - For leading digit 2, the national prefix formatting rule puts
  // the national prefix before the first group.
  f.reset()
  assertEquals('0', f.input('0'))
  assertEquals('02', f.input('2'))
  assertEquals('021', f.input('1'))
  assertEquals('02 12', f.input('2'))
  assertEquals('02 123', f.input('3'))
  assertEquals('02 1234', f.input('4'))
  assertEquals('02 1234 5', f.input('5'))
  assertEquals('02 1234 56', f.input('6'))
  assertEquals('02 1234 567', f.input('7'))
  assertEquals('02 1234 5678', f.input('8'))

  // 212345678 - Test the same number, but without the leading 0.
  f.reset()
  assertEquals('2', f.input('2'))
  assertEquals('21', f.input('1'))
  assertEquals('212', f.input('2'))
  assertEquals('2123', f.input('3'))
  assertEquals('21234', f.input('4'))
  assertEquals('212345', f.input('5'))
  assertEquals('2123456', f.input('6'))
  assertEquals('21234567', f.input('7'))
  assertEquals('212345678', f.input('8'))

  // +61 2 1234 5678 - Test the same number, but with the country code.
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+6', f.input('6'))
  assertEquals('+61', f.input('1'))
  assertEquals('+61 2', f.input('2'))
  assertEquals('+61 21', f.input('1'))
  assertEquals('+61 2 12', f.input('2'))
  assertEquals('+61 2 123', f.input('3'))
  assertEquals('+61 2 1234', f.input('4'))
  assertEquals('+61 2 1234 5', f.input('5'))
  assertEquals('+61 2 1234 56', f.input('6'))
  assertEquals('+61 2 1234 567', f.input('7'))
  assertEquals('+61 2 1234 5678', f.input('8'))
}

function testAYTFShortNumberFormattingFix_KR() {
  // For Korea, the national prefix is not optional when formatting, and the
  // national prefix formatting rule doesn't consist of only the first group.
  var f = AsYouType('KR')

  // 111
  assertEquals('1', f.input('1'))
  assertEquals('11', f.input('1'))
  assertEquals('111', f.input('1'))

  // 114
  f.reset()
  assertEquals('1', f.input('1'))
  assertEquals('11', f.input('1'))
  assertEquals('114', f.input('4'))

  // 13121234 - Test a mobile number without the national prefix. Even though it
  // is not an emergency number, it should be formatted as a block.
  f.reset()
  assertEquals('1', f.input('1'))
  assertEquals('13', f.input('3'))
  assertEquals('131', f.input('1'))
  assertEquals('1312', f.input('2'))
  assertEquals('13121', f.input('1'))
  assertEquals('131212', f.input('2'))
  assertEquals('1312123', f.input('3'))
  assertEquals('13121234', f.input('4'))

  // +82 131-2-1234 - Test the same number, but with the country code.
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+82', f.input('2'))
  assertEquals('+82 1', f.input('1'))
  assertEquals('+82 13', f.input('3'))
  assertEquals('+82 131', f.input('1'))
  assertEquals('+82 131-2', f.input('2'))
  assertEquals('+82 131-2-1', f.input('1'))
  assertEquals('+82 131-2-12', f.input('2'))
  assertEquals('+82 131-2-123', f.input('3'))
  assertEquals('+82 131-2-1234', f.input('4'))
}

function testAYTFShortNumberFormattingFix_MX() {
  // For Mexico, the national prefix is optional when formatting.
  var f = AsYouType('MX')

  // 911
  assertEquals('9', f.input('9'))
  assertEquals('91', f.input('1'))
  assertEquals('911', f.input('1'))

  // 800 123 4567 - Test a toll-free number, which should have a formatting rule
  // applied to it even though it doesn't begin with the national prefix.
  f.reset()
  assertEquals('8', f.input('8'))
  assertEquals('80', f.input('0'))
  assertEquals('800', f.input('0'))
  assertEquals('800 1', f.input('1'))
  assertEquals('800 12', f.input('2'))
  assertEquals('800 123', f.input('3'))
  assertEquals('800 123 4', f.input('4'))
  assertEquals('800 123 45', f.input('5'))
  assertEquals('800 123 456', f.input('6'))
  assertEquals('800 123 4567', f.input('7'))

  // +52 800 123 4567 - Test the same number, but with the country code.
  f.reset()
  assertEquals('+', f.input('+'))
  assertEquals('+5', f.input('5'))
  assertEquals('+52', f.input('2'))
  assertEquals('+52 8', f.input('8'))
  assertEquals('+52 80', f.input('0'))
  assertEquals('+52 800', f.input('0'))
  assertEquals('+52 800 1', f.input('1'))
  assertEquals('+52 800 12', f.input('2'))
  assertEquals('+52 800 123', f.input('3'))
  assertEquals('+52 800 123 4', f.input('4'))
  assertEquals('+52 800 123 45', f.input('5'))
  assertEquals('+52 800 123 456', f.input('6'))
  assertEquals('+52 800 123 4567', f.input('7'))
}

function testAYTFNoNationalPrefix() {
  var f = AsYouType('IT')
  assertEquals('3', f.input('3'))
  assertEquals('33', f.input('3'))
  assertEquals('333', f.input('3'))
  assertEquals('333 3', f.input('3'))
  assertEquals('333 33', f.input('3'))
  assertEquals('333 333', f.input('3'))
}

function testAYTFNoNationalPrefixFormattingRule() {
  var f = AsYouType('AO')
  assertEquals('3', f.input('3'))
  assertEquals('33', f.input('3'))
  assertEquals('333', f.input('3'))
  assertEquals('333 3', f.input('3'))
  assertEquals('333 33', f.input('3'))
  assertEquals('333 333', f.input('3'))
}

function testAYTFShortNumberFormattingFix_US() {
  // For the US, an initial 1 is treated specially.
  var f = AsYouType('US')

  // 101 - Test that the initial 1 is not treated as a national prefix.
  assertEquals('1', f.input('1'))
  assertEquals('10', f.input('0'))
  assertEquals('101', f.input('1'))

  // 112 - Test that the initial 1 is not treated as a national prefix.
  f.reset()
  assertEquals('1', f.input('1'))
  assertEquals('11', f.input('1'))
  assertEquals('112', f.input('2'))

  // 122 - Test that the initial 1 is treated as a national prefix.
  f.reset()
  assertEquals('1', f.input('1'))
  assertEquals('12', f.input('2'))
  assertEquals('1 22', f.input('2'))
}

function testAYTFClearNDDAfterIddExtraction() {
  var f = AsYouType('KR')

  assertEquals('0', f.input('0'))
  assertEquals('00', f.input('0'))
  assertEquals('007', f.input('7'))
  assertEquals('0070', f.input('0'))
  assertEquals('00700', f.input('0'))
  // NDD is '0' at this stage (the first '0' in '00700') because it's not
  // clear if the number is a national number or using the IDD to dial out.
  assertEquals('00700 1', f.input('1'))
  // NDD should be cleared here because IDD '00700' was extracted after the
  // country calling code '1' (US) was entered.
  assertEquals('00700 1 2', f.input('2'))
  // The remaining long sequence of inputs is because the original bug that
  // this test if for only triggered after a lot of subsequent inputs.
  assertEquals('00700 1 23', f.input('3'))
  assertEquals('00700 1 234', f.input('4'))
  assertEquals('00700 1 234 5', f.input('5'))
  assertEquals('00700 1 234 56', f.input('6'))
  assertEquals('00700 1 234 567', f.input('7'))
  assertEquals('00700 1 234 567 8', f.input('8'))
  assertEquals('00700 1 234 567 89', f.input('9'))
  assertEquals('00700 1 234 567 890', f.input('0'))
  assertEquals('00700 1 234 567 8901', f.input('1'))
  assertEquals('00700123456789012', f.input('2'))
  assertEquals('007001234567890123', f.input('3'))
  assertEquals('0070012345678901234', f.input('4'))
  assertEquals('00700123456789012345', f.input('5'))
  assertEquals('007001234567890123456', f.input('6'))
  assertEquals('0070012345678901234567', f.input('7'))
}

function testAYTFNumberPatternsBecomingInvalidShouldNotResultInDigitLoss() {
  var f = AsYouType('CN')

  assertEquals('+', f.input('+'))
  assertEquals('+8', f.input('8'))
  assertEquals('+86', f.input('6'))
  assertEquals('+86 9', f.input('9'))
  assertEquals('+86 98', f.input('8'))
  assertEquals('+86 988', f.input('8'))
  assertEquals('+86 988 1', f.input('1'))
  // Now the number pattern is no longer valid because there are multiple
  // leading digit patterns; when we try again to extract a country code we
  // should ensure we use the last leading digit pattern, rather than the first
  // one such that it *thinks* it's found a valid formatting rule again.
  // https://github.com/google/libphonenumber/issues/437
  assertEquals('+8698812', f.input('2'))
  assertEquals('+86988123', f.input('3'))
  assertEquals('+869881234', f.input('4'))
  assertEquals('+8698812345', f.input('5'))
}
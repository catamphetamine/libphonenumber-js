// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

export default function format(number, options = {})
{
  // if (number.getNationalNumber() == 0 && number.hasRawInput()) {
  //   // Unparseable numbers that kept their raw input just use that.
  //   // This is the only case where a number can be formatted as E164 without a
  //   // leading '+' symbol (but the original number wasn't parseable anyway).
  //   // TODO: Consider removing the 'if' above so that unparseable strings
  //   // without raw input format to the empty string instead of "+00"
  //   var rawInput = number.getRawInputOrDefault();
  //   if (rawInput.length > 0) {
  //     return rawInput;
  //   }
  // }
  // var countryCallingCode = number.getCountryCodeOrDefault()
  // var nationalSignificantNumber = this.getNationalSignificantNumber(number)
  // if (numberFormat == i18n.phonenumbers.PhoneNumberFormat.E164)
  // {
  //   // Early exit for E164 case (even if the country calling code is invalid)
  //   // since no formatting of the national number needs to be applied.
  //   // Extensions are not formatted.
  //   return this.prefixNumberWithCountryCallingCode_(
  //       countryCallingCode, i18n.phonenumbers.PhoneNumberFormat.E164,
  //       nationalSignificantNumber, '')
  // }
  // if (!this.hasValidCountryCallingCode_(countryCallingCode))
  // {
  //   return nationalSignificantNumber
  // }
  // // Note getRegionCodeForCountryCode() is used because formatting information
  // // for regions which share a country calling code is contained by only one
  // // region for performance reasons. For example, for NANPA regions it will be
  // // contained in the metadata for US.
  // var regionCode = this.getRegionCodeForCountryCode(countryCallingCode)

  // // Metadata cannot be null because the country calling code is valid (which
  // // means that the region code cannot be ZZ and must be one of our supported
  // // region codes).
  // var metadata = get_metadata_for_region_or_calling_code(countryCallingCode, regionCode)
  // var formattedExtension = maybeGetFormattedExtension_(number, metadata, numberFormat)
  // var formattedNationalNumber = formatNsn_(nationalSignificantNumber, metadata, numberFormat)
  // return this.prefixNumberWithCountryCallingCode_(countryCallingCode,
  //                                                 numberFormat,
  //                                                 formattedNationalNumber,
  //                                                 formattedExtension)
}
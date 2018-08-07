import { sort_out_arguments } from './getNumberType';
import isValidNumber from './validate';

/**
 * Checks if a given phone number is valid.
 *
 * If the `number` is a string, it will be parsed to an object,
 * but only if it contains only valid phone number characters.
 * If the `number` is an object, it is used as is.
 *
 * The `country` argument is the country the number must belong to.
 * This is a stricter version of `isValidNumber(number, defaultCountry)`.
 * Though restricting a country might not be a good idea.
 * https://github.com/googlei18n/libphonenumber/blob/master/FAQ.md#when-should-i-use-isvalidnumberforregion
 *
 * Doesn't accept `number` object, only `number` string with a `country` string.
 */
export default function isValidNumberForRegion(number, country, _metadata) {
  if (typeof number !== 'string') {
    throw new TypeError('number must be a string');
  }

  if (typeof country !== 'string') {
    throw new TypeError('country must be a string');
  }

  var _sort_out_arguments = sort_out_arguments(number, country, _metadata),
      input = _sort_out_arguments.input,
      metadata = _sort_out_arguments.metadata;

  return input.country === country && isValidNumber(input, metadata.metadata);
}
//# sourceMappingURL=isValidNumberForRegion.js.map
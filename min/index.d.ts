import {
  Metadata,
  PhoneNumber,
  E164Number,
  CountryCallingCode,
  CountryCode,
  CarrierCode,
  NationalNumber,
  Extension,
  ParseError,
  NumberFoundLegacy,
  NumberFound,
  NumberType,
  NumberFormat
} from '../types';

// They say this re-export is required.
// https://github.com/catamphetamine/libphonenumber-js/pull/290#issuecomment-453281180
export {
  Metadata,
  PhoneNumber,
  E164Number,
  CountryCallingCode,
  CountryCode,
  CarrierCode,
  NationalNumber,
  Extension,
  ParseError,
  NumberFoundLegacy,
  NumberFound,
  NumberType,
  NumberFormat
};

// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;

export function parsePhoneNumberWithError(text: string, defaultCountry?: CountryCode): PhoneNumber;

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): PhoneNumber | undefined;

export default parsePhoneNumberFromString;

export function findNumbers(text: string, options?: CountryCode): NumberFoundLegacy[];
export function searchNumbers(text: string, options?: CountryCode): IterableIterator<NumberFoundLegacy>;

export function findNumbers(text: string, options?: { defaultCountry?: CountryCode, v2: true }): NumberFound[];
export function searchNumbers(text: string, options?: { defaultCountry?: CountryCode, v2: true }): IterableIterator<NumberFound>;

export function findPhoneNumbersInText(text: string, options?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): NumberFound[];
export function searchPhoneNumbersInText(text: string, options?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, options?: { defaultCountry?: CountryCode, v2: true });
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function isSupportedCountry(countryCode: CountryCode): boolean;
export function getCountries(): CountryCode[];
export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode): string;

export function getExampleNumber(country: CountryCode, examples: { [country in CountryCode]: NationalNumber }): PhoneNumber | undefined;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string });
  input(text: string): string;
  reset(): void;
  getNumber(): PhoneNumber | undefined;
  getChars(): string;
  getTemplate(): string;
}

// The exported `Metadata` name is already used for exporting the "raw" JSON metadata type.
// Then, `Metadata` class has become exported, but its name is already taken, so TypeScript users seem to be unable to use the `Metadata` class.
// If someone knows a solution then they could propose it in an issue.
// export class Metadata {
//   ...
// }
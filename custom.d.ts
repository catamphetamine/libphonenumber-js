// `/custom` export is deprecated.
// Use `/core` sub-package instead.

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
} from './types';

import {
  ParsedNumber,
  FormatNumberOptions,
  ParseNumberOptions
} from './index';

export {
  Metadata,
  PhoneNumber,
  E164Number,
  CountryCallingCode,
  CountryCode,
  CarrierCode,
  NationalNumber,
  Extension,
  FormatNumberOptions,
  ParsedNumber,
  ParseNumberOptions,
  ParseError,
  NumberFoundLegacy,
  NumberFound,
  NumberFormat,
  NumberType
};

// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export function parsePhoneNumber(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumber(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

export function parsePhoneNumberWithError(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumberWithError(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export function parsePhoneNumberFromString(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumberFromString(text: string, defaultCountry: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }, metadata: Metadata): PhoneNumber;

export default parsePhoneNumberFromString;

export function parse(text: string, metadata: Metadata): ParsedNumber;
export function parse(text: string, options: CountryCode | ParseNumberOptions, metadata: Metadata): ParsedNumber;

export function parseNumber(text: string, metadata: Metadata): ParsedNumber | {};
export function parseNumber(text: string, options: CountryCode | ParseNumberOptions, metadata: Metadata): ParsedNumber | {};

// `format()` and `formatCustom` are deprecated.
// Use `formatNumber()` and `formatNumberCustom()` instead.
export function format(parsedNumber: ParsedNumber, format: NumberFormat, metadata: Metadata): string;
export function format(phone: NationalNumber, format: NumberFormat, metadata: Metadata): string;
export function format(phone: NationalNumber, country: CountryCode, format: NumberFormat, metadata: Metadata): string;

export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat, metadata: Metadata): string;
export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat, options: FormatNumberOptions, metadata: Metadata): string;

export function formatNumber(phone: NationalNumber, format: NumberFormat, metadata: Metadata): string;
export function formatNumber(phone: NationalNumber, format: NumberFormat, options: FormatNumberOptions, metadata: Metadata): string;

export function formatNumber(phone: NationalNumber, country: CountryCode, format: NumberFormat, metadata: Metadata): string;
export function formatNumber(phone: NationalNumber, country: CountryCode, format: NumberFormat, options: FormatNumberOptions, metadata: Metadata): string;

export function getNumberType(parsedNumber: ParsedNumber, metadata: Metadata): NumberType;
export function getNumberType(phone: NationalNumber, metadata: Metadata): NumberType;
export function getNumberType(phone: NationalNumber, country: CountryCode, metadata: Metadata): NumberType;

export function getExampleNumber(country: CountryCode, examples: { [country in CountryCode]: NationalNumber }, metadata: Metadata): PhoneNumber | undefined;

export function isPossibleNumber(parsedNumber: ParsedNumber, metadata: Metadata): boolean;
export function isPossibleNumber(phone: NationalNumber, metadata: Metadata): boolean;
export function isPossibleNumber(phone: NationalNumber, country: CountryCode, metadata: Metadata): boolean;

export function isValidNumber(parsedNumber: ParsedNumber, metadata: Metadata): boolean;
export function isValidNumber(phone: NationalNumber, metadata: Metadata): boolean;
export function isValidNumber(phone: NationalNumber, country: CountryCode, metadata: Metadata): boolean;

export function isValidNumberForRegion(phone: NationalNumber, country: CountryCode, metadata: Metadata): boolean;

// Deprecated.
export function findParsedNumbers(text: string, metadata: Metadata): NumberFoundLegacy[];
export function findParsedNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: Metadata): NumberFoundLegacy[];

// Deprecated.
export function searchParsedNumbers(text: string, metadata: Metadata): IterableIterator<NumberFoundLegacy>;
export function searchParsedNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: Metadata): IterableIterator<NumberFoundLegacy>;

// Deprecated.
export class ParsedNumberSearch {
  constructor(text: string, metadata: Metadata);
  constructor(text: string, options: { defaultCountry?: CountryCode }, metadata: Metadata);
  hasNext(): boolean;
  next(): NumberFoundLegacy | undefined;
}

export function findNumbers(text: string, metadata: Metadata): NumberFoundLegacy[];
export function findNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode, v2: true }, metadata: Metadata): NumberFound[];

export function searchNumbers(text: string, metadata: Metadata): IterableIterator<NumberFoundLegacy>;
export function searchNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode, v2: true }, metadata: Metadata): IterableIterator<NumberFound>;

export function findPhoneNumbersInText(text: string, metadata: Metadata): NumberFound[];
export function findPhoneNumbersInText(text: string, options: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }, metadata: Metadata): NumberFound[];

export function searchPhoneNumbersInText(text: string, metadata: Metadata): IterableIterator<NumberFound>;
export function searchPhoneNumbersInText(text: string, options: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }, metadata: Metadata): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, metadata: Metadata);
  constructor(text: string, options: { defaultCountry?: CountryCode, v2: true }, metadata: Metadata);
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function getCountries(metadata: Metadata): CountryCode[];
export function getCountryCallingCode(countryCode: CountryCode, metadata: Metadata): CountryCallingCode;
// Deprecated
export function getPhoneCode(countryCode: CountryCode, metadata: Metadata): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode, metadata: Metadata): string;
export function isSupportedCountry(countryCode: CountryCode, metadata: Metadata): boolean;

export function formatIncompletePhoneNumber(number: string, metadata: Metadata): string;
export function formatIncompletePhoneNumber(number: string, countryCode: CountryCode, metadata: Metadata): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string } | undefined, metadata: Metadata);
  input(text: string): string;
  reset(): void;
  country: CountryCode | undefined;
  getNumber(): PhoneNumber | undefined;
  getNationalNumber(): string;
  getChars(): string;
  getTemplate(): string;
}

// The exported `Metadata` name is already used for exporting the "raw" JSON metadata type.
// Then, `Metadata` class has become exported, but its name is already taken, so TypeScript users seem to be unable to use the `Metadata` class.
// If someone knows a solution then they could propose it in an issue.
// export class Metadata {
//   ...
// }
// The default export is currently a legacy one.
// (containing legacy functions along with the new API).
// `/min`, `/max`, `/mobile` sub-packages are for the new API only.

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
  NumberFound,
  NumberType,
  NumberFormat
} from './types';

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
  NumberFound,
  NumberFormat,
  NumberType
};

type FormatExtension = (number: string, extension: string, metadata: Metadata) => string

type FormatNumberOptionsWithoutIDD = {
  v2?: boolean;
  formatExtension?: FormatExtension;
};

export type FormatNumberOptions = {
  v2?: boolean;
  fromCountry?: CountryCode;
  humanReadable?: boolean;
  formatExtension?: FormatExtension
};

// Legacy.
export type ParseNumberOptions = {
  defaultCountry?: CountryCode;
  extended?: boolean;
};

export interface ParsedNumber {
  countryCallingCode?: CountryCallingCode,
  country: CountryCode,
  phone: NationalNumber,
  ext?: Extension,
  possible?: boolean,
  valid?: boolean
}

export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode): PhoneNumber;

// `parse()` and `parseCustom` are deprecated.
// Use `fparseNumber()` and `parseNumberCustom()` instead.
export function parse(text: string, options?: CountryCode | ParseNumberOptions): ParsedNumber;

export function parseNumber(text: string, options?: CountryCode | ParseNumberOptions): ParsedNumber;

// `format()` and `formatCustom` are deprecated.
// Use `formatNumber()` and `formatNumberCustom()` instead.
export function format(parsedNumber: ParsedNumber, format: NumberFormat): string;
export function format(phone: NationalNumber, format: NumberFormat): string;
export function format(phone: NationalNumber, country: CountryCode, format: NumberFormat): string;

export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat, options?: FormatNumberOptions): string;
export function formatNumber(phone: NationalNumber, format: NumberFormat, options?: FormatNumberOptions): string;
export function formatNumber(phone: NationalNumber, country: CountryCode, format: NumberFormat, options?: FormatNumberOptions): string;

export function getNumberType(parsedNumber: ParsedNumber): NumberType;
export function getNumberType(phone: NationalNumber, country?: CountryCode): NumberType;

export function getExampleNumber(country: CountryCode, examples: { [country in CountryCode]: NationalNumber }): PhoneNumber | undefined;

export function isPossibleNumber(parsedNumber: ParsedNumber): boolean;
export function isPossibleNumber(phone: NationalNumber, country?: CountryCode): boolean;

export function isValidNumber(parsedNumber: ParsedNumber): boolean;
export function isValidNumber(phone: NationalNumber, country?: CountryCode): boolean;

export function isValidNumberForRegion(phone: NationalNumber, country: CountryCode): boolean;

// Deprecated.
export function findParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): NumberFound[];
export function searchParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): IterableIterator<NumberFound>;

// Deprecated.
export class ParsedNumberSearch {
  constructor(text: string, options?: { defaultCountry?: CountryCode });
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function findNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }): NumberFound[];
export function searchNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, options?: { defaultCountry?: CountryCode, v2?: boolean });
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;
// Deprecated.
export function getPhoneCode(countryCode: CountryCode): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode): string;
export function isSupportedCountry(countryCode: CountryCode): boolean;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode?: CountryCode);
  input(text: string): string;
  reset(): void;
  country: CountryCode | undefined;
  getNumber(): PhoneNumber | undefined;
  getNationalNumber(): string;
  getTemplate(): string | undefined;
}

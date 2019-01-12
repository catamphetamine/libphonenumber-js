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
  NumberFound,
  NumberFormat,
  NumberType
};

export function parsePhoneNumber(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumber(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

export function parsePhoneNumberFromString(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumberFromString(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

export function parse(text: string, metadata: Metadata): ParsedNumber;
export function parse(text: string, options: CountryCode | ParseNumberOptions, metadata: Metadata): ParsedNumber;

export function parseNumber(text: string, metadata: Metadata): ParsedNumber;
export function parseNumber(text: string, options: CountryCode | ParseNumberOptions, metadata: Metadata): ParsedNumber;

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
export function findParsedNumbers(text: string, metadata: Metadata): NumberFound[];
export function findParsedNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: Metadata): NumberFound[];

// Deprecated.
export function searchParsedNumbers(text: string, metadata: Metadata): IterableIterator<NumberFound>;
export function searchParsedNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: Metadata): IterableIterator<NumberFound>;

// Deprecated.
export class ParsedNumberSearch {
  constructor(text: string, metadata: Metadata);
  constructor(text: string, options: { defaultCountry?: CountryCode }, metadata: Metadata);
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function findNumbers(text: string, metadata: Metadata): NumberFound[];
export function findNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }, metadata: Metadata): NumberFound[];

export function searchNumbers(text: string, metadata: Metadata): IterableIterator<NumberFound>;
export function searchNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }, metadata: Metadata): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, metadata: Metadata);
  constructor(text: string, options: { defaultCountry?: CountryCode, v2?: boolean }, metadata: Metadata);
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

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
  constructor(defaultCountryCode: CountryCode | undefined, metadata: Metadata);
  input(text: string): string;
  reset(): void;
  country: CountryCode | undefined;
  getNumber(): PhoneNumber | undefined;
  getNationalNumber(): string;
  getTemplate(): string | undefined;
}

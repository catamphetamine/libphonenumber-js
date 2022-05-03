import {
  MetadataJson,
  Examples,
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
  NumberFormat,
  NumberingPlan,
  ValidatePhoneNumberLengthResult
} from './types';

export {
  MetadataJson,
  Examples,
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
  NumberFormat,
  NumberType,
  NumberingPlan,
  ValidatePhoneNumberLengthResult
};

type FormatExtension = (number: string, extension: string, metadata: MetadataJson) => string

type FormatNumberOptionsWithoutIDD = {
  v2?: boolean;
  formatExtension?: FormatExtension;
};

export type FormatNumberOptions = {
  v2?: boolean;
  fromCountry?: CountryCode;
  humanReadable?: boolean;
  formatExtension?: FormatExtension;
};

// Legacy.
export type ParseNumberOptions = {
  defaultCountry?: CountryCode;
  extended?: boolean;
};

export interface ParsedNumber {
  countryCallingCode?: CountryCallingCode;
  country: CountryCode;
  phone: NationalNumber;
  ext?: Extension;
  possible?: boolean;
  valid?: boolean;
}

// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;
export function parsePhoneNumberWithError(text: string, defaultCountry?: CountryCode): PhoneNumber;

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extract?: boolean }): PhoneNumber | undefined;

export default parsePhoneNumberFromString;

export function isValidPhoneNumber(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): boolean;
export function isPossiblePhoneNumber(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): boolean;
export function validatePhoneNumberLength(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): ValidatePhoneNumberLengthResult | undefined;

// `parse()` and `parseCustom` are deprecated.
// Use `parseNumber()` and `parseNumberCustom()` instead.
export function parse(text: string, options?: CountryCode | ParseNumberOptions): ParsedNumber;

export function parseNumber(text: string, options?: CountryCode | ParseNumberOptions): ParsedNumber | {};

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

export function getExampleNumber(country: CountryCode, examples: Examples): PhoneNumber | undefined;

export function isPossibleNumber(parsedNumber: ParsedNumber): boolean;
export function isPossibleNumber(phone: NationalNumber, country?: CountryCode): boolean;

export function isValidNumber(parsedNumber: ParsedNumber): boolean;
export function isValidNumber(phone: NationalNumber, country?: CountryCode): boolean;

export function isValidNumberForRegion(phone: NationalNumber, country: CountryCode): boolean;

// Deprecated.
export function findParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): NumberFoundLegacy[];
export function searchParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): IterableIterator<NumberFoundLegacy>;

// Deprecated.
export class ParsedNumberSearch {
  constructor(text: string, options?: { defaultCountry?: CountryCode });
  hasNext(): boolean;
  next(): NumberFoundLegacy | undefined;
}

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

export function getCountries(): CountryCode[];
export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;
// Deprecated.
export function getPhoneCode(countryCode: CountryCode): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode): string;
export function isSupportedCountry(countryCode: string): boolean;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string });
  input(text: string): string;
  reset(): void;
  country: CountryCode | undefined;
  getNumber(): PhoneNumber | undefined;
  getNumberValue(): E164Number | undefined;
  getNationalNumber(): string;
  getChars(): string;
  getTemplate(): string;
  getCallingCode(): string | undefined;
  getCountry(): CountryCode | undefined;
  isInternational(): boolean;
  isPossible(): boolean;
  isValid(): boolean;
}

export class Metadata {
  constructor();
  selectNumberingPlan(country: CountryCode): void;
  numberingPlan?: NumberingPlan;
}

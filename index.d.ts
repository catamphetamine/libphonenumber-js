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
} from './types.d.js';

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

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extract?: boolean }): PhoneNumber | undefined;

export default parsePhoneNumberFromString;

export function parsePhoneNumberWithError(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extract?: boolean }): PhoneNumber;

export function getExampleNumber(country: CountryCode, examples: Examples): PhoneNumber | undefined;

export function isValidPhoneNumber(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): boolean;
export function isPossiblePhoneNumber(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): boolean;
export function validatePhoneNumberLength(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): ValidatePhoneNumberLengthResult | undefined;

export function findPhoneNumbersInText(text: string, options?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extended?: boolean }): NumberFound[];
export function searchPhoneNumbersInText(text: string, options?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extended?: boolean }): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, options?: { defaultCountry?: CountryCode, v2: true });
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function getCountries(): CountryCode[];
export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode): string;
export function isSupportedCountry(countryCode: string): countryCode is CountryCode;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function formatIncompletePhoneNumber(number: string, defaultCountryCode?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): string;
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

/**
 * @deprecated `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`
 */
export function parsePhoneNumber(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extract?: boolean }): PhoneNumber;

/**
 * @deprecated
 */
export interface ParsedNumber {
  countryCallingCode?: CountryCallingCode;
  country: CountryCode;
  phone: NationalNumber;
  ext?: Extension;
  possible?: boolean;
  valid?: boolean;
}

/**
 * @deprecated
 */
export type ParseNumberOptions = {
  defaultCountry?: CountryCode;
  extended?: boolean;
};

/**
 * @deprecated
 */
export function parse(text: string, options?: CountryCode | ParseNumberOptions): ParsedNumber;

/**
 * @deprecated
 */
export function parseNumber(text: string, options?: CountryCode | ParseNumberOptions): ParsedNumber | {};

/**
 * @deprecated
 */
type FormatExtension = (number: string, extension: string, metadata: MetadataJson) => string

/**
 * @deprecated
 */
export type FormatNumberOptions = {
  v2?: boolean;
  fromCountry?: CountryCode;
  humanReadable?: boolean;
  formatExtension?: FormatExtension;
};

/**
 * @deprecated
 */
export function format(parsedNumber: ParsedNumber, format: NumberFormat): string;
export function format(phone: string, format: NumberFormat): string;
export function format(phone: string, country: CountryCode, format: NumberFormat): string;

/**
 * @deprecated
 */
export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat, options?: FormatNumberOptions): string;
export function formatNumber(phone: string, format: NumberFormat, options?: FormatNumberOptions): string;
export function formatNumber(phone: string, country: CountryCode, format: NumberFormat, options?: FormatNumberOptions): string;

/**
 * @deprecated
 */
export function getNumberType(parsedNumber: ParsedNumber): NumberType;
export function getNumberType(phone: string, country?: CountryCode): NumberType;

/**
 * @deprecated
 */
export function isPossibleNumber(parsedNumber: ParsedNumber): boolean;
export function isPossibleNumber(phone: string, country?: CountryCode): boolean;

/**
 * @deprecated
 */
export function isValidNumber(parsedNumber: ParsedNumber): boolean;
export function isValidNumber(phone: string, country?: CountryCode): boolean;

/**
 * @deprecated
 */
export function isValidNumberForRegion(phone: string, country: CountryCode): boolean;

/**
 * @deprecated
 */
export function findParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): NumberFoundLegacy[];
export function searchParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): IterableIterator<NumberFoundLegacy>;

/**
 * @deprecated
 */
export class ParsedNumberSearch {
  constructor(text: string, options?: { defaultCountry?: CountryCode });
  hasNext(): boolean;
  next(): NumberFoundLegacy | undefined;
}

/**
 * @deprecated
 */
export function findNumbers(text: string, options?: CountryCode): NumberFoundLegacy[];
export function searchNumbers(text: string, options?: CountryCode): IterableIterator<NumberFoundLegacy>;

/**
 * @deprecated
 */
export function findNumbers(text: string, options?: { defaultCountry?: CountryCode, v2: true }): NumberFound[];
export function searchNumbers(text: string, options?: { defaultCountry?: CountryCode, v2: true }): IterableIterator<NumberFound>;

/**
 * @deprecated
 */
export function getPhoneCode(countryCode: CountryCode): CountryCallingCode;

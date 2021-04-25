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
export function parsePhoneNumber(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumber(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

export function parsePhoneNumberWithError(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumberWithError(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export function parsePhoneNumberFromString(text: string, metadata: Metadata): PhoneNumber | undefined;
export function parsePhoneNumberFromString(text: string, defaultCountry: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string, extract?: boolean }, metadata: Metadata): PhoneNumber | undefined;

export default parsePhoneNumberFromString;

export function isValidPhoneNumber(text: string, metadata: Metadata): boolean;
export function isValidPhoneNumber(text: string, defaultCountry: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }, metadata: Metadata): boolean;

export function isPossiblePhoneNumber(text: string, metadata: Metadata): boolean;
export function isPossiblePhoneNumber(text: string, defaultCountry: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }, metadata: Metadata): boolean;

export function findNumbers(text: string, metadata: Metadata): NumberFoundLegacy[];
export function findNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode, v2: true }, metadata: Metadata): NumberFound[];

export function searchNumbers(text: string, metadata: Metadata): IterableIterator<NumberFoundLegacy>;
export function searchNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode, v2: true }, metadata: Metadata): IterableIterator<NumberFound>;

export function findPhoneNumbersInText(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: Metadata): NumberFound[];
export function findPhoneNumbersInText(text: string, metadata: Metadata): NumberFound[];

export function searchPhoneNumbersInText(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: Metadata): IterableIterator<NumberFound>;
export function searchPhoneNumbersInText(text: string, metadata: Metadata): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, metadata: Metadata);
  constructor(text: string, options: { defaultCountry?: CountryCode, v2: true }, metadata: Metadata);
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function isSupportedCountry(countryCode: CountryCode, metadata: Metadata): boolean;
export function getCountries(metadata: Metadata): CountryCode[];
export function getCountryCallingCode(countryCode: CountryCode, metadata: Metadata): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode, metadata: Metadata): string;

export function getExampleNumber(country: CountryCode, examples: { [country in CountryCode]: NationalNumber }, metadata: Metadata): PhoneNumber | undefined;

export function formatIncompletePhoneNumber(number: string, metadata: Metadata): string;
export function formatIncompletePhoneNumber(number: string, countryCode: CountryCode, metadata: Metadata): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string } | undefined, metadata: Metadata);
  input(text: string): string;
  reset(): void;
  getNumber(): PhoneNumber | undefined;
  getChars(): string;
  getTemplate(): string;
  getCallingCode(): string | undefined;
  getCountry(): CountryCode | undefined;
  isInternational(): boolean;
  isPossible(): boolean;
  isValid(): boolean;
}

// The exported `Metadata` name is already used for exporting the "raw" JSON metadata type.
// Then, `Metadata` class has become exported, but its name is already taken, so TypeScript users seem to be unable to use the `Metadata` class.
// If someone knows a solution then they could propose it in an issue.
// export class Metadata {
//   ...
// }
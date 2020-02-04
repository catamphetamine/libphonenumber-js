import {
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

export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode | { defaultCountry?: CountryCode, defaultCallingCode?: string }): PhoneNumber | undefined;

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
  getTemplate(): string | undefined;
}

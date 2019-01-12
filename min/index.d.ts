import {
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
  NumberFound,
  NumberType,
  NumberFormat
};

export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode): PhoneNumber | undefined;

export function findNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }): NumberFound[];
export function searchNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, options?: { defaultCountry?: CountryCode, v2?: boolean });
  hasNext(): boolean;
  next(): NumberFound | undefined;
}

export function isSupportedCountry(countryCode: CountryCode): boolean;
export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode): string;

export function getExampleNumber(country: CountryCode, examples: { [country in CountryCode]: NationalNumber }): PhoneNumber | undefined;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode?: CountryCode);
  input(text: string): string;
  reset(): void;
  getNumber(): PhoneNumber | undefined;
  getTemplate(): string | undefined;
}

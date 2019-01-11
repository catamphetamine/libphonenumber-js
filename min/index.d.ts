import { CountryCallingCode, CountryCode, NumberFound, PhoneNumber } from 'libphonenumber-js';

// They say this re-export is required.
// https://github.com/catamphetamine/libphonenumber-js/pull/290#issuecomment-453281180
export { CountryCallingCode, CountryCode, NumberFound, PhoneNumber };

export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;
export function parsePhoneNumberFromString(text: string, defaultCountry?: CountryCode): PhoneNumber;

export class ParseError {
  message: string;
}

export function findNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }): NumberFound[];
export function searchNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode, v2?: boolean }): IterableIterator<NumberFound>;

export class PhoneNumberMatcher {
  constructor(text: string, options?: { defaultCountry?: CountryCode, v2?: boolean });
  hasNext(): boolean;
  next(): NumberFound;
}

export function isSupportedCountry(countryCode: CountryCode): boolean;
export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode): string;

export function getExampleNumber(country: CountryCode, examples: object): PhoneNumber;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode?: CountryCode);
  input(text: string): string;
  reset(): void;
  country: CountryCode;
  getNumber(): PhoneNumber;
  getNationalNumber(): string;
  template: string;
}

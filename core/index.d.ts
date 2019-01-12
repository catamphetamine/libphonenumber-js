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
  NumberFound,
  NumberType,
  NumberFormat
};

export function parsePhoneNumber(text: string, metadata: Metadata): PhoneNumber;
export function parsePhoneNumber(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber;

export function parsePhoneNumberFromString(text: string, metadata: Metadata): PhoneNumber | undefined;
export function parsePhoneNumberFromString(text: string, defaultCountry: CountryCode, metadata: Metadata): PhoneNumber | undefined;

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

export function isSupportedCountry(countryCode: CountryCode, metadata: Metadata): boolean;
export function getCountryCallingCode(countryCode: CountryCode, metadata: Metadata): CountryCallingCode;
export function getExtPrefix(countryCode: CountryCode, metadata: Metadata): string;

export function getExampleNumber(country: CountryCode, examples: { [country in CountryCode]: NationalNumber }, metadata: Metadata): PhoneNumber | undefined;

export function formatIncompletePhoneNumber(number: string, metadata: Metadata): string;
export function formatIncompletePhoneNumber(number: string, countryCode: CountryCode, metadata: Metadata): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parsePhoneNumberCharacter(character: string): string;
export function parseDigits(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode: CountryCode | undefined, metadata: Metadata);
  input(text: string): string;
  reset(): void;
  getNumber(): PhoneNumber | undefined;
  getTemplate(): string | undefined;
}

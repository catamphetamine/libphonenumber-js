// `parse()` and `parseCustom` are deprecated.
// Use `fparseNumber()` and `parseNumberCustom()` instead.
import { CountryCallingCode, CountryCode, NumberFormat, NumberFound, NumberType, ParsedNumber, NationalNumber, PhoneNumber } from 'libphonenumber-js';

export function parsePhoneNumber(text: string, metadata: object): PhoneNumber;
export function parsePhoneNumber(text: string, defaultCountry: CountryCode, metadata: object): PhoneNumber;

export function parse(text: string, metadata: object): ParsedNumber;
export function parse(text: string, options: CountryCode | { defaultCountry?: CountryCode, extended?: boolean }, metadata: object): ParsedNumber;

export function parseNumber(text: string, metadata: object): ParsedNumber;
export function parseNumber(text: string, options: CountryCode | { defaultCountry?: CountryCode, extended?: boolean }, metadata: object): ParsedNumber;

// `format()` and `formatCustom` are deprecated.
// Use `formatNumber()` and `formatNumberCustom()` instead.
export function format(parsedNumber: ParsedNumber, format: NumberFormat, metadata: object): string;
export function format(phone: NationalNumber, format: NumberFormat, metadata: object): string;
export function format(phone: NationalNumber, country: CountryCode, format: NumberFormat, metadata: object): string;

export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat, metadata: object): string;
export function formatNumber(phone: NationalNumber, format: NumberFormat, metadata: object): string;
export function formatNumber(phone: NationalNumber, country: CountryCode, format: NumberFormat, metadata: object): string;

export function getNumberType(parsedNumber: ParsedNumber, metadata: object): NumberType;
export function getNumberType(phone: NationalNumber, metadata: object): NumberType;
export function getNumberType(phone: NationalNumber, country: CountryCode, metadata: object): NumberType;

export function getExampleNumber(country: CountryCode, examples: object, metadata: object): PhoneNumber;

export function isPossibleNumber(parsedNumber: ParsedNumber, metadata: object): boolean;
export function isPossibleNumber(phone: NationalNumber, metadata: object): boolean;
export function isPossibleNumber(phone: NationalNumber, country: CountryCode, metadata: object): boolean;

export function isValidNumber(parsedNumber: ParsedNumber, metadata: object): boolean;
export function isValidNumber(phone: NationalNumber, metadata: object): boolean;
export function isValidNumber(phone: NationalNumber, country: CountryCode, metadata: object): boolean;

export function isValidNumberForRegion(phone: NationalNumber, country: CountryCode, metadata: object): boolean;

// Deprecated.
export function findParsedNumbers(text: string, metadata: object): NumberFound[];
export function findParsedNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: object): NumberFound[];

// Deprecated.
export function searchParsedNumbers(text: string, metadata: object): IterableIterator<NumberFound>;
export function searchParsedNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: object): IterableIterator<NumberFound>;

// Deprecated.
export class ParsedNumberSearch {
  constructor(text: string, metadata: object);
  constructor(text: string, options: { defaultCountry?: CountryCode }, metadata: object);
  hasNext(): boolean;
  next(): NumberFound;
}

export function findNumbers(text: string, metadata: object): NumberFound[];
export function findNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: object): NumberFound[];

export function searchNumbers(text: string, metadata: object): IterableIterator<NumberFound>;
export function searchNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: object): IterableIterator<NumberFound>;

export class ParsedNumberMatcher {
  constructor(text: string, metadata: object);
  constructor(text: string, options: { defaultCountry?: CountryCode }, metadata: object);
  hasNext(): boolean;
  next(): NumberFound;
}

export function getCountryCallingCode(countryCode: CountryCode, metadata: object): CountryCallingCode;

export function getPhoneCode(countryCode: CountryCode, metadata: object): CountryCallingCode;

export function formatIncompletePhoneNumber(number: string, metadata: object): string;
export function formatIncompletePhoneNumber(number: string, countryCode: CountryCode, metadata: object): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parseParsedNumberCharacter(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode: CountryCode, metadata: object);
  input(text: string): string;
  reset(): void;
  country: CountryCode;
  getNumber(): PhoneNumber;
  getNationalNumber(): string;
  template: string;
}

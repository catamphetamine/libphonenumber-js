// `parse()` and `parseCustom` are deprecated.
// Use `fparseNumber()` and `parseNumberCustom()` instead.
import { CountryCallingCode, CountryCode, NumberFormat, NumberFound, NumberType, ParsedNumber, TelephoneNumber } from 'libphonenumber-js';

export function parse(text: string, metadata: object): ParsedNumber;
export function parse(text: string, options: CountryCode | { defaultCountry?: CountryCode, extended?: boolean }, metadata: object): ParsedNumber;

export function parseNumber(text: string, metadata: object): ParsedNumber;
export function parseNumber(text: string, options: CountryCode | { defaultCountry?: CountryCode, extended?: boolean }, metadata: object): ParsedNumber;

// `format()` and `formatCustom` are deprecated.
// Use `formatNumber()` and `formatNumberCustom()` instead.
export function format(parsedNumber: ParsedNumber, format: NumberFormat, metadata: object): string;
export function format(phone: TelephoneNumber, format: NumberFormat, metadata: object): string;
export function format(phone: TelephoneNumber, country: CountryCode, format: NumberFormat, metadata: object): string;

export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat, metadata: object): string;
export function formatNumber(phone: TelephoneNumber, format: NumberFormat, metadata: object): string;
export function formatNumber(phone: TelephoneNumber, country: CountryCode, format: NumberFormat, metadata: object): string;

export function getNumberType(parsedNumber: ParsedNumber, metadata: object): NumberType;
export function getNumberType(phone: TelephoneNumber, metadata: object): NumberType;
export function getNumberType(phone: TelephoneNumber, country: CountryCode, metadata: object): NumberType;

export function isValidNumber(parsedNumber: ParsedNumber, metadata: object): boolean;
export function isValidNumber(phone: TelephoneNumber, metadata: object): boolean;
export function isValidNumber(phone: TelephoneNumber, country: CountryCode, metadata: object): boolean;

export function findPhoneNumbers(text: string, metadata: object): NumberFound[];
export function findPhoneNumbers(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: object): NumberFound[];

export function getCountryCallingCode(countryCode: CountryCode, metadata: object): CountryCallingCode;

export function getPhoneCode(countryCode: CountryCode, metadata: object): CountryCallingCode;

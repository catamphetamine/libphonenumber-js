export type CountryCode = '001' | 'AC' | 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TA' | 'TC' | 'TD' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'XK' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';

export type NumberFormat = 'NATIONAL' | 'National' | 'INTERNATIONAL' | 'International' | 'E.164' | 'RFC3966' | 'IDD';
export type NumberType = undefined | 'PREMIUM_RATE' | 'TOLL_FREE' | 'SHARED_COST' | 'VOIP' | 'PERSONAL_NUMBER' | 'PAGER' | 'UAN' | 'VOICEMAIL' | 'FIXED_LINE_OR_MOBILE' | 'FIXED_LINE' | 'MOBILE';

export interface NationalNumber extends String { }
export interface Extension extends String { }
export interface CountryCallingCode extends String { }

export class PhoneNumber {
  constructor(countryCallingCodeOrCountry: CountryCallingCode | CountryCode, nationalNumber: NationalNumber, metadata: object);
  countryCallingCode: CountryCallingCode;
  country?: CountryCode;
  nationalNumber: NationalNumber;
  number: string;
  carrierCode?: string;
  ext?: Extension;
  isPossible(): boolean;
  isValid(): boolean;
  getType(): NumberType;
  format(format: NumberFormat, options?: object): string;
  formatNational(options?: object): string;
  formatInternational(options?: object): string;
  getURI(options?: object): string;
}

export interface ParsedNumber {
  countryCallingCode?: CountryCallingCode,
  country: CountryCode,
  phone: NationalNumber,
  ext?: Extension,
  possible?: boolean,
  valid?: boolean
}

export interface NumberFound {
  country?: CountryCode,
  phone?: NationalNumber,
  ext?: Extension,
  number?: PhoneNumber,
  startsAt: number,
  endsAt: number
}

export function parsePhoneNumber(text: string, defaultCountry?: CountryCode): PhoneNumber;

// `parse()` and `parseCustom` are deprecated.
// Use `fparseNumber()` and `parseNumberCustom()` instead.
export function parse(text: string, options?: CountryCode | { defaultCountry?: CountryCode, extended?: boolean }): ParsedNumber;

export function parseNumber(text: string, options?: CountryCode | { defaultCountry?: CountryCode, extended?: boolean }): ParsedNumber;

// `format()` and `formatCustom` are deprecated.
// Use `formatNumber()` and `formatNumberCustom()` instead.
export function format(parsedNumber: ParsedNumber, format: NumberFormat): string;
export function format(phone: NationalNumber, format: NumberFormat): string;
export function format(phone: NationalNumber, country: CountryCode, format: NumberFormat): string;

export function formatNumber(parsedNumber: ParsedNumber, format: NumberFormat): string;
export function formatNumber(phone: NationalNumber, format: NumberFormat): string;
export function formatNumber(phone: NationalNumber, country: CountryCode, format: NumberFormat): string;

export function getNumberType(parsedNumber: ParsedNumber): NumberType;
export function getNumberType(phone: NationalNumber, country?: CountryCode): NumberType;

export function getExampleNumber(country: CountryCode, examples: object): PhoneNumber;

export function isPossibleNumber(parsedNumber: ParsedNumber): boolean;
export function isPossibleNumber(phone: NationalNumber, country?: CountryCode): boolean;

export function isValidNumber(parsedNumber: ParsedNumber): boolean;
export function isValidNumber(phone: NationalNumber, country?: CountryCode): boolean;

export function isValidNumberForRegion(phone: NationalNumber, country: CountryCode): boolean;

// Deprecated.
export function findParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): NumberFound[];
export function searchParsedNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): IterableIterator<NumberFound>;

// Deprecated.
export class ParsedNumberSearch {
  constructor(text: string, options?: { defaultCountry?: CountryCode });
  hasNext(): boolean;
  next(): NumberFound;
}

export function findNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): NumberFound[];
export function searchNumbers(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): IterableIterator<NumberFound>;

export class ParsedNumberMatcher {
  constructor(text: string, options?: { defaultCountry?: CountryCode });
  hasNext(): boolean;
  next(): NumberFound;
}

export function getCountryCallingCode(countryCode: CountryCode): CountryCallingCode;

export function getPhoneCode(countryCode: CountryCode): CountryCallingCode;

export function formatIncompletePhoneNumber(number: string, countryCode?: CountryCode): string;
export function parseIncompletePhoneNumber(text: string): string;
export function parseParsedNumberCharacter(character: string): string;

export class AsYouType {
  constructor(defaultCountryCode?: CountryCode);
  input(text: string): string;
  reset(): void;
  country: CountryCode;
  getNumber(): PhoneNumber;
  getNationalNumber(): string;
  template: string;
}

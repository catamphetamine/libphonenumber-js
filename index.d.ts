export type CountryCode = 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';

export type NumberFormat = 'National' | 'International' | 'E.164' | 'RFC3966';

export interface TelephoneNumber extends String { }
export interface Extension extends String { }
export interface PhoneCode extends String { }

export interface ParsedNumber {
    phone: TelephoneNumber,
    country: CountryCode,
    ext: Extension
}

export function parse(text: string, options?: CountryCode | { defaultCountry?: CountryCode }): ParsedNumber;
export function parseCustom(text: string, metadata: object): ParsedNumber;
export function parseCustom(text: string, options: CountryCode | { defaultCountry?: CountryCode }, metadata: object): ParsedNumber;

export function format(parsedNumber: ParsedNumber, format: NumberFormat): string;
export function format(phone: TelephoneNumber, format: NumberFormat): string;
export function format(phone: TelephoneNumber, country: CountryCode, format: NumberFormat): string;
export function formatCustom(parsedNumber: ParsedNumber, format: NumberFormat, metadata: object): string;
export function formatCustom(phone: TelephoneNumber, format: NumberFormat, metadata: object): string;
export function formatCustom(phone: TelephoneNumber, country: CountryCode, format: NumberFormat, metadata: object): string;

export function getNumberType(parsedNumber: ParsedNumber): string;
export function getNumberType(phone: TelephoneNumber, country?: CountryCode): string;
export function getNumberTypeCustom(parsedNumber: ParsedNumber, metadata: object): string;
export function getNumberTypeCustom(phone: TelephoneNumber, metadata: object): string;
export function getNumberTypeCustom(phone: TelephoneNumber, country: CountryCode, metadata: object): string;

export function isValidNumber(parsedNumber: ParsedNumber): boolean;
export function isValidNumber(phone: TelephoneNumber, country?: CountryCode): boolean;
export function isValidNumberCustom(parsedNumber: ParsedNumber, metadata: object): boolean;
export function isValidNumberCustom(phone: TelephoneNumber, metadata: object): boolean;
export function isValidNumberCustom(phone: TelephoneNumber, country: CountryCode, metadata: object): boolean;

export function getPhoneCode(countryCode: CountryCode): PhoneCode;
export function getPhoneCodeCustom(countryCode: CountryCode, metadata: object): PhoneCode;

export class AsYouType {
    constructor(defaultCountryCode?: CountryCode);
    input(text: string): string;
    reset(): void;
    country: CountryCode;
    getNationalNumber(): string;
    template: string;
}

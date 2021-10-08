// The rationale for having a separate `CountryCode` type instead of just a `string`:
// https://github.com/catamphetamine/libphonenumber-js/issues/170#issuecomment-363156068
export type CountryCode = 'AC' | 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TA' | 'TC' | 'TD' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'XK' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';

export type CountryCallingCodes = {
  [countryCallingCode: string]: CountryCode[];
};

export type Countries = {
  // Metadata here is a compressed one,
  // so a country's data is just an array of some properties
  // instead of a JSON object of shape:
  // {
  //   phone_code: string,
  //   idd_prefix: string,
  //   national_number_pattern: string,
  //   types: object,
  //   examples: object,
  //   formats: object[]?,
  //   possible_lengths: number[],
  //   ...
  // }
  //
  // `in` operator docs:
  // https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
  // `country in CountryCode` means "for each and every CountryCode".
  [country in CountryCode]: any[];
};

export type MetadataJson = {
  country_calling_codes: CountryCallingCodes;
  countries: Countries;
};

export type Examples = {
  // `in` operator docs:
  // https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
  // `country in CountryCode` means "for each and every CountryCode".
  [country in CountryCode]: NationalNumber;
};

// 'National' and 'International' formats are deprecated.
export type NumberFormat = 'NATIONAL' | 'National' | 'INTERNATIONAL' | 'International' | 'E.164' | 'RFC3966' | 'IDD';
export type NumberType = undefined | 'PREMIUM_RATE' | 'TOLL_FREE' | 'SHARED_COST' | 'VOIP' | 'PERSONAL_NUMBER' | 'PAGER' | 'UAN' | 'VOICEMAIL' | 'FIXED_LINE_OR_MOBILE' | 'FIXED_LINE' | 'MOBILE';

// The rationale for the specific data types instead of just using `string`.
// https://github.com/catamphetamine/libphonenumber-js/issues/170#issuecomment-363156068
export interface E164Number extends String { }
export interface NationalNumber extends String { }
export interface Extension extends String { }
export interface CarrierCode extends String { }
export interface CountryCallingCode extends String { }

type FormatExtension = (formattedNumber: string, extension: Extension, metadata: MetadataJson) => string

type FormatNumberOptionsWithoutIDD = {
  v2?: boolean;
  formatExtension?: FormatExtension;
};

type FormatNumberOptions = {
  v2?: boolean;
  fromCountry?: CountryCode;
  humanReadable?: boolean;
  nationalPrefix?: boolean;
  formatExtension?: FormatExtension;
};

export class PhoneNumber {
  constructor(countryCallingCodeOrCountry: CountryCallingCode | CountryCode, nationalNumber: NationalNumber, metadata: MetadataJson);
  countryCallingCode: CountryCallingCode;
  country?: CountryCode;
  nationalNumber: NationalNumber;
  number: E164Number;
  carrierCode?: CarrierCode;
  ext?: Extension;
  setExt(ext: Extension): void;
  isPossible(): boolean;
  isValid(): boolean;
  getType(): NumberType;
  format(format: NumberFormat, options?: FormatNumberOptions): string;
  formatNational(options?: FormatNumberOptionsWithoutIDD): string;
  formatInternational(options?: FormatNumberOptionsWithoutIDD): string;
  getURI(options?: FormatNumberOptionsWithoutIDD): string;
  isNonGeographic(): boolean;
  isEqual(phoneNumber: PhoneNumber): boolean;
}

export interface NumberFound {
  number: PhoneNumber;
  startsAt: number;
  endsAt: number;
}

export interface NumberFoundLegacy {
  country: CountryCode;
  phone: NationalNumber;
  ext?: Extension;
  startsAt: number;
  endsAt: number;
}

export class ParseError {
  message: string;
}

export interface NumberingPlan {
  leadingDigits(): string | undefined;
  possibleLengths(): number[];
  IDDPrefix(): string;
  defaultIDDPrefix(): string | undefined;
}

// The rationale for having a separate type for the result "enum" instead of just a `string`:
// https://github.com/catamphetamine/libphonenumber-js/issues/170#issuecomment-363156068
export type ValidatePhoneNumberLengthResult = 'INVALID_COUNTRY' | 'NOT_A_NUMBER' | 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_LENGTH';

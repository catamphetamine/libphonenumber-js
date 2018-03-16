import {CountryCallingCode, CountryCode, TelephoneNumber} from "./index";

export class AsYouType {
  constructor(defaultCountryCode: CountryCode, metadata: object);
  input(text: string): string;
  reset(): void;
  country: CountryCode;
  getNationalNumber(): string;
  template: string;
}

export function getPhoneCode(countryCode: CountryCode, metadata: object): CountryCallingCode;

export function isValidNumber(phone: TelephoneNumber, country: CountryCode, metadata: object): boolean;
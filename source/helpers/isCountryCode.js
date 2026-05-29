const COUNTRY_CODE_REG_EXP = /^[A-Z]{2}$/

export default function isCountryCode(string) {
	return COUNTRY_CODE_REG_EXP.test(string)
}

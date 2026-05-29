const CALLING_CODE_REG_EXP = /^\d+$/

export default function isCallingCode(string) {
	return CALLING_CODE_REG_EXP.test(string)
}

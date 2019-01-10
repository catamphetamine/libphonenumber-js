import _isValidNumber from './validate_'
import { normalizeArguments } from './getNumberType'

// Finds out national phone number type (fixed line, mobile, etc)
export default function isValidNumber(arg_1, arg_2, arg_3, arg_4)
{
	const { input, options, metadata } = normalizeArguments(arg_1, arg_2, arg_3, arg_4)
	return _isValidNumber(input, options, metadata)
}
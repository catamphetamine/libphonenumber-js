import _isValidNumber from './validate_'
import { normalizeArguments } from './getNumberType'

// Finds out national phone number type (fixed line, mobile, etc)
export default function isValidNumber()
{
	const { input, options, metadata } = normalizeArguments(arguments)
	return _isValidNumber(input, options, metadata)
}
import _isValidNumber from './validate_'
import { sort_out_arguments } from './getNumberType'

// Finds out national phone number type (fixed line, mobile, etc)
export default function isValidNumber(arg_1, arg_2, arg_3, arg_4)
{
	const { input, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)
	return _isValidNumber(input, options, metadata)
}
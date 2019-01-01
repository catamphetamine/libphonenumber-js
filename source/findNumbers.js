import _findNumbers from './findNumbers_'
import { sort_out_arguments } from './parsePhoneNumber'

export default function findNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)
	return _findNumbers(text, options, metadata)
}
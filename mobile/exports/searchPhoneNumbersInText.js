import { withMetadata } from '../metadata'
import { searchPhoneNumbersInText as _searchPhoneNumbersInText } from '../../core/index'

export function searchPhoneNumbersInText() {
	return withMetadata(_searchPhoneNumbersInText, arguments)
}
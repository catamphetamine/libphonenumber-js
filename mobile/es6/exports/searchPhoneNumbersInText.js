import withMetadataArgument from './withMetadataArgument.js'
import { searchPhoneNumbersInText as _searchPhoneNumbersInText } from '../../../core/es6/index.js'

export function searchPhoneNumbersInText() {
	return withMetadataArgument(_searchPhoneNumbersInText, arguments)
}
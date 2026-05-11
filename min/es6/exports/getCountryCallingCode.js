import withMetadataArgument from './withMetadataArgument.js'
import { getCountryCallingCode as _getCountryCallingCode } from '../../../core/es6/index.js'

export function getCountryCallingCode() {
	return withMetadataArgument(_getCountryCallingCode, arguments)
}
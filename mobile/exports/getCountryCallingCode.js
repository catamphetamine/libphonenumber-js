import { withMetadata } from '../metadata.js'
import { getCountryCallingCode as _getCountryCallingCode } from '../../core/index.js'

export function getCountryCallingCode() {
	return withMetadata(_getCountryCallingCode, arguments)
}
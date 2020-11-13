import { withMetadata } from '../metadata'
import { getCountryCallingCode as _getCountryCallingCode } from '../../core/index'

export function getCountryCallingCode() {
	return withMetadata(_getCountryCallingCode, arguments)
}
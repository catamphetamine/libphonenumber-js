import { withMetadata } from '../metadata'
import { getCountries as _getCountries } from '../../core/index'

export function getCountries() {
	return withMetadata(_getCountries, arguments)
}
import { withMetadata } from '../metadata.js'
import { getCountries as _getCountries } from '../../core/index.js'

export function getCountries() {
	return withMetadata(_getCountries, arguments)
}
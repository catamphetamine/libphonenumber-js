import { withMetadata } from '../metadata'
import { getExampleNumber as _getExampleNumber } from '../../core/index'

export function getExampleNumber() {
	return withMetadata(_getExampleNumber, arguments)
}
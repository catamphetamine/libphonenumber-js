import { withMetadata } from '../metadata.js'
import { getExampleNumber as _getExampleNumber } from '../../core/index.js'

export function getExampleNumber() {
	return withMetadata(_getExampleNumber, arguments)
}
import { withMetadata } from '../metadata.js'
import { isPossiblePhoneNumber as _isPossiblePhoneNumber } from '../../core/index.js'

export function isPossiblePhoneNumber() {
	return withMetadata(_isPossiblePhoneNumber, arguments)
}
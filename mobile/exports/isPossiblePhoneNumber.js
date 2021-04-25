import { withMetadata } from '../metadata'
import { isPossiblePhoneNumber as _isPossiblePhoneNumber } from '../../core/index'

export function isPossiblePhoneNumber() {
	return withMetadata(_isPossiblePhoneNumber, arguments)
}
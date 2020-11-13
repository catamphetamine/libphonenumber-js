import metadata from '../metadata'
import { Metadata as _Metadata } from '../../core/index'

export function Metadata() {
	return _Metadata.call(this, metadata)
}

Metadata.prototype = Object.create(_Metadata.prototype, {})
Metadata.prototype.constructor = Metadata
import metadata from '../metadata.js'
import { Metadata as _Metadata } from '../../core/index.js'

export function Metadata() {
	return _Metadata.call(this, metadata)
}

Metadata.prototype = Object.create(_Metadata.prototype, {})
Metadata.prototype.constructor = Metadata
// Importing from a ".js" file is a workaround for Node.js "ES Modules"
// importing system which is even uncapable of importing "*.json" files.
import metadata from '../../metadata.max.json.js'

import { PhoneNumber as _PhoneNumber } from '../../core/index.js'

export function PhoneNumber(number) {
	return _PhoneNumber.call(this, number, metadata)
}
// Setting `PhoneNumber.prototype` via `Object.create()`
// didn't work with `instanceof` operator for some strange reason.
// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/201
// Because of that issue, the `Object.create()` call had to be removed.
// It didn't result in any drawbacks because the `{}` argument of that call
// means that the `PhoneNumber` class created here adds 0 new properties
// to the existing `PhoneNumber` class it attempts to extend here.
// Hence, the `Object.create()` call can be omitted
// and the `prototype` can just be copied over as is.
// PhoneNumber.prototype = Object.create(_PhoneNumber.prototype, {})
PhoneNumber.prototype = _PhoneNumber.prototype
PhoneNumber.prototype.constructor = PhoneNumber

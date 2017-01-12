// Strict mode here is required for older browsers like Safari 9
// because of using `const`.
'use strict'

import metadata from './metadata.min'

import
{
	parse as _parse,
	format as _format,
	is_valid_number as _is_valid_number,
	as_you_type as _as_you_type
}
from './custom.es6'

export const parse  = _parse.bind({ metadata })
export const format = _format.bind({ metadata })

export const is_valid_number = _is_valid_number.bind({ metadata })
export const isValidNumber   = is_valid_number

export const as_you_type = _as_you_type(metadata)
export const asYouType   = as_you_type
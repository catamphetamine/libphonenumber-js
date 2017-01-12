import metadata from './metadata.min'

import
{
	parse as _parse,
	format as _format,
	is_valid_number as _is_valid_number,
	as_you_type as _as_you_type
}
from './custom.es6'

// `const` is not supported in Internet Explorer 10

var context = { metadata: metadata }

export var parse  = _parse.bind(context)
export var format = _format.bind(context)

export var is_valid_number = _is_valid_number.bind(context)
export var isValidNumber   = is_valid_number

export var as_you_type = _as_you_type(metadata)
export var asYouType   = as_you_type
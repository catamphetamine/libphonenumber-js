export default class PatternMatcher {
	constructor(pattern) {
		this.matchTree = new PatternParser().parse(pattern)
	}

	match(string, { allowOverflow } = {}) {
		if (!string) {
			throw new Error('String is required')
		}
		const result = match(string.split(''), this.matchTree, true)
		if (result && result.match) {
			delete result.matchedChars
		}
		if (result && result.overflow) {
			if (!allowOverflow) {
				return
			}
		}
		return result
	}
}

function match(characters, tree, last) {
	if (typeof tree === 'string') {
		if (last) {
			// `tree` is always a single character.
			if (characters.length > tree.length) {
				return {
					overflow: true
				}
			}
		}
		const characterString = characters.join('')
		if (tree.indexOf(characterString) === 0) {
			// `tree` is always a single character.
			// If `tree.indexOf(characterString) === 0`
			// then `characters.length === tree.length`.
			/* istanbul ignore else */
			if (characters.length === tree.length) {
				return {
					match: true,
					matchedChars: characters
				}
			}
			// `tree` is always a single character.
			// If `tree.indexOf(characterString) === 0`
			// then `characters.length === tree.length`.
			/* istanbul ignore next */
			return {
				partialMatch: true,
				// matchedChars: characters
			}
		}
		if (characterString.indexOf(tree) === 0) {
			return {
				match: true,
				matchedChars: characters.slice(0, tree.length)
			}
		}
		return
	}

	if (Array.isArray(tree)) {
		let restCharacters = characters.slice()
		let i = 0
		while (i < tree.length) {
			const subtree = tree[i]
			const result = match(restCharacters, subtree, last && (i === tree.length - 1))
			if (!result) {
				return
			} else if (result.overflow) {
				return result
			} else if (result.match) {
				// Continue with the next subtree with the rest of the characters.
				restCharacters = restCharacters.slice(result.matchedChars.length)
				if (restCharacters.length === 0) {
					if (i === tree.length - 1) {
						return {
							match: true,
							matchedChars: characters
						}
					} else {
						return {
							partialMatch: true,
							// matchedChars: characters
						}
					}
				}
			} else {
				/* istanbul ignore else */
				if (result.partialMatch) {
					return {
						partialMatch: true,
						// matchedChars: characters
					}
				} else {
					throw new Error(`Unsupported match result:\n${JSON.stringify(result, null, 2)}`)
				}
			}
			i++
		}
		// If `last` then overflow has already been checked
		// by the last element of the `tree` array.
		/* istanbul ignore if */
		if (last) {
			return {
				overflow: true
			}
		}
		return {
			match: true,
			matchedChars: characters.slice(0, characters.length - restCharacters.length)
		}
	}

	switch (tree.op) {
		case '|':
			let partialMatch
			for (const branch of tree.args) {
				const result = match(characters, branch, last)
				if (result) {
					if (result.overflow) {
						return result
					} else if (result.match) {
						return {
							match: true,
							matchedChars: result.matchedChars
						}
					} else {
						/* istanbul ignore else */
						if (result.partialMatch) {
							partialMatch = true
						} else {
							throw new Error(`Unsupported match result:\n${JSON.stringify(result, null, 2)}`)
						}
					}
				}
			}
			if (partialMatch) {
				return {
					partialMatch: true,
					// matchedChars: ...
				}
			}
			// Not even a partial match.
			return

		case '[]':
			for (const char of tree.args) {
				if (characters[0] === char) {
					if (characters.length === 1) {
						return {
							match: true,
							matchedChars: characters
						}
					}
					if (last) {
						return {
							overflow: true
						}
					}
					return {
						match: true,
						matchedChars: [char]
					}
				}
			}
			// No character matches.
			return

		/* istanbul ignore next */
		default:
			throw new Error(`Unsupported instruction tree: ${tree}`)
	}
}

const OPERATOR = new RegExp(
	// any of:
	'(' +
		// or operator
		'\\|' +
		// or
		'|' +
		// or group start
		'\\(\\?\\:' +
		// or
		'|' +
		// or group end
		'\\)' +
		// or
		'|' +
		// one-of set start
		'\\[' +
		// or
		'|' +
		// one-of set end
		'\\]' +
	')'
)

const ILLEGAL_CHARACTER_REGEXP = /[\(\)\[\]\?\:\|]/

class PatternParser {
	parse(pattern) {
		this.context = [{
			or: true,
			instructions: []
		}]

		this.parsePattern(pattern)

		if (this.context.length !== 1) {
			throw new Error('Non-finalized contexts left when pattern parse ended')
		}

		const { branches, instructions } = this.context[0]

		if (branches) {
			return [{
				op: '|',
				args: branches.concat([instructions])
			}]
		}

		/* istanbul ignore if */
		if (instructions.length === 0) {
			throw new Error('Pattern is required')
		}

		return instructions
	}

	startContext(context) {
		this.context.push(context)
	}

	endContext() {
		this.context.pop()
	}

	getContext() {
		return this.context[this.context.length - 1]
	}

	parsePattern(pattern) {
		if (!pattern) {
			throw new Error('Pattern is required')
		}

		const match = pattern.match(OPERATOR)
		if (!match) {
			if (ILLEGAL_CHARACTER_REGEXP.test(pattern)) {
				throw new Error(`Illegal characters found in a pattern: ${pattern}`)
			}
			this.getContext().instructions = this.getContext().instructions.concat(
				pattern.split('')
			)
			return
		}

		const operator = match[1]
		const before = pattern.slice(0, match.index)
		const rightPart = pattern.slice(match.index + operator.length)

		switch (operator) {
			case '(?:':
				if (before) {
					this.parsePattern(before)
				}
				this.startContext({
					or: true,
					instructions: [],
					branches: []
				})
				break

			case ')':
				if (!this.getContext().or) {
					throw new Error('")" operator must be preceded by "(?:" operator')
				}
				if (before) {
					this.parsePattern(before)
				}
				if (this.getContext().instructions.length === 0) {
					throw new Error('No instructions found after "|" operator in an "or" group')
				}
				const { branches } = this.getContext()
				branches.push(
					this.getContext().instructions
				)
				this.endContext()
				this.getContext().instructions.push({
					op: '|',
					args: branches
				})
				break

			case '|':
				if (!this.getContext().or) {
					throw new Error('"|" operator can only be used inside "or" groups')
				}
				if (before) {
					this.parsePattern(before)
				}
				// The top-level is an implicit "or" group, if required.
				if (!this.getContext().branches) {
					// `branches` are not defined only for the root implicit "or" operator.
					/* istanbul ignore else */
					if (this.context.length === 1) {
						this.getContext().branches = []
					} else {
						throw new Error('"branches" not found in an "or" group context')
					}
				}
				this.getContext().branches.push(
					this.getContext().instructions
				)
				this.getContext().instructions = []
				break

			case '[':
				if (before) {
					this.parsePattern(before)
				}
				this.startContext({
					oneOfSet: true
				})
				break

			case ']':
				if (!this.getContext().oneOfSet) {
					throw new Error('"]" operator must be preceded by "[" operator')
				}
				this.endContext()
				this.getContext().instructions.push({
					op: '[]',
					args: parseOneOfSet(before)
				})
				break

			/* istanbul ignore next */
			default:
				throw new Error(`Unknown operator: ${operator}`)
		}

		if (rightPart) {
			this.parsePattern(rightPart)
		}
	}
}

function parseOneOfSet(pattern) {
	const values = []
	let i = 0
	while (i < pattern.length) {
		if (pattern[i] === '-') {
			if (i === 0 || i === pattern.length - 1) {
				throw new Error(`Couldn't parse a one-of set pattern: ${pattern}`)
			}
			const prevValue = pattern[i - 1].charCodeAt(0) + 1
			const nextValue = pattern[i + 1].charCodeAt(0) - 1
			let value = prevValue
			while (value <= nextValue) {
				values.push(String.fromCharCode(value))
				value++
			}
		} else {
			values.push(pattern[i])
		}
		i++
	}
	return values
}
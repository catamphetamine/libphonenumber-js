/**
 * A port of Google's `PhoneNumberMatcher.java`.
 * https://github.com/googlei18n/libphonenumber/blob/master/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberMatcher.java
 * Date: 08.03.2018.
 */

import
{
	MAX_LENGTH_FOR_NSN,
	MAX_LENGTH_COUNTRY_CODE,
	VALID_PUNCTUATION,
	create_extension_pattern
}
from './common'

import
{
	_pL
}
from './utf-8.common'

import
{
	isValidCandidate,
	OPENING_PARENS as openingParens,
	CLOSING_PARENS as closingParens,
	LEAD_CLASS
}
from './findNumbers.common'

import formatNumber from './format'
import parseNumber from './parse'
import isValidNumber from './validate'

/**
 * Matches strings that look like publication pages. Example:
 * <pre>Computing Complete Answers to Queries in the Presence of Limited Access Patterns.
 * Chen Li. VLDB J. 12(3): 211-227 (2003).</pre>
 *
 * The string "211-227 (2003)" is not a telephone number.
 */
const PUB_PAGES = /\d{1,5}-+\d{1,5}\s{0,4}\(\d{1,4}/

/**
 * Matches strings that look like dates using "/" as a separator.
 * Examples: 3/10/2011, 31/10/96 or 08/31/95.
 */
const SLASH_SEPARATED_DATES = /(?:(?:[0-3]?\d\/[01]?\d)|(?:[01]?\d\/[0-3]?\d))\/(?:[12]\d)?\d{2}/

/**
 * Matches timestamps.
 * Examples: "2012-01-02 08:00".
 * Note that the reg-ex does not include the
 * trailing ":\d\d" -- that is covered by TIME_STAMPS_SUFFIX.
 */
const TIME_STAMPS = /[12]\d{3}[-/]?[01]\d[-/]?[0-3]\d +[0-2]\d$/
const TIME_STAMPS_SUFFIX_LEADING = /^:[0-5]\d/

/**
 * "\p{Z}" is any kind of whitespace or invisible separator ("Separator").
 * http://www.regular-expressions.info/unicode.html
 * "\P{Z}" is the reverse of "\p{Z}".
 * "\p{N}" is any kind of numeric character in any script ("Number").
 * "\p{Nd}" is a digit zero through nine in any script except "ideographic scripts" ("Decimal_Digit_Number").
 * "\p{Sc}" is a currency symbol ("Currency_Symbol").
 * "\p{L}" is any kind of letter from any language ("Letter").
 * "\p{Mn}" is "non-spacing mark".
 *
 * Javascript doesn't support Unicode Regular Expressions
 * so substituting it with this explicit set of characters.
 *
 * https://stackoverflow.com/questions/13210194/javascript-regex-equivalent-of-a-za-z-using-pl
 * https://github.com/danielberndt/babel-plugin-utf-8-regex/blob/master/src/transformer.js
 */
const _pZ = '\u0020\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000'
const pZ = `[${_pZ}]`
const PZ = `[^${_pZ}]`
const _pN = '\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19'
const pN = `[${_pN}]`
const _pNd = '\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19'
const pNd = `[${_pNd}]`

/**
 * Patterns used to extract phone numbers from a larger phone-number-like pattern. These are
 * ordered according to specificity. For example, white-space is last since that is frequently
 * used in numbers, not just to separate two numbers. We have separate patterns since we don't
 * want to break up the phone-number-like text on more than one different kind of symbol at one
 * time, although symbols of the same type (e.g. space) can be safely grouped together.
 *
 * Note that if there is a match, we will always check any text found up to the first match as
 * well.
 */
const INNER_MATCHES =
[
	// Breaks on the slash - e.g. "651-234-2345/332-445-1234"
	/\/+(.*)/,

	// Note that the bracket here is inside the capturing group, since we consider it part of the
	// phone number. Will match a pattern like "(650) 223 3345 (754) 223 3321".
	/(\([^(]*)/,

	// Breaks on a hyphen - e.g. "12345 - 332-445-1234 is my number."
	// We require a space on either side of the hyphen for it to be considered a separator.
	new RegExp(`(?:${pZ}-|-${pZ})${pZ}*(.+)`),

	// Various types of wide hyphens. Note we have decided not to enforce a space here, since it's
	// possible that it's supposed to be used to break two numbers without spaces, and we haven't
	// seen many instances of it used within a number.
	new RegExp(`[\u2012-\u2015\uFF0D]${pZ}*(.+)`),

	// Breaks on a full stop - e.g. "12345. 332-445-1234 is my number."
	new RegExp(`\\.+${pZ}*([^.]+)`),

	// Breaks on space - e.g. "3324451234 8002341234"
	new RegExp(`${pZ}+(${PZ}+)`)
]

const nonParens = `[^${openingParens}${closingParens}]`

// Limit on the number of pairs of brackets in a phone number.
const bracketPairLimit = limit(0, 3)

/**
 * Pattern to check that brackets match. Opening brackets should be closed within a phone number.
 * This also checks that there is something inside the brackets. Having no brackets at all is also
 * fine.
 *
 * An opening bracket at the beginning may not be closed, but subsequent ones should be.  It's
 * also possible that the leading bracket was dropped, so we shouldn't be surprised if we see a
 * closing bracket first. We limit the sets of brackets in a phone number to four.
 */
const MATCHING_BRACKETS_ENTIRE = new RegExp
(
	'^'

	+ "(?:[" + openingParens + "])?" + "(?:" + nonParens + "+" + "[" + closingParens + "])?"
	+ nonParens + "+"
	+ "(?:[" + openingParens + "]" + nonParens + "+[" + closingParens + "])" + bracketPairLimit
	+ nonParens + "*"

	+ '$'
)

// Limit on the number of leading (plus) characters.
const leadLimit = limit(0, 2)

// Limit on the number of consecutive punctuation characters.
const punctuationLimit = limit(0, 4)

/* The maximum number of digits allowed in a digit-separated block. As we allow all digits in a
 * single block, set high enough to accommodate the entire national number and the international
 * country code. */
const digitBlockLimit = MAX_LENGTH_FOR_NSN + MAX_LENGTH_COUNTRY_CODE

// Limit on the number of blocks separated by punctuation.
// Uses digitBlockLimit since some formats use spaces to separate each digit.
const blockLimit = limit(0, digitBlockLimit)

/* A punctuation sequence allowing white space. */
const punctuation = `[${VALID_PUNCTUATION}]` + punctuationLimit

// A digits block without punctuation.
const digitSequence = pNd + limit(1, digitBlockLimit)

/**
 * Phone number pattern allowing optional punctuation.
 * The phone number pattern used by `find()`, similar to
 * VALID_PHONE_NUMBER, but with the following differences:
 * <ul>
 *   <li>All captures are limited in order to place an upper bound to the text matched by the
 *       pattern.
 * <ul>
 *   <li>Leading punctuation / plus signs are limited.
 *   <li>Consecutive occurrences of punctuation are limited.
 *   <li>Number of digits is limited.
 * </ul>
 *   <li>No whitespace is allowed at the start or end.
 *   <li>No alpha digits (vanity numbers such as 1-800-SIX-FLAGS) are currently supported.
 * </ul>
 */
const PATTERN = '(?:' + LEAD_CLASS + punctuation + ')' + leadLimit
	+ digitSequence + '(?:' + punctuation + digitSequence + ')' + blockLimit
	+ '(?:' + create_extension_pattern('matching') + ')?'

// Regular expression of characters typically used to start a second phone number for the purposes
// of parsing. This allows us to strip off parts of the number that are actually the start of
// another number, such as for: (530) 583-6985 x302/x2303 -> the second extension here makes this
// actually two phone numbers, (530) 583-6985 x302 and (530) 583-6985 x2303. We remove the second
// extension so that the first number is parsed correctly.
//
// Matches a slash (\ or /) followed by a space followed by an `x`.
//
const SECOND_NUMBER_START_PATTERN = /[\\/] *x/

// Regular expression of trailing characters that we want to remove.
// We remove all characters that are not alpha or numerical characters.
// The hash character is retained here, as it may signify
// the previous block was an extension.
//
// // Don't know what does '&&' mean here.
// const UNWANTED_END_CHAR_PATTERN = new RegExp(`[[\\P{N}&&\\P{L}]&&[^#]]+$`)
//
const UNWANTED_END_CHAR_PATTERN = new RegExp(`[^${_pN}${_pL}#]+$`)

const NON_DIGITS_PATTERN = /(\D+)/

/**
 * Leniency when finding potential phone numbers in text segments
 * The levels here are ordered in increasing strictness.
 */
export const Leniency =
{
	/**
	 * Phone numbers accepted are "possible", but not necessarily "valid".
	 */
	POSSIBLE(number, candidate, metadata)
	{
		return parseNumber(number, { extended: true }, metadata).possible
	},

	/**
	 * Phone numbers accepted are "possible" and "valid".
	 * Numbers written in national format must have their national-prefix
	 * present if it is usually written for a number of this type.
	 */
	VALID(number, candidate, metadata)
	{
		if (!isValidNumber(number, metadata) ||
			!containsOnlyValidXChars(number, candidate.toString(), metadata))
		{
			return false
		}

		return isNationalPrefixPresentIfRequired(number, metadata)
  },

	/**
	 * Phone numbers accepted are "valid" and
	 * are grouped in a possible way for this locale. For example, a US number written as
	 * "65 02 53 00 00" and "650253 0000" are not accepted at this leniency level, whereas
	 * "650 253 0000", "650 2530000" or "6502530000" are.
	 * Numbers with more than one '/' symbol in the national significant number
	 * are also dropped at this level.
	 *
	 * Warning: This level might result in lower coverage especially for regions outside of
	 * country code "+1". If you are not sure about which level to use,
	 * email the discussion group libphonenumber-discuss@googlegroups.com.
	 */
	STRICT_GROUPING(number, candidate, metadata)
	{
		const candidateString = candidate.toString()

		if (!isValidNumber(number, metadata)
			|| !containsOnlyValidXChars(number, candidateString, metadata)
			|| containsMoreThanOneSlashInNationalNumber(number, candidateString)
			|| !isNationalPrefixPresentIfRequired(number, metadata))
		{
			return false
		}

		return checkNumberGroupingIsValid
		(
			number,
			candidate,
			metadata,
			allNumberGroupsRemainGrouped
		)
  },

	/**
	 * Phone numbers accepted are {@linkplain PhoneNumberUtil#isValidNumber(PhoneNumber) valid} and
	 * are grouped in the same way that we would have formatted it, or as a single block. For
	 * example, a US number written as "650 2530000" is not accepted at this leniency level, whereas
	 * "650 253 0000" or "6502530000" are.
	 * Numbers with more than one '/' symbol are also dropped at this level.
	 * <p>
	 * Warning: This level might result in lower coverage especially for regions outside of country
	 * code "+1". If you are not sure about which level to use, email the discussion group
	 * libphonenumber-discuss@googlegroups.com.
	 */
	EXACT_GROUPING(number, candidate, metadata)
	{
		const candidateString = candidate.toString()

		if (!isValidNumber(number, metadata)
			|| !containsOnlyValidXChars(number, candidateString, metadata)
			|| containsMoreThanOneSlashInNationalNumber(number, candidateString)
			|| !isNationalPrefixPresentIfRequired(number, metadata))
		{
			return false
		}

		return checkNumberGroupingIsValid
		(
			number,
			candidate,
			metadata,
   		allNumberGroupsAreExactlyPresent
		)
	}
}

/**
 * A stateful class that finds and extracts telephone numbers from {@linkplain CharSequence text}.
 * Instances can be created using the {@linkplain PhoneNumberUtil#findNumbers factory methods} in
 * {@link PhoneNumberUtil}.
 *
 * <p>Vanity numbers (phone numbers using alphabetic digits such as <tt>1-800-SIX-FLAGS</tt> are
 * not found.
 *
 * <p>This class is not thread-safe.
 */
export default class PhoneNumberMatcher
{
  /** The iteration tristate. */
  state = 'NOT_READY'

  /** The next index to start searching at. Undefined in {@link State#DONE}. */
  searchIndex = 0

  /**
   * Creates a new instance. See the factory methods in {@link PhoneNumberUtil} on how to obtain a
   * new instance.
   *
   * @param util  the phone number util to use
   * @param text  the character sequence that we will search, null for no text
   * @param country  the country to assume for phone numbers not written in international format
   *     (with a leading plus, or with the international dialing prefix of the specified region).
   *     May be null or "ZZ" if only numbers with a leading plus should be
   *     considered.
   * @param leniency  the leniency to use when evaluating candidate phone numbers
   * @param maxTries  the maximum number of invalid numbers to try before giving up on the text.
   *     This is to cover degenerate cases where the text has a lot of false positives in it. Must
   *     be {@code >= 0}.
   */
  constructor(text = '', defaultCountry, leniency, maxTries)
  {
		if (leniency === undefined)
		{
			throw new TypeError()
		}

		if (maxTries < 0)
		{
			throw new TypeError()
		}

		this.text = text
		this.defaultCountry = defaultCountry

		/** The degree of validation requested. */
		this.leniency = Leniency[leniency]

		if (!this.leniency)
		{
			throw new TypeError(`Unknown leniency: ${leniency}.`)
		}

		/** The maximum number of retries after matching an invalid number. */
		this.maxTries = maxTries

		this.PATTERN = new RegExp(PATTERN, 'i')
  }

  /**
   * Attempts to find the next subsequence in the searched sequence on or after {@code searchIndex}
   * that represents a phone number. Returns the next match, null if none was found.
   *
   * @param index  the search index to start searching at
   * @return  the phone number match found, null if none can be found
   */
	find(index)
	{
		// Reset the regular expression.
		this.PATTERN.lastIndex = 0

		let matches
		while ((this.maxTries > 0) && (matches = this.PATTERN.exec(this.text)) !== null)
		{
			let candidate = matches[0]

			// Check for extra numbers at the end.
			// TODO: This is the place to start when trying to support extraction of multiple phone number
			// from split notations (+41 79 123 45 67 / 68).
			candidate = trimAfterFirstMatch(SECOND_NUMBER_START_PATTERN, candidate)

			const match = extractMatch(this.text, candidate, start)

			if (match != null) {
				return match
			}

			this.maxTries--
		}
	}

	/**
	* Attempts to extract a match from a {@code candidate} character sequence.
	*
	* @param candidate  the candidate text that might contain a phone number
	* @param offset  the offset of {@code candidate} within {@link #text}
	* @return  the match found, null if none can be found
	*/
	extractMatch(candidate, offset)
	{
		// Skip a match that is more likely to be a date.
		if (SLASH_SEPARATED_DATES.test(candidate)) {
			return
		}

		// Skip potential time-stamps.
		if (TIME_STAMPS.test(candidate))
		{
			const followingText = this.text.slice(offset + candidate.length)
			if (TIME_STAMPS_SUFFIX_LEADING.test(followingText)) {
				return
			}
		}

		// Try to come up with a valid match given the entire candidate.
		const match = this.parseAndVerify(candidate, offset)

		if (match != null) {
			return match
		}

		// If that failed, try to find an "inner match" -
		// there might be a phone number within this candidate.
		return this.extractInnerMatch(candidate, offset)
	}

  /**
   * Attempts to extract a match from {@code candidate} if the whole candidate does not qualify as a
   * match.
   *
   * @param candidate  the candidate text that might contain a phone number
   * @param offset  the current offset of {@code candidate} within {@link #text}
   * @return  the match found, null if none can be found
   */
  extractInnerMatch(candidate, offset)
  {
    for (const possibleInnerMatch of INNER_MATCHES)
    {
      // Reset regular expression.
      possibleInnerMatch.lastIndex = 0

      let isFirstMatch = true
      let matches
      while ((matches = possibleInnerMatch.exec(candidate)) !== null && this.maxTries > 0)
      {
        if (isFirstMatch)
        {
          // We should handle any group before this one too.
          const group = trimAfterFirstMatch
          (
            UNWANTED_END_CHAR_PATTERN,
            candidate.slice(0, matches.index)
          )

          const match = this.parseAndVerify(group, offset)
          if (match != null)
          {
            return match
          }

          this.maxTries--
          isFirstMatch = false
        }

        const group = trimAfterFirstMatch
        (
        	UNWANTED_END_CHAR_PATTERN,
        	matches[1]
        )

        // Java code does `groupMatcher.start(1)` here,
        // but there's no way in javascript to get a group match start index,
        // therefore using the overall match start index `matches.index`.
        const match = this.parseAndVerify(group, offset + matches.index)
        if (match != null)
        {
          return match
        }

        this.maxTries--
      }
    }
  }

  /**
   * Parses a phone number from the `candidate` using `parseNumber` and
   * verifies it matches the requested `leniency`. If parsing and verification succeed,
   * a corresponding `PhoneNumberMatch` is returned, otherwise this method returns `null`.
   *
   * @param candidate  the candidate match
   * @param offset  the offset of {@code candidate} within {@link #text}
   * @return  the parsed and validated phone number match, or null
   */
  parseAndVerify(candidate, offset)
  {
    try
    {
      // Check the candidate doesn't contain any formatting
      // which would indicate that it really isn't a phone number.
      if (!MATCHING_BRACKETS_ENTIRE.test(candidate) || PUB_PAGES.test(candidate)) {
        return
      }

      // If leniency is set to VALID or stricter, we also want to skip numbers that are surrounded
      // by Latin alphabetic characters, to skip cases like abc8005001234 or 8005001234def.
      if (this.leniency !== Leniency.POSSIBLE)
      {
      	if (!isValidCandidate(candidate, offset, this.text)) {
      		return
      	}
      }

      const number = phoneUtil.parseAndKeepRawInput(candidate, this.defaultCountry)

      // Check Israel * numbers: these are a special case in that they are four-digit numbers that
      // our library supports, but they can only be dialled with a leading *. Since we don't
      // actually store or detect the * in our phone number library, this means in practice we
      // detect most four digit numbers as being valid for Israel. We are considering moving these
      // numbers to ShortNumberInfo instead, in which case this problem would go away, but in the
      // meantime we want to restrict the false matches so we only allow these numbers if they are
      // preceded by a star. We enforce this for all leniency levels even though these numbers are
      // technically accepted by isPossibleNumber and isValidNumber since we consider it to be a
      // deficiency in those methods that they accept these numbers without the *.
      // TODO: Remove this or make it significantly less hacky once we've decided how to
      // handle these short codes going forward in ShortNumberInfo. We could use the formatting
      // rules for instance, but that would be slower.
      if (phoneUtil.getRegionCodeForCountryCode(number.getCountryCode()) === 'IL'
          && phoneUtil.getNationalSignificantNumber(number).length === 4
          && (offset === 0 || (offset > 0 && this.text[offset - 1] !== '*')))
      {
        // No match.
        return
      }

      if (this.leniency(number, candidate, phoneUtil))
      {
        // We used parseAndKeepRawInput to create this number, but for now we don't return the extra
        // values parsed. TODO: stop clearing all values here and switch all users over
        // to using rawInput() rather than the rawString() of PhoneNumberMatch.
        number.clearCountryCodeSource()
        number.clearRawInput()
        number.clearPreferredDomesticCarrierCode()

        return {
        	startsAt : offset,
        	endsAt   : offset + candidate.length,
        	raw      : candidate,
        	number
        }
      }
    }
    catch (error)
    {
    	// if (error instanceof NumberParseException) {
      //   // ignore and continue
      // }
      // throw error
    }
  }

  hasNext()
  {
    if (this.state === 'NOT_READY')
    {
      this.lastMatch = this.find(this.searchIndex)

      if (this.lastMatch)
      {
        this.searchIndex = this.lastMatch.end()
        this.state = 'READY'
      }
      else
      {
        this.state = 'DONE'
      }
    }

    return this.state === 'READY'
  }

  next()
  {
    // Check the state and find the next match as a side-effect if necessary.
    if (!this.hasNext())
    {
      throw new Error('No next element')
    }

    // Don't retain that memory any longer than necessary.
    const result = this.lastMatch
    this.lastMatch = null
    this.state = 'NOT_READY'
    return result
  }
}

/** Returns a regular expression quantifier with an upper and lower limit. */
function limit(lower, upper)
{
	if ((lower < 0) || (upper <= 0) || (upper < lower))
	{
		throw new TypeError()
	}
	return `{${lower},${upper}`
}

/**
 * Trims away any characters after the first match of {@code pattern} in {@code candidate},
 * returning the trimmed version.
 */
function trimAfterFirstMatch(regexp, string)
{
	const index = string.search(regexp)

	if (index >= 0) {
		return string.slice(0, index)
	}

	return string
}

function allNumberGroupsRemainGrouped
(
	metadata,
	number,
	normalizedCandidate,
	formattedNumberGroups
)
{
  let fromIndex = 0
  if (number.getCountryCodeSource() !== CountryCodeSource.FROM_DEFAULT_COUNTRY)
  {
    // First skip the country code if the normalized candidate contained it.
    const countryCode = String(number.getCountryCode())
    fromIndex = normalizedCandidate.indexOf(countryCode) + countryCode.length()
  }

  // Check each group of consecutive digits are not broken into separate groupings in the
  // {@code normalizedCandidate} string.
  for (let i = 0; i < formattedNumberGroups.length; i++)
  {
    // Fails if the substring of {@code normalizedCandidate} starting from {@code fromIndex}
    // doesn't contain the consecutive digits in formattedNumberGroups[i].
    fromIndex = normalizedCandidate.indexOf(formattedNumberGroups[i], fromIndex)
    if (fromIndex < 0) {
      return false
    }
    // Moves {@code fromIndex} forward.
    fromIndex += formattedNumberGroups[i].length()
    if (i == 0 && fromIndex < normalizedCandidate.length())
    {
      // We are at the position right after the NDC. We get the region used for formatting
      // information based on the country code in the phone number, rather than the number itself,
      // as we do not need to distinguish between different countries with the same country
      // calling code and this is faster.
      const region = util.getRegionCodeForCountryCode(number.getCountryCode())
      if (util.getNddPrefixForRegion(region, true) != null
          && Character.isDigit(normalizedCandidate.charAt(fromIndex))) {
        // This means there is no formatting symbol after the NDC. In this case, we only
        // accept the number if there is no formatting symbol at all in the number, except
        // for extensions. This is only important for countries with national prefixes.
        const nationalSignificantNumber = util.getNationalSignificantNumber(number)
        return startsWith
        (
      	  normalizedCandidate.slice(fromIndex - formattedNumberGroups[i].length),
          nationalSignificantNumber
        )
      }
    }
  }

  // The check here makes sure that we haven't mistakenly already used the extension to
  // match the last group of the subscriber number. Note the extension cannot have
  // formatting in-between digits.
  return normalizedCandidate.slice(fromIndex).contains(number.getExtension())
}

function allNumberGroupsAreExactlyPresent
(
	metadata,
	number,
	normalizedCandidate,
	formattedNumberGroups
)
{
  const candidateGroups = normalizedCandidate.split(NON_DIGITS_PATTERN)

  // Set this to the last group, skipping it if the number has an extension.
  let candidateNumberGroupIndex =
      number.hasExtension() ? candidateGroups.length - 2 : candidateGroups.length - 1

  // First we check if the national significant number is formatted as a block.
  // We use contains and not equals, since the national significant number may be present with
  // a prefix such as a national number prefix, or the country code itself.
  if (candidateGroups.length == 1
      || candidateGroups[candidateNumberGroupIndex].contains(
          util.getNationalSignificantNumber(number)))
  {
    return true
  }

  // Starting from the end, go through in reverse, excluding the first group, and check the
  // candidate and number groups are the same.
  let formattedNumberGroupIndex = (formattedNumberGroups.length - 1)
  while (formattedNumberGroupIndex > 0 && candidateNumberGroupIndex >= 0)
  {
    if (candidateGroups[candidateNumberGroupIndex] !== formattedNumberGroups[formattedNumberGroupIndex])
    {
      return false
    }
    formattedNumberGroupIndex--
    candidateNumberGroupIndex--
  }

  // Now check the first group. There may be a national prefix at the start, so we only check
  // that the candidate group ends with the formatted number group.
  return (candidateNumberGroupIndex >= 0
      && endsWith(candidateGroups[candidateNumberGroupIndex], formattedNumberGroups[0]))
}

/**
 * Helper method to get the national-number part of a number, formatted without any national
 * prefix, and return it as a set of digit blocks that would be formatted together.
 */
function getNationalNumberGroups
(
	metadata,
	number,
	formattingPattern
)
{
  if (formattingPattern)
  {
    // We format the NSN only, and split that according to the separator.
    const nationalSignificantNumber = util.getNationalSignificantNumber(number)
    return util.formatNsnUsingPattern(nationalSignificantNumber,
                                      formattingPattern, 'RFC3966', metadata).split('-')
	}

  // This will be in the format +CC-DG;ext=EXT where DG represents groups of digits.
  const rfc3966Format = formatNumber(number, 'RFC3966', metadata)

  // We remove the extension part from the formatted string before splitting it into different
  // groups.
  let endIndex = rfc3966Format.indexOf(';')
  if (endIndex < 0) {
    endIndex = rfc3966Format.length
  }

  // The country-code will have a '-' following it.
  const startIndex = rfc3966Format.indexOf('-') + 1
  return rfc3966Format.slice(startIndex, endIndex).split('-')
}

function checkNumberGroupingIsValid
(
  number,
  candidate,
  metadata,
  checkGroups
)
{
  // TODO: Evaluate how this works for other locales (testing has been limited to NANPA regions)
  // and optimise if necessary.
  const normalizedCandidate = normalizeDigits(candidate, true /* keep non-digits */)
  let formattedNumberGroups = getNationalNumberGroups(metadata, number, null)
  if (checkGroups(metadata, number, normalizedCandidate, formattedNumberGroups))
  {
    return true
  }

  // If this didn't pass, see if there are any alternate formats, and try them instead.
  const alternateFormats = MetadataManager.getAlternateFormatsForCountry(number.getCountryCode())

  if (alternateFormats)
  {
    for (const alternateFormat of alternateFormats.numberFormats())
    {
      formattedNumberGroups = getNationalNumberGroups(metadata, number, alternateFormat)

      if (checkGroups(metadata, number, normalizedCandidate, formattedNumberGroups)) {
        return true
      }
    }
  }

  return false
}

export function containsMoreThanOneSlashInNationalNumber(number, candidate)
{
  const firstSlashInBodyIndex = candidate.indexOf('/')
  if (firstSlashInBodyIndex < 0)
  {
    // No slashes, this is okay.
    return false
  }

  // Now look for a second one.
  const secondSlashInBodyIndex = candidate.indexOf('/', firstSlashInBodyIndex + 1)
  if (secondSlashInBodyIndex < 0)
  {
    // Only one slash, this is okay.
    return false
  }

  // If the first slash is after the country calling code, this is permitted.
  const candidateHasCountryCode =
      (number.getCountryCodeSource() === CountryCodeSource.FROM_NUMBER_WITH_PLUS_SIGN
       || number.getCountryCodeSource() === CountryCodeSource.FROM_NUMBER_WITHOUT_PLUS_SIGN)

  if (candidateHasCountryCode
      && PhoneNumberUtil.normalizeDigitsOnly(candidate.substring(0, firstSlashInBodyIndex))
          === String(number.getCountryCode()))
  {
    // Any more slashes and this is illegal.
    return candidate.slice(secondSlashInBodyIndex + 1).indexOf('/') >= 0
  }

  return true
}

function containsOnlyValidXChars(number, candidate, metadata)
{
  // The characters 'x' and 'X' can be (1) a carrier code, in which case they always precede the
  // national significant number or (2) an extension sign, in which case they always precede the
  // extension number. We assume a carrier code is more than 1 digit, so the first case has to
  // have more than 1 consecutive 'x' or 'X', whereas the second case can only have exactly 1 'x'
  // or 'X'. We ignore the character if it appears as the last character of the string.
  for (let index = 0; index < candidate.length - 1; index++)
  {
    const charAtIndex = candidate.charAt(index)

    if (charAtIndex === 'x' || charAtIndex === 'X')
    {
      const charAtNextIndex = candidate.charAt(index + 1)

      if (charAtNextIndex === 'x' || charAtNextIndex === 'X')
      {
        // This is the carrier code case, in which the 'X's always precede the national
        // significant number.
        index++
        if (util.isNumberMatch(number, candidate.substring(index)) != MatchType.NSN_MATCH)
        {
          return false
        }
	      // This is the extension sign case, in which the 'x' or 'X' should always precede the
	      // extension number.
      }
      else if (!PhoneNumberUtil.normalizeDigitsOnly(candidate.substring(index)) === number.getExtension())
      {
        return false
      }
    }
  }

  return true
}

function isNationalPrefixPresentIfRequired(number, _metadata)
{
  // First, check how we deduced the country code. If it was written in international format, then
  // the national prefix is not required.
  if (number.getCountryCodeSource() != 'FROM_DEFAULT_COUNTRY')
  {
    return true
  }

  const phoneNumberRegion = util.getRegionCodeForCountryCode(number.getCountryCode())

  const metadata = util.getMetadataForRegion(phoneNumberRegion)
  if (metadata == null)
  {
    return true
  }

  // Check if a national prefix should be present when formatting this number.
  const nationalNumber = util.getNationalSignificantNumber(number)
  const formatRule = util.chooseFormattingPatternForNumber(metadata.numberFormats(), nationalNumber)

  // To do this, we check that a national prefix formatting rule was present and that it wasn't
  // just the first-group symbol ($1) with punctuation.
  if (formatRule && formatRule.getNationalPrefixFormattingRule().length > 0)
  {
    if (formatRule.getNationalPrefixOptionalWhenFormatting())
    {
      // The national-prefix is optional in these cases, so we don't need to check if it was
      // present.
      return true
    }

    if (PhoneNumberUtil.formattingRuleHasFirstGroupOnly(
        formatRule.getNationalPrefixFormattingRule()))
    {
      // National Prefix not needed for this number.
      return true
    }

    // Normalize the remainder.
    const rawInputCopy = PhoneNumberUtil.normalizeDigitsOnly(number.getRawInput())

    // Check if we found a national prefix and/or carrier code at the start of the raw input, and
    // return the result.
    return util.maybeStripNationalPrefixAndCarrierCode(rawInputCopy, metadata, null)
  }

  return true
}

export function startsWith(string, substring)
{
	let j = substring.length

	if (j > string.length)
	{
		return false
	}

	while (j > 0)
	{
		j--

		if (string[j] !== substring[j])
		{
			return false
		}
	}

	return true
}

export function endsWith(string, substring)
{
	let i = string.length
	let j = substring.length

	if (j > i)
	{
		return false
	}

	while (j > 0)
	{
		i--
		j--

		if (string[i] !== substring[j])
		{
			return false
		}
	}

	return true

	// const index = string.lastIndexOf(substring)
	// return index >= 0 && index === string.length - substring.length
}

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
	PLUS_CHARS,
	create_extension_pattern
}
from './common'

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
const TIME_STAMPS_SUFFIX = /:[0-5]\d/

/**
 * "\p{Z}" is any kind of whitespace or invisible separator ("Separator").
 * http://www.regular-expressions.info/unicode.html
 * "\P{Z}" is the reverse of "\p{Z}".
 * "\p{Nd}" is a digit zero through nine in any script except "ideographic scripts" ("Decimal_Digit_Number").
 * "\p{Sc}" is a currency symbol ("Currency_Symbol").
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
const _pNd = '\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19'
const pNd = `[${_pNd}]`
const _pSc = '\u0024\u00A2-\u00A5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20B9\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6'
const pSc = `[${_pSc}]`
const pSc_regexp = new RegExp(pSc)

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

const openingParens = '(\\[\uFF08\uFF3B'
const closingParens = ')\\]\uFF09\uFF3D'
const nonParens = `[^${openingParens}${closingParens}]`

/* Limit on the number of pairs of brackets in a phone number. */
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
const MATCHING_BRACKETS = new RegExp
(
	"(?:[" + openingParens + "])?" + "(?:" + nonParens + "+" + "[" + closingParens + "])?"
	+ nonParens + "+"
	+ "(?:[" + openingParens + "]" + nonParens + "+[" + closingParens + "])" + bracketPairLimit
	+ nonParens + "*"
)

/* Limit on the number of leading (plus) characters. */
const leadLimit = limit(0, 2)

/* Limit on the number of consecutive punctuation characters. */
const punctuationLimit = limit(0, 4)

/* The maximum number of digits allowed in a digit-separated block. As we allow all digits in a
 * single block, set high enough to accommodate the entire national number and the international
 * country code. */
const digitBlockLimit = MAX_LENGTH_FOR_NSN + MAX_LENGTH_COUNTRY_CODE

/* Limit on the number of blocks separated by punctuation. Uses digitBlockLimit since some
 * formats use spaces to separate each digit. */
const blockLimit = limit(0, digitBlockLimit)

/* A punctuation sequence allowing white space. */
const punctuation = `[${VALID_PUNCTUATION}]` + punctuationLimit

/* A digits block without punctuation. */
const digitSequence = pNd + limit(1, digitBlockLimit)

const leadClassChars = openingParens + PLUS_CHARS
const leadClass = `[${leadClassChars}]`

/**
 * Punctuation that may be at the start of a phone number - brackets and plus signs.
 */
const LEAD_CLASS = new RegExp(leadClass)

/**
 * Phone number pattern allowing optional punctuation.
 * The phone number pattern used by {@link #find}, similar to
 * {@code PhoneNumberUtil.VALID_PHONE_NUMBER}, but with the following differences:
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
const PATTERN = '(?:' + leadClass + punctuation + ')' + leadLimit
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

/**
 * Leniency when {@linkplain PhoneNumberUtil#findNumbers finding} potential phone numbers in text
 * segments. The levels here are ordered in increasing strictness.
 */
export const Leniency =
{
	/**
	 * Phone numbers accepted are {@linkplain PhoneNumberUtil#isPossibleNumber(PhoneNumber)
	 * possible}, but not necessarily {@linkplain PhoneNumberUtil#isValidNumber(PhoneNumber) valid}.
	 */
	POSSIBLE(number, candidate, util)
	{
		return util.isPossibleNumber(number)
	},

	/**
	 * Phone numbers accepted are {@linkplain PhoneNumberUtil#isPossibleNumber(PhoneNumber)
	 * possible} and {@linkplain PhoneNumberUtil#isValidNumber(PhoneNumber) valid}. Numbers written
	 * in national format must have their national-prefix present if it is usually written for a
	 * number of this type.
	 */
	VALID(number, candidate, util)
	{
		if (!util.isValidNumber(number) ||
			!PhoneNumberMatcher.containsOnlyValidXChars(number, candidate.toString(), util))
		{
			return false
		}

		return PhoneNumberMatcher.isNationalPrefixPresentIfRequired(number, util)
  },

	/**
	 * Phone numbers accepted are {@linkplain PhoneNumberUtil#isValidNumber(PhoneNumber) valid} and
	 * are grouped in a possible way for this locale. For example, a US number written as
	 * "65 02 53 00 00" and "650253 0000" are not accepted at this leniency level, whereas
	 * "650 253 0000", "650 2530000" or "6502530000" are.
	 * Numbers with more than one '/' symbol in the national significant number are also dropped at
	 * this level.
	 * <p>
	 * Warning: This level might result in lower coverage especially for regions outside of country
	 * code "+1". If you are not sure about which level to use, email the discussion group
	 * libphonenumber-discuss@googlegroups.com.
	 */
	STRICT_GROUPING(number, candidate, util)
	{
		String candidateString = candidate.toString()

		if (!util.isValidNumber(number)
			|| !PhoneNumberMatcher.containsOnlyValidXChars(number, candidateString, util)
			|| PhoneNumberMatcher.containsMoreThanOneSlashInNationalNumber(number, candidateString)
			|| !PhoneNumberMatcher.isNationalPrefixPresentIfRequired(number, util))
		{
			return false
		}

		return PhoneNumberMatcher.checkNumberGroupingIsValid
		(
			number,
			candidate,
			util,
			new PhoneNumberMatcher.NumberGroupingChecker()
			{
				public boolean checkGroups
				(
					PhoneNumberUtil util, PhoneNumber number,
					StringBuilder normalizedCandidate,
					String[] expectedNumberGroups
				)
				{
					return PhoneNumberMatcher.allNumberGroupsRemainGrouped(util, number, normalizedCandidate, expectedNumberGroups)
				}
			})
		}
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
	EXACT_GROUPING(PhoneNumber number, CharSequence candidate, PhoneNumberUtil util)
	{
		String candidateString = candidate.toString()

		if (!util.isValidNumber(number)
			|| !PhoneNumberMatcher.containsOnlyValidXChars(number, candidateString, util)
			|| PhoneNumberMatcher.containsMoreThanOneSlashInNationalNumber(number, candidateString)
			|| !PhoneNumberMatcher.isNationalPrefixPresentIfRequired(number, util))
		{
			return false
		}

		return PhoneNumberMatcher.checkNumberGroupingIsValid
		(
			number,
			candidate,
			util,
			new PhoneNumberMatcher.NumberGroupingChecker()
			{
				public boolean checkGroups
				(
					PhoneNumberUtil util,
					PhoneNumber number,
					StringBuilder normalizedCandidate,
					String[] expectedNumberGroups
				)
				{
					return PhoneNumberMatcher.allNumberGroupsAreExactlyPresent(util, number, normalizedCandidate, expectedNumberGroups)
				}
			})
		}
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
class PhoneNumberMatcher
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
  constructor(text = '', country, leniency, maxTries)
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
		this.preferredRegion = country

		/** The degree of validation requested. */
		this.leniency = leniency

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
		while ((this.maxTries > 0) && (matches = this.PATTERN.exec(text)) !== null)
		{
			let candidate = matches[0]

			// Check for extra numbers at the end.
			// TODO: This is the place to start when trying to support extraction of multiple phone number
			// from split notations (+41 79 123 45 67 / 68).
			candidate = trimAfterFirstMatch(SECOND_NUMBER_START_PATTERN, candidate)

			const match = extractMatch(this.text, candidate, start)

			if (match != null)
			{
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
		if (SLASH_SEPARATED_DATES.test(candidate))
		{
			return
		}

		// Skip potential time-stamps.
		if (TIME_STAMPS.test(candidate))
		{
			const followingText = this.text.slice(offset + candidate.length)
			if (TIME_STAMPS_SUFFIX.test(followingText))
			{
				return
			}
		}

		// Try to come up with a valid match given the entire candidate.
		const match = parseAndVerify(candidate, offset)

		if (match != null)
		{
			return match
		}

		// If that failed, try to find an "inner match" - there might be a phone number within this
		// candidate.
		return extractInnerMatch(candidate, offset)
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
    for (Pattern possibleInnerMatch : INNER_MATCHES)
    {
      Matcher groupMatcher = possibleInnerMatch.matcher(candidate)
      boolean isFirstMatch = true
      while (groupMatcher.find() && this.maxTries > 0) {
        if (isFirstMatch) {
          // We should handle any group before this one too.
          CharSequence group = trimAfterFirstMatch(
              PhoneNumberUtil.UNWANTED_END_CHAR_PATTERN,
              candidate.subSequence(0, groupMatcher.start()))
          PhoneNumberMatch match = parseAndVerify(group, offset)
          if (match != null) {
            return match
          }
          this.maxTries--
          isFirstMatch = false
        }
        CharSequence group = trimAfterFirstMatch(
            PhoneNumberUtil.UNWANTED_END_CHAR_PATTERN, groupMatcher.group(1));
        PhoneNumberMatch match = parseAndVerify(group, offset + groupMatcher.start(1));
        if (match != null) {
          return match
        }
        this.maxTries--
      }
    }
  }

  /**
   * Parses a phone number from the {@code candidate} using {@link PhoneNumberUtil#parse} and
   * verifies it matches the requested {@link #leniency}. If parsing and verification succeed, a
   * corresponding {@link PhoneNumberMatch} is returned, otherwise this method returns null.
   *
   * @param candidate  the candidate match
   * @param offset  the offset of {@code candidate} within {@link #text}
   * @return  the parsed and validated phone number match, or null
   */
  parseAndVerify(candidate, offset) {
    try {
      // Check the candidate doesn't contain any formatting which would indicate that it really
      // isn't a phone number.
      if (!MATCHING_BRACKETS.matcher(candidate).matches() || PUB_PAGES.matcher(candidate).find()) {
        return
      }

      // If leniency is set to VALID or stricter, we also want to skip numbers that are surrounded
      // by Latin alphabetic characters, to skip cases like abc8005001234 or 8005001234def.
      if (leniency.compareTo(Leniency.VALID) >= 0) {
        // If the candidate is not at the start of the text, and does not start with phone-number
        // punctuation, check the previous character.
        if (offset > 0 && !LEAD_CLASS.matcher(candidate).lookingAt()) {
          char previousChar = text.charAt(offset - 1);
          // We return null if it is a latin letter or an invalid punctuation symbol.
          if (isInvalidPunctuationSymbol(previousChar) || isLatinLetter(previousChar)) {
            return
          }
        }
        int lastCharIndex = offset + candidate.length();
        if (lastCharIndex < text.length()) {
          char nextChar = text.charAt(lastCharIndex);
          if (isInvalidPunctuationSymbol(nextChar) || isLatinLetter(nextChar)) {
            return
          }
        }
      }

      PhoneNumber number = phoneUtil.parseAndKeepRawInput(candidate, preferredRegion);

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
      if (phoneUtil.getRegionCodeForCountryCode(number.getCountryCode()).equals("IL")
          && phoneUtil.getNationalSignificantNumber(number).length() == 4
          && (offset == 0 || (offset > 0 && text.charAt(offset - 1) != '*'))) {
        // No match.
        return
      }

      if (leniency.verify(number, candidate, phoneUtil)) {
        // We used parseAndKeepRawInput to create this number, but for now we don't return the extra
        // values parsed. TODO: stop clearing all values here and switch all users over
        // to using rawInput() rather than the rawString() of PhoneNumberMatch.
        number.clearCountryCodeSource();
        number.clearRawInput();
        number.clearPreferredDomesticCarrierCode();
        return new PhoneNumberMatch(offset, candidate.toString(), number);
      }
    } catch (NumberParseException e) {
      // ignore and continue
    }
  }

  public boolean hasNext() {
    if (state == State.NOT_READY) {
      lastMatch = find(searchIndex);
      if (lastMatch == null) {
        state = State.DONE;
      } else {
        searchIndex = lastMatch.end();
        state = State.READY;
      }
    }
    return state == State.READY;
  }

  public PhoneNumberMatch next() {
    // Check the state and find the next match as a side-effect if necessary.
    if (!hasNext())
    {
      throw new NoSuchElementException();
    }

    // Don't retain that memory any longer than necessary.
    PhoneNumberMatch result = lastMatch;
    lastMatch = null;
    state = State.NOT_READY;
    return result;
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

	if (index >= 0)
	{
		return string.slice(0, index)
	}

	return string
}

function isInvalidPunctuationSymbol(character)
{
  return character === '%' || pSc_regexp.test(character)
}

/**
 * Helper method to determine if a character is a Latin-script letter or not. For our purposes,
 * combining marks should also return true since we assume they have been added to a preceding
 * Latin character.
 */
function isLatinLetter(letter)
{
  // Combining marks are a subset of non-spacing-mark.
  if (!Character.isLetter(letter) && Character.getType(letter) != Character.NON_SPACING_MARK)
  {
    return false
  }

  UnicodeBlock block = UnicodeBlock.of(letter)

  return block.equals(UnicodeBlock.BASIC_LATIN)
      || block.equals(UnicodeBlock.LATIN_1_SUPPLEMENT)
      || block.equals(UnicodeBlock.LATIN_EXTENDED_A)
      || block.equals(UnicodeBlock.LATIN_EXTENDED_ADDITIONAL)
      || block.equals(UnicodeBlock.LATIN_EXTENDED_B)
      || block.equals(UnicodeBlock.COMBINING_DIACRITICAL_MARKS);
}

  /**
   * Small helper interface such that the number groups can be checked according to different
   * criteria, both for our default way of performing formatting and for any alternate formats we
   * may want to check.
   */
  interface NumberGroupingChecker {
    /**
     * Returns true if the groups of digits found in our candidate phone number match our
     * expectations.
     *
     * @param number  the original number we found when parsing
     * @param normalizedCandidate  the candidate number, normalized to only contain ASCII digits,
     *     but with non-digits (spaces etc) retained
     * @param expectedNumberGroups  the groups of digits that we would expect to see if we
     *     formatted this number
     */
    boolean checkGroups(PhoneNumberUtil util, PhoneNumber number,
                        StringBuilder normalizedCandidate, String[] expectedNumberGroups);
  }



  static boolean allNumberGroupsRemainGrouped(PhoneNumberUtil util,
                                              PhoneNumber number,
                                              StringBuilder normalizedCandidate,
                                              String[] formattedNumberGroups) {
    int fromIndex = 0;
    if (number.getCountryCodeSource() != CountryCodeSource.FROM_DEFAULT_COUNTRY) {
      // First skip the country code if the normalized candidate contained it.
      String countryCode = Integer.toString(number.getCountryCode());
      fromIndex = normalizedCandidate.indexOf(countryCode) + countryCode.length();
    }
    // Check each group of consecutive digits are not broken into separate groupings in the
    // {@code normalizedCandidate} string.
    for (int i = 0; i < formattedNumberGroups.length; i++) {
      // Fails if the substring of {@code normalizedCandidate} starting from {@code fromIndex}
      // doesn't contain the consecutive digits in formattedNumberGroups[i].
      fromIndex = normalizedCandidate.indexOf(formattedNumberGroups[i], fromIndex);
      if (fromIndex < 0) {
        return false;
      }
      // Moves {@code fromIndex} forward.
      fromIndex += formattedNumberGroups[i].length();
      if (i == 0 && fromIndex < normalizedCandidate.length()) {
        // We are at the position right after the NDC. We get the region used for formatting
        // information based on the country code in the phone number, rather than the number itself,
        // as we do not need to distinguish between different countries with the same country
        // calling code and this is faster.
        String region = util.getRegionCodeForCountryCode(number.getCountryCode());
        if (util.getNddPrefixForRegion(region, true) != null
            && Character.isDigit(normalizedCandidate.charAt(fromIndex))) {
          // This means there is no formatting symbol after the NDC. In this case, we only
          // accept the number if there is no formatting symbol at all in the number, except
          // for extensions. This is only important for countries with national prefixes.
          String nationalSignificantNumber = util.getNationalSignificantNumber(number);
          return normalizedCandidate.substring(fromIndex - formattedNumberGroups[i].length())
              .startsWith(nationalSignificantNumber);
        }
      }
    }
    // The check here makes sure that we haven't mistakenly already used the extension to
    // match the last group of the subscriber number. Note the extension cannot have
    // formatting in-between digits.
    return normalizedCandidate.substring(fromIndex).contains(number.getExtension());
  }

  static boolean allNumberGroupsAreExactlyPresent(PhoneNumberUtil util,
                                                  PhoneNumber number,
                                                  StringBuilder normalizedCandidate,
                                                  String[] formattedNumberGroups) {
    String[] candidateGroups =
        PhoneNumberUtil.NON_DIGITS_PATTERN.split(normalizedCandidate.toString());
    // Set this to the last group, skipping it if the number has an extension.
    int candidateNumberGroupIndex =
        number.hasExtension() ? candidateGroups.length - 2 : candidateGroups.length - 1;
    // First we check if the national significant number is formatted as a block.
    // We use contains and not equals, since the national significant number may be present with
    // a prefix such as a national number prefix, or the country code itself.
    if (candidateGroups.length == 1
        || candidateGroups[candidateNumberGroupIndex].contains(
            util.getNationalSignificantNumber(number))) {
      return true;
    }
    // Starting from the end, go through in reverse, excluding the first group, and check the
    // candidate and number groups are the same.
    for (int formattedNumberGroupIndex = (formattedNumberGroups.length - 1);
         formattedNumberGroupIndex > 0 && candidateNumberGroupIndex >= 0;
         formattedNumberGroupIndex--, candidateNumberGroupIndex--) {
      if (!candidateGroups[candidateNumberGroupIndex].equals(
          formattedNumberGroups[formattedNumberGroupIndex])) {
        return false;
      }
    }
    // Now check the first group. There may be a national prefix at the start, so we only check
    // that the candidate group ends with the formatted number group.
    return (candidateNumberGroupIndex >= 0
        && candidateGroups[candidateNumberGroupIndex].endsWith(formattedNumberGroups[0]));
  }

  /**
   * Helper method to get the national-number part of a number, formatted without any national
   * prefix, and return it as a set of digit blocks that would be formatted together.
   */
  private static String[] getNationalNumberGroups(PhoneNumberUtil util, PhoneNumber number,
                                                  NumberFormat formattingPattern) {
    if (formattingPattern == null) {
      // This will be in the format +CC-DG;ext=EXT where DG represents groups of digits.
      String rfc3966Format = util.format(number, PhoneNumberFormat.RFC3966);
      // We remove the extension part from the formatted string before splitting it into different
      // groups.
      int endIndex = rfc3966Format.indexOf(';');
      if (endIndex < 0) {
        endIndex = rfc3966Format.length();
      }
      // The country-code will have a '-' following it.
      int startIndex = rfc3966Format.indexOf('-') + 1;
      return rfc3966Format.substring(startIndex, endIndex).split("-");
    } else {
      // We format the NSN only, and split that according to the separator.
      String nationalSignificantNumber = util.getNationalSignificantNumber(number);
      return util.formatNsnUsingPattern(nationalSignificantNumber,
                                        formattingPattern, PhoneNumberFormat.RFC3966).split("-");
    }
  }

  static boolean checkNumberGroupingIsValid(
      PhoneNumber number, CharSequence candidate, PhoneNumberUtil util,
      NumberGroupingChecker checker) {
    // TODO: Evaluate how this works for other locales (testing has been limited to NANPA regions)
    // and optimise if necessary.
    StringBuilder normalizedCandidate =
        PhoneNumberUtil.normalizeDigits(candidate, true /* keep non-digits */);
    String[] formattedNumberGroups = getNationalNumberGroups(util, number, null);
    if (checker.checkGroups(util, number, normalizedCandidate, formattedNumberGroups)) {
      return true
    }
    // If this didn't pass, see if there are any alternate formats, and try them instead.
    PhoneMetadata alternateFormats =
        MetadataManager.getAlternateFormatsForCountry(number.getCountryCode());
    if (alternateFormats != null) {
      for (NumberFormat alternateFormat : alternateFormats.numberFormats()) {
        formattedNumberGroups = getNationalNumberGroups(util, number, alternateFormat);
        if (checker.checkGroups(util, number, normalizedCandidate, formattedNumberGroups)) {
          return true
        }
      }
    }
    return false
  }

  static boolean containsMoreThanOneSlashInNationalNumber(PhoneNumber number, String candidate) {
    int firstSlashInBodyIndex = candidate.indexOf('/')
    if (firstSlashInBodyIndex < 0)
    {
      // No slashes, this is okay.
      return false
    }
    // Now look for a second one.
    int secondSlashInBodyIndex = candidate.indexOf('/', firstSlashInBodyIndex + 1)
    if (secondSlashInBodyIndex < 0)
    {
      // Only one slash, this is okay.
      return false
    }

    // If the first slash is after the country calling code, this is permitted.
    boolean candidateHasCountryCode =
        (number.getCountryCodeSource() == CountryCodeSource.FROM_NUMBER_WITH_PLUS_SIGN
         || number.getCountryCodeSource() == CountryCodeSource.FROM_NUMBER_WITHOUT_PLUS_SIGN);
    if (candidateHasCountryCode
        && PhoneNumberUtil.normalizeDigitsOnly(candidate.substring(0, firstSlashInBodyIndex))
            .equals(Integer.toString(number.getCountryCode()))) {
      // Any more slashes and this is illegal.
      return candidate.substring(secondSlashInBodyIndex + 1).contains("/")
    }
    return true
  }

  static boolean containsOnlyValidXChars(
      PhoneNumber number, String candidate, PhoneNumberUtil util) {
    // The characters 'x' and 'X' can be (1) a carrier code, in which case they always precede the
    // national significant number or (2) an extension sign, in which case they always precede the
    // extension number. We assume a carrier code is more than 1 digit, so the first case has to
    // have more than 1 consecutive 'x' or 'X', whereas the second case can only have exactly 1 'x'
    // or 'X'. We ignore the character if it appears as the last character of the string.
    for (int index = 0; index < candidate.length() - 1; index++) {
      char charAtIndex = candidate.charAt(index);
      if (charAtIndex == 'x' || charAtIndex == 'X') {
        char charAtNextIndex = candidate.charAt(index + 1);
        if (charAtNextIndex == 'x' || charAtNextIndex == 'X') {
          // This is the carrier code case, in which the 'X's always precede the national
          // significant number.
          index++;
          if (util.isNumberMatch(number, candidate.substring(index)) != MatchType.NSN_MATCH) {
            return false
          }
        // This is the extension sign case, in which the 'x' or 'X' should always precede the
        // extension number.
        } else if (!PhoneNumberUtil.normalizeDigitsOnly(candidate.substring(index)).equals(
            number.getExtension())) {
          return false
        }
      }
    }
    return true
  }

function isNationalPrefixPresentIfRequired(PhoneNumber number, PhoneNumberUtil util)
{
  // First, check how we deduced the country code. If it was written in international format, then
  // the national prefix is not required.
  if (number.getCountryCodeSource() != CountryCodeSource.FROM_DEFAULT_COUNTRY)
  {
    return true
  }

  String phoneNumberRegion =
      util.getRegionCodeForCountryCode(number.getCountryCode())

  PhoneMetadata metadata = util.getMetadataForRegion(phoneNumberRegion)
  if (metadata == null)
  {
    return true
  }

  // Check if a national prefix should be present when formatting this number.
  String nationalNumber = util.getNationalSignificantNumber(number)
  NumberFormat formatRule =
      util.chooseFormattingPatternForNumber(metadata.numberFormats(), nationalNumber)

  // To do this, we check that a national prefix formatting rule was present and that it wasn't
  // just the first-group symbol ($1) with punctuation.
  if ((formatRule != null) && formatRule.getNationalPrefixFormattingRule().length() > 0)
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
    String rawInputCopy = PhoneNumberUtil.normalizeDigitsOnly(number.getRawInput())
    StringBuilder rawInput = new StringBuilder(rawInputCopy)

    // Check if we found a national prefix and/or carrier code at the start of the raw input, and
    // return the result.
    return util.maybeStripNationalPrefixAndCarrierCode(rawInput, metadata, null)
  }

  return true
}
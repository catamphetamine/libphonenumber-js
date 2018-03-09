/**
 * The immutable match of a phone number within a piece of text. Matches may be found using
 * {@link PhoneNumberUtil#findNumbers}.
 *
 * <p>A match consists of the {@linkplain #number() phone number} as well as the
 * {@linkplain #start() start} and {@linkplain #end() end} offsets of the corresponding subsequence
 * of the searched text. Use {@link #rawString()} to obtain a copy of the matched subsequence.
 *
 * <p>The following annotated example clarifies the relationship between the searched text, the
 * match offsets, and the parsed number:
 * <pre>
 * CharSequence text = "Call me at +1 425 882-8080 for details.";
 * String country = "US";
 * PhoneNumberUtil util = PhoneNumberUtil.getInstance();
 *
 * // Find the first phone number match:
 * PhoneNumberMatch m = util.findNumbers(text, country).iterator().next();
 *
 * // rawString() contains the phone number as it appears in the text.
 * "+1 425 882-8080".equals(m.rawString());
 *
 * // start() and end() define the range of the matched subsequence.
 * CharSequence subsequence = text.subSequence(m.start(), m.end());
 * "+1 425 882-8080".contentEquals(subsequence);
 *
 * // number() returns the the same result as PhoneNumberUtil.{@link PhoneNumberUtil#parse parse()}
 * // invoked on rawString().
 * util.parse(m.rawString(), country).equals(m.number());
 * </pre>
 */
export default class PhoneNumberMatch
{
  /**
   * Creates a new match.
   *
   * @param start  the start index into the target text
   * @param rawString  the matched substring of the target text
   * @param number  the matched phone number
   */
  constructor(int start, String rawString, PhoneNumber number)
  {
    if (start < 0)
    {
      throw new IllegalArgumentException("Start index must be >= 0.")
    }

    if (rawString == null || number == null)
    {
      throw new NullPointerException()
    }

    /** Returns the start index of the matched phone number within the searched text. */
    this.start = start

    /** Returns the exclusive end index of the matched phone number within the searched text. */
    this.end = start + rawString.length

    /** Returns the raw string matched as a phone number in the searched text. */
    this.rawString = rawString

    /** Returns the phone number matched by the receiver. */
    this.number = number
  }

  equals(other)
  {
    if (this === other)
    {
      return true
    }
    if (!(other instanceof PhoneNumberMatch))
    {
      return false
    }
    return rawString === other.rawString &&
        start === other.start &&
        number === other.number
  }

  toString()
  {
    return "PhoneNumberMatch [" + this.start + "," + this.end + ") " + this.rawString
  }
}
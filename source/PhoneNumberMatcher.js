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

import format from './format'

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
const _pL = '\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC'
const pL = `[${_pL}]`
const pL_regexp = new RegExp(pL)
const _pN = '\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19'
const pN = `[${_pN}]`
const _pNd = '\u0030-\u0039\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19'
const pNd = `[${_pNd}]`
const _pSc = '\u0024\u00A2-\u00A5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20B9\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6'
const pSc = `[${_pSc}]`
const pSc_regexp = new RegExp(pSc)
const _pMn = '\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1DC0-\u1DE6\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26'
const pMn = `[${_pMn}]`
const pMn_regexp = new RegExp(pMn)

const _InBasic_Latin = '\u0000-\u007F'
const _InLatin_1_Supplement = '\u0080-\u00FF'
const _InLatin_Extended_A = '\u0100-\u017F'
const _InLatin_Extended_Additional = '\u1E00-\u1EFF'
const _InLatin_Extended_B = '\u0180-\u024F'
const _InCombining_Diacritical_Marks = '\u0300-\u036F'

const latin_letter_regexp = new RegExp
(
	'[' +
	_InBasic_Latin +
	_InLatin_1_Supplement +
	_InLatin_Extended_A +
	_InLatin_Extended_Additional +
	_InLatin_Extended_B +
	_InCombining_Diacritical_Marks +
	']'
)

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
const MATCHING_BRACKETS_ENTIRE = new RegExp
(
	'^'

	+ "(?:[" + openingParens + "])?" + "(?:" + nonParens + "+" + "[" + closingParens + "])?"
	+ nonParens + "+"
	+ "(?:[" + openingParens + "]" + nonParens + "+[" + closingParens + "])" + bracketPairLimit
	+ nonParens + "*"

	+ '$'
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
const LEAD_CLASS_LEADING = new RegExp('^' + leadClass)

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
		const candidateString = candidate.toString()

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
			if (TIME_STAMPS_SUFFIX_LEADING.test(followingText))
			{
				return
			}
		}

		// Try to come up with a valid match given the entire candidate.
		const match = this.parseAndVerify(candidate, offset)

		if (match != null)
		{
			return match
		}

		// If that failed, try to find an "inner match" - there might be a phone number within this
		// candidate.
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
   * Parses a phone number from the {@code candidate} using {@link PhoneNumberUtil#parse} and
   * verifies it matches the requested {@link #leniency}. If parsing and verification succeed, a
   * corresponding {@link PhoneNumberMatch} is returned, otherwise this method returns null.
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
      if (!MATCHING_BRACKETS_ENTIRE.test(candidate) || PUB_PAGES.test(candidate))
      {
        return
      }

      // If leniency is set to VALID or stricter, we also want to skip numbers that are surrounded
      // by Latin alphabetic characters, to skip cases like abc8005001234 or 8005001234def.
      if (this.leniency !== Leniency.POSSIBLE)
      {
        // If the candidate is not at the start of the text, and does not start with phone-number
        // punctuation, check the previous character.
        if (offset > 0 && !LEAD_CLASS_LEADING.test(candidate))
        {
          const previousChar = this.text[offset - 1]
          // We return null if it is a latin letter or an invalid punctuation symbol.
          if (isInvalidPunctuationSymbol(previousChar) || isLatinLetter(previousChar))
          {
            return
          }
        }

        const lastCharIndex = offset + candidate.length
        if (lastCharIndex < this.text.length)
        {
          const nextChar = this.text[lastCharIndex]
          if (isInvalidPunctuationSymbol(nextChar) || isLatinLetter(nextChar))
          {
            return
          }
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
        	endsAt   : offset + candidate.length
        	raw      : candidate,
        	number
        }
      }
    }
    catch (NumberParseException error)
    {
      // ignore and continue
    }
  }

  hasNext()
  {
    if (this.state == 'NOT_READY')
    {
      const lastMatch = find(this.searchIndex)

      if (lastMatch)
      {
        this.searchIndex = lastMatch.end()
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
      throw new NoSuchElementException()
    }

    // Don't retain that memory any longer than necessary.
    const result = lastMatch
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
  if (!pL_regexp.test(letter) && !pMn_regexp.test(letter))
  {
    return false
  }

	return latin_letter_regexp.test(letter)
}

/**
 * Small helper interface such that the number groups can be checked according to different
 * criteria, both for our default way of performing formatting and for any alternate formats we
 * may want to check.
 */
interface NumberGroupingChecker
{
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
  boolean checkGroups
  (
  	util,
  	number,
    normalizedCandidate,
    expectedNumberGroups
  )
}

function allNumberGroupsRemainGrouped
(
	util,
  number,
  normalizedCandidate,
  formattedNumberGroups
)
{
  int fromIndex = 0
  if (number.getCountryCodeSource() != CountryCodeSource.FROM_DEFAULT_COUNTRY)
  {
    // First skip the country code if the normalized candidate contained it.
    String countryCode = Integer.toString(number.getCountryCode());
    fromIndex = normalizedCandidate.indexOf(countryCode) + countryCode.length();
  }

  // Check each group of consecutive digits are not broken into separate groupings in the
  // {@code normalizedCandidate} string.
  for (int i = 0; i < formattedNumberGroups.length; i++)
  {
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
        return starts_with
        (
        	normalizedCandidate.slice(fromIndex - formattedNumberGroups[i].length)
          nationalSignificantNumber
        )
      }
    }
  }

  // The check here makes sure that we haven't mistakenly already used the extension to
  // match the last group of the subscriber number. Note the extension cannot have
  // formatting in-between digits.
  return normalizedCandidate.substring(fromIndex).contains(number.getExtension());
}

function allNumberGroupsAreExactlyPresent
(
	util,
	number,
	normalizedCandidate,
	formattedNumberGroups
)
{
  const candidateGroups = normalizedCandidate.split(NON_DIGITS_PATTERN)

  // Set this to the last group, skipping it if the number has an extension.
  const candidateNumberGroupIndex =
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
  for (int formattedNumberGroupIndex = (formattedNumberGroups.length - 1);
       formattedNumberGroupIndex > 0 && candidateNumberGroupIndex >= 0;
       formattedNumberGroupIndex--, candidateNumberGroupIndex--)
  {
    if (candidateGroups[candidateNumberGroupIndex] !== formattedNumberGroups[formattedNumberGroupIndex])
    {
      return false
    }
  }

  // Now check the first group. There may be a national prefix at the start, so we only check
  // that the candidate group ends with the formatted number group.
  return (candidateNumberGroupIndex >= 0
      && ends_with(candidateGroups[candidateNumberGroupIndex], formattedNumberGroups[0]))
}

/**
 * Helper method to get the national-number part of a number, formatted without any national
 * prefix, and return it as a set of digit blocks that would be formatted together.
 */
function getNationalNumberGroups
(
	PhoneNumberUtil util,
	PhoneNumber number,
	NumberFormat formattingPattern,
	metadata
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
  const rfc3966Format = format(number, 'RFC3966', metadata)

  // We remove the extension part from the formatted string before splitting it into different
  // groups.
  const endIndex = rfc3966Format.indexOf(';')
  if (endIndex < 0)
  {
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
  util,
  checker
)
{
  // TODO: Evaluate how this works for other locales (testing has been limited to NANPA regions)
  // and optimise if necessary.
  const normalizedCandidate =
      PhoneNumberUtil.normalizeDigits(candidate, true /* keep non-digits */)
  let formattedNumberGroups = getNationalNumberGroups(util, number, null)
  if (checker.checkGroups(util, number, normalizedCandidate, formattedNumberGroups))
  {
    return true
  }

  // If this didn't pass, see if there are any alternate formats, and try them instead.
  PhoneMetadata alternateFormats =
      MetadataManager.getAlternateFormatsForCountry(number.getCountryCode())

  if (alternateFormats)
  {
    for (const alternateFormat of alternateFormats.numberFormats())
    {
      formattedNumberGroups = getNationalNumberGroups(util, number, alternateFormat)

      if (checker.checkGroups(util, number, normalizedCandidate, formattedNumberGroups))
      {
        return true
      }
    }
  }

  return false
}

function containsMoreThanOneSlashInNationalNumber(number, candidate)
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
          === Integer.toString(number.getCountryCode()))
  {
    // Any more slashes and this is illegal.
    return candidate.slice(secondSlashInBodyIndex + 1).indexOf('/') >= 0
  }

  return true
}

function containsOnlyValidXChars(PhoneNumber number, String candidate, PhoneNumberUtil util)
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

function isNationalPrefixPresentIfRequired(PhoneNumber number, PhoneNumberUtil util)
{
  // First, check how we deduced the country code. If it was written in international format, then
  // the national prefix is not required.
  if (number.getCountryCodeSource() != 'FROM_DEFAULT_COUNTRY')
  {
    return true
  }

  const phoneNumberRegion = util.getRegionCodeForCountryCode(number.getCountryCode())

  PhoneMetadata metadata = util.getMetadataForRegion(phoneNumberRegion)
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

export function starts_with(string, substring)
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

export function ends_with(string, substring)
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

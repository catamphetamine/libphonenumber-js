// https://stackoverflow.com/a/46971044/970769
export default class ParseError {
  constructor(code) {
    this.name = this.constructor.name
    this.message = code
    this.stack = (new Error(code)).stack
  }
}

ParseError.prototype = Object.create(Error.prototype)
ParseError.prototype.constructor = ParseError
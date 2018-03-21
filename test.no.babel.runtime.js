var AsYouType = require('./index.common').AsYouType
var parse     = require('./index.common').parse
var format    = require('./index.common').format

console.log(parse('8 (800) 555 35 35', 'RU'))
// { country: 'RU', phone: '8005553535' }

console.log(format('2133734253', 'US', 'International'))
// '+1 213 373 4253'

console.log(new AsYouType().input('+12133734'))
// '+1 213 373 4'
console.log(new AsYouType('US').input('2133734'))
// '(213) 373-4'
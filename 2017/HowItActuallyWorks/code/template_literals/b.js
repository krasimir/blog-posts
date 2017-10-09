var _templateObject = _taggedTemplateLiteral(['Hello ', ',\nHow are you?'], ['Hello ', ',\\nHow are you?']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var censor = function censor(strings, name) {
  return strings[0] + name.charAt(0) + '...' + strings[1];
};
var greeting = function greeting(name, salary) {
  return censor(_templateObject, name);
};
console.clear();
console.log(greeting('John Smith', 6000));
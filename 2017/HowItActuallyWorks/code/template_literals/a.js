const censor = function (strings, name) {
  return strings[0] + name.charAt(0) + '...' + strings[1];
}
const greeting = function(name, salary) {
  return censor`Hello ${ name },\nHow are you?`;
}
console.clear();
console.log(greeting('John Smith', 6000));
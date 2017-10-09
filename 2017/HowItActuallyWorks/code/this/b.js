var Person = function Person(firstName, lastName, sex) {
  var _this = this;

  var generateFullName = function generateFullName() {
    return (sex === 'm' ? 'Mr. ' : 'Ms. ') + _this.firstName + ' ' + _this.lastName;
  };

  this.firstName = firstName;
  this.lastName = lastName;
  this.fullName = generateFullName();
};

var user = new Person('John', 'Smith');
console.log(user);
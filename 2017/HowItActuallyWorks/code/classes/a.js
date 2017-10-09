class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
  fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

class User extends Person {
  greeting() {
    console.log('Hello, ' + this.fullName());
  }
}

var user = new User('John', 'Smith');

user.greeting();
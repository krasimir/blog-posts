const Person = function (firstName, lastName, sex) {
  const generateFullName = () => {
    return (sex === 'm' ? 'Mr. ' : 'Ms. ') +
      this.firstName + ' ' + this.lastName;
  }

  this.firstName = firstName;
  this.lastName = lastName;
  this.fullName = generateFullName();
}

const user = new Person('John', 'Smith');
console.log(user);
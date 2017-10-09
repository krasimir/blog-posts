function printData({ data }) {
  const { name, properties } = data;
  const [ age ] = properties;
  
  console.log(name + ', age: ' + age);
}

printData({
  data: {
    name: 'John',
    properties: [34, 180, 90]
  }
});
var Counter = function (text) {
  this.text = text;
  this.data = {
    words: 1,
    letters: 0
  }
};
Counter.prototype = {
  count: function () {
    debugger; // <---- breakpoint
    for (var i=0; i < this.text.length; i++) {
      if (this.text.charAt(i) === ' ') {
        ++this.data.words;
      } else {
        ++this.data.letters;
      }
    }
    return this;
  },
  print: function () {
    console.log('Words: ' + this.data.words);
    console.log('Letters: ' + this.data.letters);
  }
};

(new Counter('Debugging in Node')).count().print();
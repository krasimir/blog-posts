import Component from '../src/Component.jsx';
import TestUtils from 'react-addons-test-utils';
import React from 'react';

var component;

describe('Given an instance of the Component', function () {
  describe('when we change the value', function () {
    before(() => {
      component = TestUtils.renderIntoDocument(<Component />);
    });
    it('should render uppercase version of the typed string', function (done) {
      var input = TestUtils.findRenderedDOMComponentWithClass(component, 'qa-input');
      var h1 = TestUtils.findRenderedDOMComponentWithTag(component, 'h1');
      var VALUE = 'testing';
      var EXPECTED = VALUE.toUpperCase();

      input.value = VALUE;
      TestUtils.Simulate.change(input);

      expect(h1.innerHTML).to.be.equal(EXPECTED);
      done();
    });
  });
});

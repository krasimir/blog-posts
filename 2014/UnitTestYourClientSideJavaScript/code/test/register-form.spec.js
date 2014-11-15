var assert = require('assert');

suite('Register form', function() {

  test('validations', function(done) {
    this.timeout(5000);

    var jsdom = require("jsdom");
    jsdom.env({
      html: '<html ng-app="app"><body><div ng-controller="Controller"><register-form></register-form></div></body></html>',
      scripts: [
        __dirname + '/../vendor/angular.min.js',
        __dirname + '/../js/register-form.js'
      ],
      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
      },
      done: function(errors, window) {
        if(errors != null) console.log('Errors', errors);

        var $ = function(selector) {
          return window.document.querySelector(selector);
        }

        var trigger = function(el, ev) {
          var e = window.document.createEvent('UIEvents');
          e.initEvent(ev, true, true);
          el.dispatchEvent(e);
        }

        var Controller = function($scope) {
          var runTests = function() {

            var register = $('#register-button');
            var message = $('#message');
            var username = $('#username');
            var password = $('#password');

            register.click();
            assert.equal(message.innerHTML, 'Missing username.');

            username.value = 'test';
            trigger(username, 'change');
            register.click();
            assert.equal(message.innerHTML, 'Missing password.');

            password.value = 'test';
            trigger(password, 'change');
            register.click();
            assert.equal(message.innerHTML, 'Too short username.');

            username.value = 'testtesttesttest';
            trigger(username, 'change');
            register.click();
            assert.equal(message.innerHTML, 'Too short password.');

            password.value = 'testtesttesttest';
            trigger(password, 'change');
            register.click();
            assert.equal(message.innerHTML, '');

            done();

          };
          setTimeout(runTests, 1000);
        }

        window
          .angular
          .module('app', [])
          .controller('Controller', Controller)
          .directive('registerForm', window.registerFormDirective);

      }
    });

  });

});
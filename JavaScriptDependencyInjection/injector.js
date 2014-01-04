var injector = {
    dependencies: {},
    register: function(key, value) {
        this.dependencies[key] = value;
    },
    resolve: function() {
        var func, deps, scope, args = [], self = this;
        if(typeof arguments[0] === 'string') {
            func = arguments[1];
            deps = arguments[0].replace(/ /g, '').split(',');
            scope = arguments[2] || {};
        } else {
            func = arguments[0];
            deps = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
            scope = arguments[1] || {};
        }
        return function() {
            var a = Array.prototype.slice.call(arguments, 0);
            for(var i=0; i<deps.length; i++) {
                var d = deps[i];
                args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());
            }
            func.apply(scope || {}, args);
        }        
    }
}
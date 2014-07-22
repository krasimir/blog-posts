# Managing events in JavaScript

I just noticed that the most popular repository in my GitHub account is [EventBus](https://github.com/krasimir/EventBus). There is already an [article](http://krasimirtsonev.com/blog/article/javascript-managing-events-dispatch-listen) about it, but it's a little bit outdated. I needed to clarify few things, so here is a new one.

The events in JavaScript are widely use. In most of the cases that's how your user interface works. You attach events to different elements and do something once the user interact with them. 

	var button = document.getElementById("save-button");
	button.addEventListener("click", function(event) {
		// do something
	});

Of course this is not the only use case. You usually use events to build the application flow. I.e. the communications between the different objects. Here is an example of such process (it's a pseudo code).

	var Model = function() {
        var save = function(callback) { };
        var dispatch = function(event) { };
        return {
            update: function() {
                save(function() {
                    dispatch("update")
                })
            }
            on: function(event, callback) { 
                // adding listeners
            }
        }
    }
    var View = function() {
        return {
            render: function() { }
        }
    }
    var ControllerA = function() {
        var model = Model();
        var view = View();
        model.on("update", function() {
            view.render();
        });
    }
    var Application = function() {
        var controller = ControllerA();
    }

You have a simple Model-View-Controller application. The main class called *Application* initialize the controller. There are model and view and once the model updates its data the view is rendered. In this case the the controller is directly connected to the model and is able to listen for its events. So far so good. The app works, but at some point we need to create another controller, which also needs the same model. There are few variants. We may add the model to the controller's API.

	var ControllerA = function() {
        var model = Model();
        var view = View();
        model.on("update", function() {
            view.render();
        });
        return {
            model: model
        }
    }

That's not really flexible, because then any other object which requires the model will need an access to the controller. I think that the better approach here is to extract the model initialization and pass it as an argument.

    var ControllerA = function(model) {
        var view = View();
        model.on("update", function() {
            view.render();
        });
    }
    var Application = function() {
    	var model = Model();
        var controllerA = ControllerA(model);
        var controllerB = ControllerB(model);
        var controllerC = ControllerC(model);
    }

So, the problem is partly solved. Now we are able to use same model for all the controllers. But what will happen if we have ten different models. Passing ten arguments or an object with ten properties is not very elegant. There is also another issue. What if we need know about the model's updating somewhere else. For example, in a helper class initialized inside our view (yes, I know that it sounds strange). Sooner or later you will notice that the same object is passed from one class to another. To avoid this you may decide to create a global singleton class or something like that. However, for such cases I'll suggest to try the [EventBus](https://github.com/krasimir/EventBus).

![Event Bus](http://krasimirtsonev.com/blog/articles/EventBus/eventbus.jpg)

The main purpose of this little library is to give you a bus, between your objects. You attach a listener to that bus and at some point dispatch an event there. Every object, which waits for that event is notified. So, our example could be transformed to the following code:

	var Model = function() {
        var save = function() { };
        return {
            store: function() {  
                save(function() {
                    EventBus.dispatch("update");
                })
            }
        }
    }
    var View = function() {
        return {
            render: function() { }
        }
    }
    var Controller = function() {
        var view = View();
        EventBus.addEventListener("update", function() {
            view.render();
        });
    }
    var Application = function() {
        var model = Model();
        var controller = Controller();
    }

I.e. the model is not passed to the controller or any other class. Actually, the controller for example doesn't care about the model. It only needs to know when it is updated. So, the EventBus gives this information. We still control the processes and we still have our classes decoupled. Here is the full API:

	// adds event listener
	// @type - string
	// @callback - function
	// @scope - the scope where the @callback is defined
	EventBus.addEventListener(type, callback, scope)

	// removes event listener
	// @type - string
	// @callback - function
	// @scope - the scope where the @callback is defined
	EventBus.removeEventListener(type, callback, scope)

	// checks for listener
	// @type - string
	// @callback - function
	// @scope - the scope where the @callback is defined
	EventBus.hasEventListener(type, callback, scope)

	// dispatch an event
	// @type - string
	// @target - the caller
	// @args - pass as many arguments as you want
	EventBus.dispatch(type, target, args ...)

	// for debugging purpose, it just prints out the added listeners
	EventBus.getEvents()

---

Of course such approach is not always appropriate. It has its cons as any other solution available.

  - the EventBus class is a global object (singleton)
  - sometimes it is difficult to find out where the event is coming from, because there is no direct connection object &lt;-&gt; observer

--- 

[Download EventBus class](https://github.com/krasimir/EventBus)
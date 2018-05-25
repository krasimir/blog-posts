# Implementing an async queue in 23 lines of code

Recently we had an interesting task at [work](https://www.antidote.me/). The user makes a selection of items and clicks a button. Then for every selected item we have to make a request to our API. The thing is that the user may click as many items as he/she wants. In order to speed up the process up we decided to handle four requests in parallel and once some of them is finished we pull the next one. If you ask why exactly four requests in parallel read this [paper](http://sgdev-blog.blogspot.bg/2014/01/maximum-concurrent-connection-to-same.html).

Implementation wise we need a queue that is able to cache the requests and process maximum of four at the same time.

Let's start by defining the signature of our queue and put a couple of rules in place:

* A task will be a function that if called returns a promise. Once that promise is resolved or rejected we consider the task done.
* The queue accepts an array of tasks and the maximum number of parallel requests in the format of a number.
* The queue returns a single promise which is resolved with an array containing the results of all the tasks. This means that the number of the items in the returned array should be equal to the number of the tasks.

```js
function createQueue(tasks, maxNumOfWorkers = 4) {
  return new Promise(done => {
    // magic goes here
  });
}

createQueue([task1, task2]).then(results => {
  // results[0] -> result of task1
  // results[1] -> result of task2
});
```

Let's first start by processing just two tasks in a consecutive fashion. We pass two functions, we run the first one and when it finishes we deal with the second one.

```js
function createQueue(tasks, maxNumOfWorkers = 4) {
  var taskIndex = 0;

  return new Promise(done => {
    const getNextTask = () => {
      if (taskIndex < tasks.length) {
        tasks[taskIndex]()
          .then(
            result => {
              tasks[taskIndex] = result;
              taskIndex++;
              getNextTask();
            }
          ).catch(
            error => {
              tasks[taskIndex] = error;
              taskIndex++;
              getNextTask();
            }
          );
      } else {
        done(tasks);
      }
    };
    getNextTask();
  });
}
```

Our `createQueue` returns a promise. Inside we define a helper function `getNextTask` the role of which is to execute a task and wait for its completion. To implement the recursion we need also a helper variable `taskIndex` which is keeping track of the currently running task. Once the task is finished we update the corresponding index in the incoming `tasks` array directly. There are two caveats that we have to mention here:

* The function as it is now mutates the incoming array. Or in other words it is not a pure function. In general that is considered a bad practice. However, so far my use cases of the final implementation is always by creating an array on the fly so that is fine to me.
* No matter what happens with the promises we save the result. So, in theory `createQueue` can not throw an error. The error handling happens by checking the resulted array at the end of the process.

In the version above we have a duplication. The anonymous function that we pass to `then` and `catch` may be exported to another helper `handleResult`.

```js
function createQueue(tasks, maxNumOfWorkers = 4) {
  var taskIndex = 0;

  return new Promise(done => {
    const handleResult = index => result => {
      tasks[index] = result;
      taskIndex++;
      getNextTask();
    };
    const getNextTask = () => {
      if (taskIndex < tasks.length) {
        tasks[taskIndex]().then(handleResult(taskIndex)).catch(handleResult(taskIndex));
      } else {
        done(tasks);
      }
    };
    getNextTask();
  });
}
```

Now, let's parallelize the process. We need to run those tasks above in parallel which means that we shouldn't wait for a task to complete and call `getNextTask`. We have to run the function, get the promise and move forward. We will introduce a new variable `numOfWorkers` which will go up once we run a task and then goes down when the task is finished. And we should make sure that we don't go beyond the limit.

```js
function createQueue(tasks, maxNumOfWorkers = 4) {
  var numOfWorkers = 0;
  var taskIndex = 0;

  return new Promise(done => {
    const handleResult = index => result => {
      tasks[index] = result;
      numOfWorkers--;
      getNextTask();
    };
    const getNextTask = () => {
      if (numOfWorkers < maxNumOfWorkers && taskIndex < tasks.length) {
        tasks[taskIndex]().then(handleResult(taskIndex)).catch(handleResult(taskIndex));
        taskIndex++;
        numOfWorkers++;
        getNextTask();
      } else if (numOfWorkers === 0 && taskIndex === tasks.length) {
        done(tasks);
      }
    };
    getNextTask();
  });
}
```

Notice how we call `getNextTask` just after we run the task with `tasks[taskIndex]()`. This means that we are not waiting to see the promise resolved or rejected. We just process the next one. What limits the workers is the first `if` statement. The whole exercise ends when there are no running workers and there are no more tasks to process.

Here is a CodePen to play with [https://codepen.io/krasimir/pen/mLebqj](https://codepen.io/krasimir/pen/mLebqj). That CodePen runs ten tasks and if you check the output in the console you will see how the function works. There is only one `console.log` in the beginning of `getNextTask`'s body which prints the current number of the working workers :) Here is the result:

```
getNextTask numOfWorkers=0
getNextTask numOfWorkers=1
getNextTask numOfWorkers=2
getNextTask numOfWorkers=3
getNextTask numOfWorkers=4
getNextTask numOfWorkers=3
getNextTask numOfWorkers=4
getNextTask numOfWorkers=3
getNextTask numOfWorkers=4
getNextTask numOfWorkers=3
getNextTask numOfWorkers=4
getNextTask numOfWorkers=3
getNextTask numOfWorkers=4
getNextTask numOfWorkers=3
getNextTask numOfWorkers=2
getNextTask numOfWorkers=1
getNextTask numOfWorkers=0
(8) [100, 2, Error: sorry
    at Array.<anonymous> (pen.js:35:42)
    at getNextTask (pen.js:21:25)
    at getNex…, 50, 10, 1000, 20, 40]
```


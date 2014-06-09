## KnockoutJs.SignalR

### Library that merges KnockoutJs and SignalR
The idea for this project is to be able to use SignalR in combination with KnockoutJs as one library.

### Features
* Broadcast for push and destroy observableArray methods.

### Implemented Features
```JavaScript

  // The Remote Observable Array to sincronize operations.
  // (e.g. push, destroy)
  self.tasks = ko.observableArrayRemote([]);

  // Because the objs on the server and the client won't match we need a map function.
  // This will be called when the client receives a push call from the server.
  // Change the function that maps an obj received from the server.
  self.tasks.mapFromServer = function (obj) {
    return new Task(obj);
  };

```

Without any extra code push will be broadcasted via SingalR.
```Javascript
  self.addTask = function () {
    self.tasks.push(new Task({ Title: this.newTaskText() }));
    self.newTaskText("");
  };
```

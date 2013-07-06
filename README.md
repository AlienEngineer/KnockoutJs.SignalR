## KnockoutJs.SignalR

### Library that merges KnockoutJs and SignalR
The idea for this project is to be able to use SignalR in combination with KnockoutJs as one library.

* Random ideas:
 * The ViewMovel should have a Hub ( Maybe the hub name should be equal to the ViewModels name) (Done)
 * applyBindings could Start the hub connection. (Done)
 * It would be nice to create a sincronizer for the ObservableArray object. (Implementing)
 * The ViewModel can have field "client" that will be used by the server side.

### Implemented Features
```JavaScript

  // The Remote Observable Array to sincronize operations.
  // (e.g. push)
  self.tasks = ko.observableArrayRemote([]);

```

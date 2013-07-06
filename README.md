## KnockoutJs.SignalR

### Library that merges KnockoutJs and SignalR
The idea for this project is to be able to use SignalR in combination with KnockoutJs as one library.

* Random ideas:
 * The ViewMovel should have a Hub ( Maybe the hub name should be equal to the ViewModels name)
 * applyBindings could Start the hub connection. (is this ok?!)
 * It would be nice to create a sincronizer for the ObservableArray object.
 * The ViewModel can have field "client" that will be used by the server side.

### Features
* observableArrayRemote
 * Push -> pushs on all clients.

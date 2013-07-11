(function ($, ko) {
    
    "use strict";

    if (typeof ($) !== "function") {
        // no jQuery!
        throw new Error("KnockoutJS.SignalR: jQuery not found. Please ensure jQuery is referenced before the knockout.SignalR.js file.");
    }

    if (typeof (ko) !== "object") {
        // no KnockoutJs!
        throw new Error("KnockoutJS.SignalR: KnockoutJs not found. Please ensure KnockoutJs is referenced before the knockout.SignalR.js file.");
    }

    var utils = {
        firstLetterToLowerCase: function (str) {
            return str[0].toLowerCase() + str.slice(1);
        },
        firstLetterToUpperCase: function (str) {
            return str[0].toUpperCase() + str.slice(1);
        },
        // Creates an object with capitablized initials. To match object on the server hub side.
        capitalizeObj: function (obj) {
            var result = { };
            for (var field in obj) {
                result[utils.firstLetterToUpperCase(field)] = utils.getValue(obj[field]);
            }
            return result;
        },
        forEachRemoteMember : function (obj, func) {
            for (var fieldName in obj) {
                var field = obj[fieldName];
                if (ko.isObservable(field) && field.isRemote) {
                    func.apply(field);
                }
            }
        },
        // Compares two objects field values.
        compareObj: function (obj1, obj2) {
            for (var field in obj1) {
                var value1 = obj1[field];
                var value2 = obj2[field];

                if (utils.getValue(value1) !== utils.getValue(value2)) {
                    return false;
                }
            }
            return true;
        },
        // Sincronizes target with data.
        syncObj: function (target, data) {
            for (var field in target) {
                var field1 = target[field];
                var field2 = utils.getValue( data[utils.firstLetterToUpperCase(field)]);

                if (utils.getValue(field1) !== field2) {
                    if (typeof field1 === "function") {
                        field1(field2);
                    }
                    else {
                        target[field] = field2;
                    }
                }
            }
        },
        // Gets the primitive value of argument. In case of a function.
        getValue: function(val) {
            if (typeof val === "function") {
                return val();
            }
            return val;
        }
    };

    var applyBindings = ko.applyBindings;

    //
    // Creates an observable that will send remote requests for array operations.
    // (e.g. push, destroy)
    //
    ko.observableArrayRemote = function(array) {

        var observable = ko.observableArray(array);
        var push = observable.push;
        var destroy = observable.destroy;

        observable.mapFromServer = function (obj) {
            return obj;
        };

        observable.compare = function(obj1, obj2) {

            for (var fieldName in obj1) {
                if (obj1[fieldName] !== obj2[fieldName]) {
                    return false;
                }
            }
            
            return true;
        };

        observable.subscribe(function() {
            console.log('array has changed!');
        });
        
        observable.push = function (obj, localOnly) {
            
            // prepares the received obj
            prepareElement(obj, observable);

            console.log('push');
            // push the value to the array.
            push.apply(this, [obj]);
            
            if (localOnly) {
                return;
            }
            
            // request the server to add
            // TODO: handle fails onAdd
            this.viewModel.server.add(utils.capitalizeObj(obj))
                .done(function (data) {
                    utils.syncObj(obj, data);
                })
                .fail(function () {
                    destroy.apply(observable, [obj]);
                });
        };
        
        observable.destroy = function (obj, localOnly) {
            console.log('destroy');
            // destroy the value from the array
            destroy.apply(this, [function (value) {

                return utils.compareObj(obj, value);

            }]);
            
            if (localOnly) {
                return;
            }
            
            // request the server to remove
            // TODO: handle fails onRemove
            this.viewModel.server.remove(utils.capitalizeObj(obj))
                .fail(function () {
                    push.apply(observable, [obj]);
                });
        };

        // just to find this instance easier.
        observable.isRemote = true;

        return observable;
    };

    //
    // Creates an observable that will send update requests for a single field.
    //
    ko.observableRemote = function(value, fieldName) {

        var observable = ko.observable(value);

        var timeoutId;
        var lastValue = value;

        observable.subscribe(function (newValue) {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(function () {
                if (lastValue === newValue) {
                    return;
                }
                var self = observable;

                var viewModel = self.owner.observableArray.viewModel;

                // requests the update change on the server.
                // capitalizes the object fields and fieldName
                viewModel.server.update(
                    utils.capitalizeObj(self.owner),
                    utils.firstLetterToUpperCase(fieldName)
                );

                lastValue = newValue;
                
            }, 50);
            
        });
        
        observable.isRemote = true;

        return observable;
    };

    //
    // Wrapper for applyBindings method.
    //
    ko.applyBindings = function (viewModel, rootNode) {

        applyBindings(viewModel, rootNode);
        
        // Affects the viewmodel with the hub.
        var initiated = initializeViewModel(viewModel);
        
        if (initiated) {
            return {
                applyRemoteOperations: function(initFunc) {
                    initFunc(viewModel);
                }
            };
        }
        
        return null;
    };

    //
    // Appends functions to the view model client hub.
    // Populates the array with server objects.
    //
    var initializeRemoteObservableArray = function (observable) {

        var client = observable.viewModel.client;

        // adds the push function
        client.push = function (obj) {

            // prepares the received obj
            prepareElement(obj, observable);
            
            observable.push(
                observable.mapFromServer(obj), /* the value to be pushed */
                true /* localOnly */
            );
        };

        // adds the destroy function
        client.destroy = function(obj) {
            observable.destroy(
                observable.mapFromServer(obj), /* the value to be pushed */
                true /* localOnly */
            );
        };

        client.update = function(obj, fieldName) {

            obj = observable.mapFromServer(obj);
            fieldName = utils.firstLetterToLowerCase(fieldName);

            prepareElement(obj, observable);

            var arr = observable();
            
            for (var i = 0; i < arr.length; ++i) {
                
                if (observable.compare(obj, arr[i])) {

                    // Todo: this is calling the subscriber.. Add some state variable...
                    
                    arr[i][fieldName](
                        obj[fieldName]()
                    );
                    return;
                }

            }

        };

        // When the connection state is good load the values into the array.
        // $.connection.hub.start().done(...) is beeing called before the state is connected.
        $.connection.hub.stateChanged(function () {
            if ($.connection.connectionState.connected !== $.connection.hub.state) {
                return;
            }
            
            observable.viewModel.server.getAll().done(function (values) {
                var mappedValues = $.map(values, function (item) { return observable.mapFromServer(item); });

                $(mappedValues).each(function () {

                    prepareElement(this, observable);

                });
                
                observable(mappedValues);
            });
            
        });
        
    };

    var prepareElement = function(elem, remoteArray) {
        var self = elem;

        // keep a ref for the array this element is on.
        self.observableArray = remoteArray;

        utils.forEachRemoteMember(self, function () {
            // keep a ref of the obj this field belongs to.
            this.owner = self;
        });
    };

    // Affects the viewmodel with the hub.
    // Starts the connection.
    var initializeViewModel = function(viewModel) {
        var name = viewModel.constructor['name'];

        if (name === undefined || name.length == 0) {
            return false;
        }
        name = name[0].toLowerCase() + name.slice(1);

        var hub = viewModel.hub = $.connection[name];

        viewModel.client = hub.client;
        viewModel.server = hub.server;
        $.connection.hub.start();

        // Sets the ViewModel to the remote observable
        utils.forEachRemoteMember(viewModel, function() {
            this.viewModel = viewModel;
            initializeRemoteObservableArray(this);
        });
        
        // Allows the users to initialize the ViewModel remote methods with a init function
        // Another way is to call the applyRemoteOperations on the returned object by applyBindings
        if (typeof (viewModel.init) === "function") {
            viewModel.init();
        }

        
        return true;
    };

}(window.jQuery, window.ko));

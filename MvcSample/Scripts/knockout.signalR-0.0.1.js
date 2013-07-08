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

        observable.subscribe(function() {
            console.log('array has changed!');
        });
        
        observable.push = function (obj, localOnly) {
            console.log('push');
            push.apply(this, [obj]);
            
            if (localOnly) {
                return;
            }
            
            this.viewModel.server.add(utils.capitalizeObj(obj))
                .done(function (data) {
                    utils.syncObj(obj, data);
                });
        };
        
        observable.destroy = function (obj, localOnly) {
            console.log('destroy');
            destroy.apply(this, [function (value) {

                return utils.compareObj(obj, value);

            }]);
            
            if (localOnly) {
                return;
            }
            
            this.viewModel.server.remove(utils.capitalizeObj(obj));
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

                
                console.log("The field [" + fieldName + "] value changed to : " + newValue);

                lastValue = newValue;
                
            }, 500);
            
        });
        
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
        client.push = function(obj) {
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

        // Initializes the array with the server values.
        observable.viewModel.server.getAll().done(function (values) {
            
            var mappedValues = $.map(values, function (item) { return observable.mapFromServer(item); });

            observable(mappedValues);
            
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
        for (var field in viewModel) {
            var obj = viewModel[field];
            if (ko.isObservable(obj) && obj.isRemote) {
                obj.viewModel = viewModel;

                initializeRemoteObservableArray(obj);
            }
        }
        
        // Allows the users to initialize the ViewModel remote methods with a init function
        // Another way is to call the applyRemoteOperations on the returned object by applyBindings
        if (typeof (viewModel.init) === "function") {
            viewModel.init();
        }

        
        return true;
    };

}(window.jQuery, window.ko));

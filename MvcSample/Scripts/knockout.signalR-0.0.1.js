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
        capitalizeObj: function (obj) {
            var result = { };
            for (var field in obj) {
                result[utils.firstLetterToUpperCase(field)] = obj[field]();
            }
            return result;
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

        observable.subscribe(function() {
            console.log('array has changed!');
        });
        
        observable.push = function (obj, localOnly) {
            console.log('push');
            push.apply(this, [obj]);
            
            if (localOnly) {
                return;
            }
            
            this.viewModel.server.add(utils.capitalizeObj(obj));
        };
        
        observable.destroy = function (obj) {
            destroy.apply(this, [obj]);
            console.log('destroy');
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

        observable.mapFromServer = function (obj) {
            return obj;
        };

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

        // Affects the viewmodel with the hub.
        var initiated = initializeViewModel(viewModel);
        
        applyBindings(viewModel, rootNode);
        
        if (initiated) {
            return {
                applyRemoteOperations: function(initFunc) {
                    initFunc(viewModel);
                }
            };
        }
        return null;
    };

    var initializeRemoteObservableArray = function (observable) {

        var client = observable.viewModel.client;

        // adds the push function
        client.push = function(obj) {
            observable.push(
                observable.mapFromServer(obj), /* the value to be pushed */
                true /* localOnly */
            );
        };

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

        $.connection.hub.start();
        return true;
    };

}(window.jQuery, window.ko));

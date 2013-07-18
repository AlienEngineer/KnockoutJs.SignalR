/*!
 * KnockoutJs.SignalR Merge JavaScript Library v1.0.0
 *
 * This file holds the core code of the library.
 *
 * Copyright 2013, Sérgio Ferreira
 */
(function () {

    var ks = function () {

    };

    String.prototype.charToLowerCase = function () {
        return this[0].toLowerCase() + this.slice(1, this.length);
    };

    String.prototype.charToUpperCase = function () {
        return this[0].toLowerCase() + this.slice(1, this.length);
    };

    ks.fn = ks.prototype = {
        // Creates an object with capitablized initials. To match object on the server hub side.
        capitalizeObj: function (obj) {
            var result = {};
            for (var field in obj) {
                result[field.charToUpperCase(0)] = ks.fn.getValue(obj[field]);
            }
            return result;
        },
        forEachRemoteMember: function (obj, func) {
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

                if (ks.getValue(value1) !== ks.getValue(value2)) {
                    return false;
                }
            }
            return true;
        },
        // Sincronizes target with data.
        syncObj: function (target, data) {
            for (var field in target) {
                var field1 = target[field];
                var field2 = ks.getValue(data[field.charToUpperCase(0)]);

                if (ks.fn.getValue(field1) !== field2) {
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
        getValue: function (val) {
            if (typeof val === "function") {
                return val();
            }
            return val;
        },
        prepareElement: function (elem, remoteArray) {
            var self = elem;

            // keep a ref for the array this element is on.
            self.observableArray = remoteArray;

            ks.fn.forEachRemoteMember(self, function () {
                // keep a ref of the obj this field belongs to.
                this.owner = self;
            });
        }
    };

    

    // Affects the viewmodel with the hub.
    // Starts the connection.
    var initializeViewModel = function (viewModel) {
        var name = viewModel.constructor['name'];

        if (name === undefined || name.length == 0) {
            return false;
        }
        name = name.charToLowerCase(0);

        var hub = viewModel.hub = $.connection[name];

        viewModel.client = hub.client;
        viewModel.server = hub.server;
        $.connection.hub.start();

        // Sets the ViewModel to the remote observable
        ks.fn.forEachRemoteMember(viewModel, function () {
            this.viewModel = viewModel;
            initializeRemoteObservableArray(this);
        });

        // Allows the users to initialize the ViewModel remote methods with a init function
        // Another way is to call the applyRemoteOperations on the returned object by applyBindings
        if (typeof (viewModel.init) === "function") {
            viewModel.init();
        }


        return true;
    },
    //
    // Appends functions to the view model client hub.
    // Populates the array with server objects.
    //
    initializeRemoteObservableArray = function (observable) {

        // When the connection state is good load the values into the array.
        // $.connection.hub.start().done(...) is beeing called before the state is connected.
        $.connection.hub.stateChanged(function () {
            if ($.connection.connectionState.connected !== $.connection.hub.state) {
                return;
            }

            observable.viewModel.server.getAll().done(function (values) {
                var mappedValues = $.map(values, function (item) { return observable.mapFromServer(item); });

                $(mappedValues).each(function () {

                    ks.fn.prepareElement(this, observable);

                });

                observable(mappedValues);
            });

        });

    },

    // keep the original applyBindings function
    // will be used again in the new applyBindings
    applyBindings = ko.applyBindings;




    //
    // Wrapper for applyBindings method.
    //
    ko.applyBindings = function (viewModel, rootNode) {

        applyBindings(viewModel, rootNode);

        // Affects the viewmodel with the hub.
        var initiated = initializeViewModel(viewModel);

        if (initiated) {
            return {
                applyRemoteOperations: function (initFunc) {
                    initFunc(viewModel);
                }
            };
        }

        return null;
    };


    window._ks = window.ks;
    window.ks = new ks();
    

})();
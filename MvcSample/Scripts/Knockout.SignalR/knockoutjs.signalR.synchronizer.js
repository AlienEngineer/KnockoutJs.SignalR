/*!
 * KnockoutJs.SignalR Merge JavaScript Library v1.0.0
 *
 * This file holds the code for the Synchronizer type.
 * A synchronizer instance will
 *      - handle the responses from the server hub.
 *      - make requests to the server hub wrapping the client side function calls.
 *
 * Copyright 2013, Sérgio Ferreira
 */
(function () {

    var Synchronizer = function (syncUp, syncDown, predicate) {
        if (!(this instanceof Synchronizer)) {
            return new Synchronizer(syncUp, syncDown, predicate);
        }

        this.syncUp = syncUp;
        this.syncDown = syncDown;
        this.shouldAttach = predicate;

        return this;
    },
    argsToArray = function (args) {
        var arr = [];
        for (var i = 0; i < args.length; i++) {
            arr.push(args[i]);
        }
        return arr;
    },

    // Wrap functions of the observable.
    attachSyncUp = function (syncUp, observable) {
        
        for (var handler in syncUp) {
        
            observable[handler] = function(oldMethod, func) {
                return function() {
                    var arr = typeof arguments[1] !== "boolean" ? [false, oldMethod, observable] : [oldMethod, observable];

                    var args = argsToArray(arguments).concat(arr);
                    return func.apply(this, args);
                };
            }(observable[handler], syncUp[handler]);
        }
        
    },

    // Append functions to handle the server side hub calls.
    // The server hub on js should be available as a field observable
    attachSyncDown = function (syncDown, observable) {
        
        var client = observable.viewModel.client;
        
        for (var handler in syncDown) {
            
            client[handler] = function(func) {
                return function() {
                    return func.apply(observable, arguments);
                };
            }(syncDown[handler]);
                
        }
        
    };

    Synchronizer.fn = Synchronizer.prototype = {
        constructor: Synchronizer,
        // Attach the syncUp and syncDown to the observable.
        attach: function (observable) {
            attachSyncUp(this.syncUp, observable);
            attachSyncDown(this.syncDown, observable);
        }
    };

    // Export this symbol
    window.Synchronizer = Synchronizer;

})();
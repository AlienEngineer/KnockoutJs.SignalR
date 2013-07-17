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
    // Validates that the syncObj has the required fields.
    validateSyncObject = function (syncObj, name) {
        if (!syncObj) {
            throw { message: "No " + name + " object was found." };
        }

        if (!syncObj.method) {
            throw { message: name + " object does not have a ref for the method name." };
        }

        if (!syncObj.handler || typeof syncUp.handler !== "function") {
            throw { message: name + " object does not have a proper ref for a handler." };
        }
    },

    // Wrap a function of the observable.
    attachSyncUp = function (syncUp, observable) {
        validateSyncObject(syncUp, "syncUp");

        var oldMethod = observable[syncUp.method];

        observable[syncUp.method] = function () {
            return syncUp.handler.apply(this, arguments.concat([oldMethod, observable]));
        };

    },

    // Append a function to handle the server side hub calls.
    // The server hub on js should be available as a field observable
    attachSyncDown = function (syncDown, observable) {
        validateSyncObject(syncDown, "syncDown");

        var client = observable.viewModel.client;

        client[syncDown.method] = function () {
            return syncDown.handler.apply(observable, arguments);
        };

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
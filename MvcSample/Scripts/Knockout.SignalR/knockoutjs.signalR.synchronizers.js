/*!
 * KnockoutJs.SignalR Merge JavaScript Library v1.0.0
 *
 * This file holds the observables code of the library.
 *
 * Copyright 2013, Sérgio Ferreira
 */
(function ($, ko) {

    var synchronizers = [],
        isRemoteArray = function (o) { return o.isRemoteArray; },
        isRemote = function (o) { return o.isRemote && !o.isRemoteArray; };

    var pushSync = new Synchronizer({
        push: function (obj, localOnly, push, observable) {
            // prepares the received obj
            ks.prepareElement(obj, observable);

            console.log('push');
            // push the value to the array.
            push.apply(this, [obj]);

            if (localOnly) {
                return;
            }

            // request the server to add
            // TODO: handle fails onAdd. needs testing.
            this.viewModel.server.add(ks.capitalizeObj(obj))
                .done(function (data) {
                    ks.syncObj(obj, data);
                })
                .fail(function () {
                    destroy.apply(observable, [obj]);
                });
        }
    },
    {
        push: function () {
            console.log('called this from server.');
        }

    }, isRemoteArray);


    synchronizers.push(pushSync);


    // Register all synchronizers.
    for (var i = 0; i < synchronizers.length; i++) {
        SyncManager.register(synchronizers[i]);
    }

})(jQuery, ko);
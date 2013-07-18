/*!
 * KnockoutJs.SignalR Merge JavaScript Library v1.0.0
 *
 * This file holds the observables code of the library.
 *
 * Copyright 2013, Sérgio Ferreira
 */
(function ($, ko) {

    SyncManager.register(
        new Synchronizer({
            method: "push",
            handler: function (obj, localOnly, push, observable) {
                // prepares the received obj
                prepareElement(obj, observable);

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
        }, {
            
        }, function (observable) {
            return observable.isRemoteArray;
        })
    );

    
})(jQuery, ko);
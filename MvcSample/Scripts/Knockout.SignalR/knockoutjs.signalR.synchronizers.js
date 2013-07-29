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

    // Synchronizer for the observable push method.
    var pushSync = new Synchronizer(
        // Object with methods to wrap the original knockout methods.
        {
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
            },
            destroy: function (obj, localOnly, destroy, observable) {
                console.log('destroy');
                // destroy the value from the array
                destroy.apply(this, [function (value) {

                    return ks.compareObj(obj, value);

                }]);

                if (localOnly) {
                    return;
                }

                // request the server to remove
                // TODO: handle fails onRemove. needs testing.
                this.viewModel.server.remove(utils.capitalizeObj(obj))
                    .fail(function () {
                        // Not the best choise.
                        push.apply(observable, [obj]);
                    });
            }
        },
        // Object with methods to be called remotly.
        {
            push: function (obj) {
                var observable = this;

                // prepares the received obj
                ks.prepareElement(obj, observable);

                observable.push(
                    observable.mapFromServer(obj), /* the value to be pushed */
                    true /* localOnly */
                );
                console.log('called this from server.');
            },
            destroy: function (obj) {
                observable.destroy(
                    observable.mapFromServer(obj), /* the value to be pushed */
                    true /* localOnly */
                );
            }
        }, isRemoteArray);


    synchronizers.push(pushSync);


    // Register all synchronizers.
    for (var i = 0; i < synchronizers.length; i++) {
        SyncManager.register(synchronizers[i]);
    }

})(jQuery, ko);
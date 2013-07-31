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
                
                if (localOnly) {
                    // push the value to the array.
                    push.apply(this, [obj]);
                    
                    return;
                }

                // request the server to add
                this.viewModel.server.add(ks.capitalizeObj(obj))
                    .done(function (data) {
                        ks.syncObj(obj, data);
                        
                        // push the value to the array.
                        push.apply(this, [obj]);
                    })
                    .fail(function () {
                        console.log('fail to push.');
                    });
            },
            destroy: function (obj, localOnly, destroy, observable) {
                console.log('destroy');

                if (localOnly) {
                    
                    // destroy the value from the array
                    destroy.apply(this, [function (value) {

                        return ks.compareObj(obj, value);

                    }]);
                    
                    return;
                }

                // request the server to remove
                this.viewModel.server.remove(ks.capitalizeObj(obj))
                    .done(function () {
                        destroy.apply(observable, [obj, true, destroy, observable]);
                    })
                    .fail(function () {
                        console.log("fail to delete.");
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
                var observable = this;
                
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
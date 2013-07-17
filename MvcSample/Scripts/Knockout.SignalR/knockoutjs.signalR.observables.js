/*!
 * KnockoutJs.SignalR Merge JavaScript Library v1.0.0
 *
 * This file holds the observables code of the library.
 *
 * Copyright 2013, Sérgio Ferreira
 */
(function ($, ko) {

    var SyncManager = function () {
        
    };

    SyncManager.prototype = {
        
    };

    ko.remoteObservableArray = function(array) {

        var observable = ko.observableArray(array);

        observable.mapFromServer = function (obj) {
            return obj;
        };

        observable.compare = function (obj1, obj2) {

            for (var fieldName in obj1) {
                if (obj1[fieldName] !== obj2[fieldName]) {
                    return false;
                }
            }

            return true;
        };
        
        observable.isRemote = true;

        return observable;

    };

    window.SyncManager = new SyncManager();

})(jQuery, ko);
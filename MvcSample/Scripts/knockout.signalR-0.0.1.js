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

    var applyBindings = ko.applyBindings;


    ko.observableRemote = function(value, idObservable) {

        var observable = ko.observable(value);

        var timeoutId;
        var lastValue = value;

        observable.subscribe(function (newValue) {
            clearTimeout(timeoutId);
            
            timeoutId = setTimeout(function () {
                if (lastValue === newValue) {
                    return;
                }

                console.log("The value changed to : " + newValue + " for ID : " + idObservable());

                lastValue = newValue;
                
            }, 500);
            
        });
        
        return observable;
    };

    // Bypass the applyBindings
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
        
        if (typeof (viewModel.init) === "function") {
            viewModel.init();
        }

        $.connection.hub.start();
        return true;
    };

}(window.jQuery, window.ko));

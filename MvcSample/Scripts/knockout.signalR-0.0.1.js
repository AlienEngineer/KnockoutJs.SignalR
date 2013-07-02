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

    // Bypass the applyBindings
    ko.applyBindings = function (viewModel, rootNode) {

        // Affects the viewmodel with the hub.
        initializeViewModel(viewModel);
        

        applyBindings(viewModel, rootNode);
    };


    // Affects the viewmodel with the hub.
    var initializeViewModel = function(viewModel) {
        var name = viewModel.constructor['name'];

        if (name === undefined || name.length == 0) {
            return;
        }
        name = name[0].toLowerCase() + name.slice(1);

        var hub = viewModel.hub = $.connection[name];

        viewModel.client = hub.client;
        viewModel.server = hub.server;

        $.connection.hub.start();
    };

}(window.jQuery, window.ko));

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
    ko.applyBindings = function(viewModel, rootNode) {



        applyBindings(viewModel, rootNode);
    };

}(window.jQuery, window.ko));

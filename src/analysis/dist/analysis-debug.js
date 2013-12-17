define("douRadio/analysis/1.0.0/analysis-debug", [ "$-debug" ], function(require, exports, module) {
    $ = require("$-debug");
    window._gaq = window._gaq || [];
    (function() {
        var ga = document.createElement("script");
        ga.type = "text/javascript";
        ga.async = true;
        ga.src = "https://ssl.google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
    })();
    _gaq.push([ "_setAccount", "UA-27166419-5" ]);
    _gaq.push([ "_trackPageview", location.href ]);
    $("body").on("click", "[seed]", function() {
        var seed = $(this).attr("seed");
        var params = seed.split("_");
        if (params.length == 2) {
            _gaq.push([ "_trackEvent", params[0], params[1] ]);
        } else if (params.length == 3) {
            _gaq.push([ "_trackEvent", params[0], params[1], params[2] ]);
        }
    });
    var track = {
        trackEvent: function() {
            if (arguments.length == 2) _gaq.push([ "_trackEvent", arguments[0], arguments[1] ]); else if (arguments.length == 3) _gaq.push([ "_trackEvent", arguments[0], arguments[1], arguments[2] ]);
        }
    };
    module.exports = track;
});

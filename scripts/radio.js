// Set configuration
seajs.config({
  base: "/sea-modules/",
  alias: {
    "$": "jquery/jquery/1.10.1/jquery.js",
    "underscore": "gallery/underscore/1.4.4/underscore.js",
    "backbone": "gallery/backbone/1.0.0/backbone.js",
    "analysis":"douRadio/analysis/1.0.0/analysis"
  }
});
seajs.use("douRadio/background/1.0.0/background");

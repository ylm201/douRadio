define("douRadio/popup/1.0.0/main-debug", [ "./models/song-debug", "backbone-debug" ], function(require, exports, module) {
    var port = chrome.extension.connect({
        name: "douRadio"
    });
    var Song = require("./models/song-debug");
    var song = new Song({
        title: "豆瓣电台",
        artist: " 小豆"
    });
    var PopupView = requrew("./view/popup");
    var popup = new PopupView({
        model: song
    });
    this.song.set({
        title: "我们不要伤心了"
    });
});

define("douRadio/popup/1.0.0/models/song-debug", [ "backbone-debug" ], function(require, exports, module) {
    var Backbone = require("backbone-debug");
    var Song = Backbone.Model.extend({});
    module.exports = Song;
});

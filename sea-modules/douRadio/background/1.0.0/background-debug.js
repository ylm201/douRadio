define("douRadio/background/1.0.0/background-debug", [ "./radio-debug", "$-debug", "underscore-debug", "backbone-debug", "analysis-debug" ], function(require, exports, module) {
    var Radio = require("./radio-debug");
    var radio = Radio.init("#radio");
    var tracker = require("analysis-debug");
    window.port = null;
    var notification = null;
    var checkLogin = function() {
        chrome.cookies.get({
            url: "http://douban.com",
            name: "dbcl2"
        }, function(cookie) {
            if (cookie) {
                chrome.cookies.set({
                    url: "http://douban.fm",
                    name: "dbcl2",
                    value: cookie.value
                });
            } else {
                port && port.postMessage({
                    type: "login"
                });
            }
        });
        chrome.cookies.get({
            url: "http://douban.com",
            name: "ck"
        }, function(cookie) {
            if (cookie) {
                chrome.cookies.set({
                    url: "http://douban.fm",
                    name: "ck",
                    value: cookie.value
                });
            }
        });
    };
    var checkVersion = function() {
        if (localStorage.version != chrome.app.getDetails().version) {
            //if(localStorage.version!='3.0.2') window.open('options.html');
            tracker && tracker.trackEvent("update", chrome.app.getDetails().version, localStorage.version ? localStorage.version : "--");
            localStorage.version = chrome.app.getDetails().version;
        }
    };
    checkVersion();
    checkLogin();
    radio.on("songEnded", function(currentSong) {
        tracker && tracker.trackEvent("play", this.kind == "session" ? "session" : "normal", currentSong && currentSong.kbps);
    });
    //歌曲切换
    radio.on("songChanged", function(currentSong) {
        port && port.postMessage({
            type: "songChanged",
            obj: currentSong
        });
        if (!port && !radio.audio.paused && localStorage.enableNotify != "N") {
            if (notification) notification.cancel();
            notification = webkitNotifications.createNotification(radio.currentSong.picture, radio.currentSong.artist, radio.currentSong.title);
            notification.show();
            setTimeout(function() {
                notification.cancel();
            }, 5e3);
        }
        !radio.audio.paused && chrome.browserAction.setTitle({
            title: radio.currentSong.artist + ":" + radio.currentSong.title
        });
    });
    //正在载入播放列表
    radio.on("songListLoading", function(t) {
        port && port.postMessage({
            type: "songListLoading",
            obj: t
        });
    });
    //播放列表已载入
    radio.on("songListLoaded", function(t) {
        port && port.postMessage({
            type: "songListLoaded",
            obj: t
        });
    });
    //歌曲播放中
    radio.on("playing", function(time) {
        port && port.postMessage({
            type: "playing",
            obj: {
                currentTime: time.currentTime,
                duration: time.duration
            }
        });
    });
    chrome.extension.onConnect.addListener(function(port) {
        if (port.name != "douRadio") return;
        window.port = port;
        port.onDisconnect.addListener(function() {
            window.port = undefined;
        });
        checkLogin();
        port.postMessage({
            type: "init",
            obj: {
                currentSong: radio.currentSong ? radio.currentSong : {
                    title: "--",
                    artist: "--",
                    picture: "/img/cd.jpg",
                    like: 0
                },
                playing: !radio.audio.paused,
                volume: radio.audio.volume,
                isReplay: radio.isReplay,
                time: {
                    currentTime: radio.audio.currentTime,
                    duration: radio.audio.duration
                }
            }
        });
        port.onMessage.addListener(function(request) {
            if (request.type == "skip") {
                radio.skip();
                return;
            }
            if (request.type == "delete") {
                radio.del();
                return;
            }
            if (request.type == "toggleLike") {
                if (radio.currentSong.like == 0) {
                    radio.like();
                    radio.currentSong.like = 1;
                } else {
                    radio.unlike();
                    radio.currentSong.like = 0;
                }
                return;
            }
            if (request.type == "switch") {
                radio.powerOn();
                return;
            }
            if (request.type == "togglePlay") {
                if (radio.currentSong == null) {
                    radio.powerOn();
                } else {
                    radio.audio.paused ? radio.audio.play() : radio.audio.pause();
                }
                return;
            }
            if (request.type == "toggleReplay") {
                radio.isReplay = !radio.isReplay;
            }
            if (request.type == "changeVolume") {
                radio.audio.volume = request.value;
                return;
            }
            if (request.type == "changeChannel") {
                localStorage["channelId"] = request.channel.channelId;
                localStorage["channelName"] = request.channel.channelName;
                localStorage["channelCollected"] = request.channel.channelCollected;
                radio.powerOn();
            }
            return;
        });
    });
});

define("douRadio/background/1.0.0/radio-debug", [ "$-debug", "underscore-debug", "backbone-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var _ = require("underscore-debug");
    var Backbone = require("backbone-debug");
    var Radio = function() {
        this.currentSong = null;
        this.songList = [];
        this.channel = 0;
        this.audio = null;
        this.isReplay = false;
        this.kind = "";
    };
    Radio.init = function(id) {
        var radio = new Radio();
        _.extend(radio, Backbone.Events);
        radio.audio = $(id)[0];
        radio.audio.volume = localStorage.volume ? localStorage.volume : .8;
        if (!localStorage["channelId"]) {
            localStorage.setItem("channelId", "0");
            localStorage.setItem("channelName", "私人");
            localStorage.setItem("channelCollected", "disable");
        }
        radio.audio.addEventListener("ended", function() {
            this.trigger("songEnded", this.currentSong);
            if (this.isReplay) {
                this.audio.play();
                if (this.currentSong.replayTimes == 0) {
                    this.reportEnd();
                    this.currentSong.replayTimes++;
                }
                return;
            }
            this.reportEnd();
            if (this.songList.length > 1) {
                this.changeSong();
            } else {
                this.getPlayList("p", this.changeSong);
            }
        }.bind(radio));
        radio.audio.addEventListener("timeupdate", function() {
            this.trigger("playing", {
                currentTime: this.audio.currentTime,
                duration: this.audio.duration
            });
        }.bind(radio));
        radio.audio.addEventListener("error", function(e) {
            radio.trigger("error", "loadSongError_" + e.target.error.code + ":" + radio.currentSong.retryTimes);
            if (radio.currentSong.retryTimes < 3) {
                radio.currentSong.retryTimes++;
                radio.currentSong.revoverTime = this.currentTime;
                this.load();
            } else {
                console.error("exceed max retry time!");
            }
        });
        radio.audio.addEventListener("loadedmetadata", function() {
            if (radio.currentSong.retryTimes > 0 && radio.currentSong.retryTimes <= 3 && radio.currentSong.revoverTime) {
                this.currentTime = radio.currentSong.revoverTime;
                radio.trigger("error", "revover:" + radio.currentSong.retryTimes);
            }
        });
        radio.getPlayList("n", function() {
            radio.changeSong(localStorage.autoPlay != "Y");
        });
        return radio;
    };
    Radio.prototype.getPlayList = function(t, fn) {
        this.trigger("songListLoading", t);
        $.getJSON("http://douban.fm/j/mine/playlist", {
            type: t,
            channel: localStorage.channelId ? localStorage.channelId : 0,
            pb: localStorage.bitrate ? localStorage.bitrate : 64,
            sid: this.currentSong ? this.currentSong.sid : "",
            pt: this.audio.currentTime,
            r: Math.random(),
            kbps: localStorage.bitrate ? localStorage.bitrate : 64,
            from: "mainsite"
        }, function(data) {
            if (data.err) {
                this.trigger("songListLoadError", t);
                return;
            }
            this.trigger("songListLoaded");
            var temp = [];
            data.song.forEach(function(o) {
                //filter ad songs
                if (!o.adtype || localStorage.filterAd != "Y") {
                    o.picture = o.picture.replace("mpic", "lpic");
                    o.retryTimes = 0;
                    o.replayTimes = 0;
                    temp.push(o);
                } else {
                    console.log("filter song" + JSON.stringify(o));
                }
            });
            this.kind = data.kind;
            if (temp.length > 0) this.songList = temp;
            fn && fn.bind(this)();
        }.bind(this));
    };
    Radio.prototype.report = function(t) {
        $.getJSON("http://douban.fm/j/mine/playlist", {
            type: t,
            channel: localStorage.channelId ? localStorage.channelId : 0,
            pb: localStorage.bitrate ? localStorage.bitrate : 64,
            sid: this.currentSong ? this.currentSong.sid : "",
            pt: this.audio.currentTime,
            r: Math.random(),
            kbps: localStorage.bitrate ? localStorage.bitrate : 64,
            from: "mainsite"
        }, function(data) {
            if (data.err) {
                return;
            }
        }.bind(this));
    };
    Radio.prototype.reportEnd = function() {
        $.get("http://douban.fm/j/mine/playlist", {
            type: "e",
            sid: this.currentSong.sid,
            channel: localStorage["channel"] ? localStorage["channel"].channelId : 61,
            from: "mainsite"
        });
    };
    Radio.prototype.changeSong = function(b) {
        this.currentSong = this.songList.shift();
        new Image().src = this.currentSong.picture;
        this.audio.src = this.currentSong.url;
        !b && this.audio.play();
        this.trigger("songChanged", this.currentSong);
    };
    Radio.prototype.skip = function() {
        this.audio.pause();
        if (this.kind == "session") {
            this.report("s");
            if (this.songList.length <= 1) {
                this.trigger("songListLoading", "s");
                this.getPlayList("p", this.changeSong);
            } else {
                this.changeSong();
            }
        } else {
            this.getPlayList("s", this.changeSong);
        }
    };
    Radio.prototype.like = function() {
        this.kind == "session" ? this.report("r") : this.getPlayList("r");
    };
    Radio.prototype.unlike = function() {
        this.kind == "session" ? this.report("u") : this.getPlayList("u");
    };
    Radio.prototype.del = function() {
        this.audio.pause();
        if (this.kind == "session") {
            this.report("b");
            if (this.songList.length <= 1) {
                this.trigger("songListLoading", "b");
                this.getPlayList("p", this.changeSong);
            } else {
                this.changeSong();
            }
        } else {
            this.getPlayList("b", this.changeSong);
        }
    };
    Radio.prototype.powerOn = function(port) {
        this.audio.pause();
        this.getPlayList("n", this.changeSong);
    };
    module.exports = Radio;
});

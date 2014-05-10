define("douRadio/popup/1.0.0/main-debug", [ "$-debug", "backbone-debug", "./models/player-debug", "./view/popup-debug", "underscore-debug", "./share-debug", "./view/channels-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Backbone = require("backbone-debug");
    var Player = require("./models/player-debug");
    var PopupView = require("./view/popup-debug");
    var ChannelsView = require("./view/channels-debug");
    //var FavChannelsView=require("./view/favChannels");
    var player, popupView;
    var port = chrome.extension.connect({
        name: "douRadio"
    });
    port.onMessage.addListener(function(msg) {
        if (msg.type == "init") {
            player = new Player(msg.obj);
            popupView = new PopupView({
                model: player
            });
            popupView.port = port;
            var channelsView = new ChannelsView();
            channelsView.port = port;
            channelsView.player = player;
        }
        if (msg.type == "songChanged") {
            player.set({
                currentSong: msg.obj
            });
        }
        if (msg.type == "songListLoading") {
            player.set({
                loadType: msg.obj
            });
            player.set({
                loading: true
            });
        }
        if (msg.type == "songListLoaded") {
            player.set({
                loadType: msg.obj
            });
            player.set({
                loading: false
            });
        }
        if (msg.type == "playing") {
            player.set({
                time: msg.obj
            });
        }
        if (msg.type == "login") {
            $("#notify").show();
        }
    });
    $("#notify_close").on("click", function() {
        $("#notify").hide();
    });
});

define("douRadio/popup/1.0.0/models/player-debug", [ "backbone-debug" ], function(require, exports, module) {
    var Backbone = require("backbone-debug");
    var Player = Backbone.Model.extend({});
    module.exports = Player;
});

define("douRadio/popup/1.0.0/view/popup-debug", [ "backbone-debug", "$-debug", "underscore-debug", "douRadio/popup/1.0.0/share-debug", "douRadio/popup/1.0.0/view/channels-debug" ], function(require, exports, module) {
    var Backbone, $, _, share;
    Backbone = require("backbone-debug");
    $ = require("$-debug");
    _ = require("underscore-debug");
    share = require("douRadio/popup/1.0.0/share-debug");
    var ChannelsView = require("douRadio/popup/1.0.0/view/channels-debug");
    PopupView = Backbone.View.extend({
        el: "#main",
        template: _.template($("#t_songInfo").html()),
        events: {
            "click #control a": "play",
            "click #skip": "skip",
            "click #like": "like",
            "click #delete": "deleteSong",
            "click #search": "showChannels",
            "mouseover #control": "fadeOutCD",
            "mouseout #control": "fadeInCD",
            "mouseover #share": "showShareList",
            "mouseout  #share": "hideShareList",
            "click #shareList a": "share",
            "click #replay": "replay",
            "input #range": "volume"
        },
        initialize: function() {
            this.render();
            this.listenTo(this.model, "change:currentSong", this.changeSong);
            this.listenTo(this.model, "change:time", this.playing);
            this.listenTo(this.model, "change:loading", this.loading);
        },
        render: function() {
            var html = this.template(this.model.attributes);
            this.$el.html(html);
            this.playing();
        },
        realModel: function() {
            return this.model.attributes;
        },
        play: function() {
            var lastPlayingStatus = this.model.get("playing");
            this.model.set({
                playing: !lastPlayingStatus
            });
            this.port.postMessage({
                type: "togglePlay"
            });
            if (!lastPlayingStatus) {
                $("#control a").attr("class", "button playing");
                $("#cover").removeClass("fadeout").addClass("rotating");
            } else {
                $("#control a").attr("class", "button paused");
                $("#cover").addClass("fadeout").removeClass("rotating");
            }
        },
        skip: function() {
            this.model.get("playing") && this.port.postMessage({
                type: "skip"
            });
        },
        like: function() {
            this.model.get("playing") && this.port.postMessage({
                type: "toggleLike"
            });
            this.model.get("playing") && $("#like").toggleClass("like").toggleClass("unlike");
        },
        deleteSong: function() {
            this.model.get("playing") && this.port.postMessage({
                type: "delete"
            });
        },
        changeSong: function() {
            var currentSong = this.model.get("currentSong");
            var url = currentSong.picture;
            var cover = $("#cover");
            var that = this;
            cover.fadeOut("150", function() {
                var img = new Image();
                img.src = url;
                $(img).load(function() {
                    if (that.model.get("playing")) cover.removeClass("fadeout").addClass("rotating");
                    cover.css("background-image", "url(" + url + ")");
                    cover.fadeIn("350");
                });
            });
            $("#title").html(currentSong.title).attr("title", currentSong.title);
            $("#artist").html(currentSong.artist + "--" + currentSong.albumtitle).attr("title", currentSong.artist + "--" + currentSong.albumtitle).attr("href", "http://music.douban.com" + currentSong.album);
            $("#like").attr("class", currentSong.like == 1 ? "button like" : "button unlike");
        },
        playing: function() {
            var time = this.model.get("time");
            var remain = time.duration - time.currentTime;
            var m = parseInt(remain / 60);
            var s = parseInt(remain % 60);
            s = s < 10 ? "0" + s : s;
            $("#timer").html(m + ":" + s);
            $("#played").width(time.currentTime / time.duration * 100 + "%");
        },
        fadeOutCD: function() {
            if ($("#control a").hasClass("playing")) {
                $("#cover").addClass("fadeout");
                $("#control a").show();
            }
        },
        fadeInCD: function() {
            if ($("#control a").hasClass("playing")) {
                $("#cover").removeClass("fadeout");
                $("#control a").hide();
            }
        },
        showShareList: function() {
            $("#shareList").show();
        },
        hideShareList: function() {
            $("#shareList").hide();
        },
        share: function(o) {
            share[$(o.target).attr("id")](this.model.get("currentSong"));
        },
        loading: function() {
            var op = $("#operation li[op='" + this.model.get("loadType") + "']");
            if (this.model.get("loading")) {
                op.removeClass("rotated").addClass("rotate").addClass("rotating");
                if (this.model.get("loadType") != "r" && this.model.get("loadType") != "u") $("#cover").addClass("fadeout").removeClass("rotating");
            } else {
                $("#operation li").removeClass("rotate").removeClass("rotating");
            }
        },
        replay: function() {
            var isReplay = this.model.get("isReplay");
            this.model.set({
                isReplay: !isReplay
            });
            !isReplay ? $("#replay").removeClass("hover-fadeIn") : $("#replay").addClass("hover-fadeIn");
            this.port.postMessage({
                type: "toggleReplay"
            });
        },
        volume: function(o) {
            this.port.postMessage({
                type: "changeVolume",
                value: o.target.value / 100
            });
        },
        showChannels: function() {
            var left = "-180px";
            if ($("#search").attr("slided") == "true") {
                $(".container").animate({
                    left: "0px"
                }, 500, function() {
                    $("#search").attr("slided", "false");
                });
            } else {
                $("#channels").show();
                $(".container").animate({
                    left: "-180px"
                }, 500, function() {
                    $("#search").attr("slided", "true");
                });
            }
        }
    });
    module.exports = PopupView;
});

define("douRadio/popup/1.0.0/share-debug", [], function(require, exports, module) {
    var share = {
        shareWeibo: function(song) {
            url = "http://douban.fm/?start=" + song.sid + "g" + song.ssid + "g0&cid=0";
            var pic = song.picture && song.picture.replace(/mpic|spic/, "lpic");
            var content = "分享" + song.artist + "的单曲《" + song.title + "》(来自@豆瓣FM)";
            window.open("http://service.weibo.com/share/share.php?url=" + encodeURIComponent(url) + "&appkey=694135578" + "&title=" + encodeURIComponent(content) + "&pic=" + encodeURIComponent(pic) + "&language=zh-cn", "_blank", "width=615,height=505");
        },
        shareDouban: function(song) {
            url = "http://douban.fm/?start=" + song.sid + "g" + song.ssid + "g0&cid=0";
            var pic = song.picture && song.picture.replace(/mpic|spic/, "lpic");
            var content = "分享" + song.artist + "的单曲《" + song.title + "》(来自@豆瓣FM)";
            window.open("http://shuo.douban.com/!service/share?name=" + encodeURIComponent(song.title) + "&href=" + encodeURIComponent(url) + "&image=" + encodeURIComponent(pic) + "&desc=by小豆(http://goo.gl/iRxds)" + "&apikey=0458f5fa0cd49e2a0d0ae1ee267dda7e&target_type=rec&target_action=0&object_kind=3043&object_id=" + song.sid + "action_props=" + encodeURIComponent('%7B"url"%3A "' + "http://t.cn/zOxAHIV" + '"%2C "title" "' + song.artist + "--" + song.title + '"%7D'), "_blank", "width=615,height=505");
        }
    };
    module.exports = share;
});

define("douRadio/popup/1.0.0/view/channels-debug", [ "backbone-debug", "$-debug", "underscore-debug" ], function(require, exports, module) {
    var Backbone, $, _, share;
    Backbone = require("backbone-debug");
    $ = require("$-debug");
    _ = require("underscore-debug");
    var ChannelsView = Backbone.View.extend({
        el: "#channels",
        template: _.template($("#t_channels").html()),
        templateFav: _.template($("#t_favchannels").html()),
        initialize: function() {
            _.bindAll(this, "render", "renderFav");
            var Channels = Backbone.Model.extend({
                url: "https://api.douban.com/v2/fm/app_channels"
            });
            this.channels = new Channels();
            var FavChannels = Backbone.Model.extend({
                url: "http://douban.fm/j/fav_channels"
            });
            this.favChannels = new FavChannels();
            this.favChannels.fetch({
                success: this.renderFav
            });
            this.channels.fetch({
                success: this.render
            });
            $("#currentChannel").html(localStorage.channelName);
            if (localStorage.channelCollected != "disable") {
                $.get("http://douban.fm/j/explore/is_fav_channel?cid=" + localStorage.channelId, function(data) {
                    $("#op-fav-channel").attr("cid", localStorage.channelId).attr("collected", data.data.res.is_fav);
                });
            } else {
                $("#op-fav-channel").attr("cid", localStorage.channelId).attr("collected", "disable");
            }
        },
        events: {
            "click .channel_item": "changeChannel",
            "click #op-fav-channel": "favChannel",
            "click .unfav": "unfavChannel"
        },
        render: function() {
            $("#total").html(this.template(this.channels.attributes));
        },
        renderFav: function() {
            $("#myFav").html(this.templateFav(this.favChannels.attributes));
        },
        changeChannel: function(o) {
            $(".channel_item").removeClass("channel_item_selected");
            var s = $(o.target);
            s.addClass("channel_item_selected");
            $("#currentChannel").html(s.attr("title")).attr("title", s.attr("title"));
            $("#op-fav-channel").attr("cid", s.attr("cid")).attr("collected", s.attr("collected"));
            $("#search").attr("title", s.attr("title"));
            this.player.set({
                playing: true
            });
            $("#control a").attr("class", "button playing").hide();
            $("#cover").removeClass("fadeout").addClass("rotating");
            this.port.postMessage({
                type: "changeChannel",
                channel: {
                    channelId: s.attr("cid"),
                    channelName: s.attr("title"),
                    channelCollected: s.attr("collected")
                }
            });
        },
        favChannel: function() {
            var url;
            var currentChannel = $("#op-fav-channel");
            if (currentChannel.attr("collected") == "true") {
                url = "http://douban.fm/j/explore/unfav_channel?cid=";
            } else if (currentChannel.attr("collected") == "false") {
                url = "http://douban.fm/j/explore/fav_channel?cid=";
            } else {
                return;
            }
            $.get(url + currentChannel.attr("cid"), function(data) {
                if (data.status == true) {
                    var collected = currentChannel.attr("collected") == "true" ? "false" : "true";
                    localStorage.channelCollected = collected;
                    $("#op-fav-channel").attr("collected", currentChannel.attr("collected") == "true" ? "false" : "true");
                }
            });
        },
        unfavChannel: function(o) {
            console.log("unfav");
            var ch = $(o.target).parent();
            $.get("http://douban.fm/j/explore/unfav_channel?cid=" + ch.attr("cid"), function(data) {
                if (data.status == true) {
                    ch.remove();
                    if ($("#op-fav-channel").attr("cid") == ch.attr("cid")) {
                        $("#op-fav-channel").attr("collected", "false");
                        localStorage.channelCollected = "false";
                    }
                }
            });
            return false;
        }
    });
    module.exports = ChannelsView;
});

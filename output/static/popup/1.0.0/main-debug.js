define("popup/1.0.0/main-debug", ["jquery/1.10.1/jquery-debug", "backbone/1.1.2/backbone-debug", "underscore/1.6.0/underscore-debug"], function(require, exports, module) {
  var $ = require("jquery/1.10.1/jquery-debug");
  var Backbone = require("backbone/1.1.2/backbone-debug");
  var Player = require("popup/1.0.0/models/player-debug");
  var PopupView = require("popup/1.0.0/view/popup-debug");
  var ChannelsView = require("popup/1.0.0/view/channels-debug");
  var HistoryView = require("popup/1.0.0/view/history-debug");
  var player, popupView;
  var port = chrome.extension.connect({
    name: "douRadio"
  })
  port.onMessage.addListener(function(msg) {
    if (msg.type == 'init') {
      player = new Player(msg.obj);
      popupView = new PopupView({
        'model': player
      });
      popupView.port = port;
      channelsView = new ChannelsView({
        player: player
      });
      channelsView.port = port;
      historyView = new HistoryView({
        model: msg.obj.heared
      });
      historyView.port = port;
    }
    if (msg.type == 'songChanged') {
      player.set({
        currentSong: msg.obj
      })
    }
    if (msg.type == 'songListLoading') {
      player.set({
        loadType: msg.obj
      });
      player.set({
        loading: true
      })
    }
    if (msg.type == 'songListLoaded') {
      player.set({
        loadType: msg.obj
      });
      player.set({
        loading: false
      })
    }
    if (msg.type == 'playing') {
      player.set({
        time: msg.obj
      });
    }
    if (msg.type == 'login') {
      $('#notify').show();
    }
  });
  $("#notify_close").on("click", function() {
    $("#notify").hide()
  })
});
define("popup/1.0.0/models/player-debug", ["backbone/1.1.2/backbone-debug", "underscore/1.6.0/underscore-debug", "jquery/1.10.1/jquery-debug"], function(require, exports, module) {
  var Backbone = require("backbone/1.1.2/backbone-debug");
  var Player = Backbone.Model.extend({});
  module.exports = Player;
});
define("popup/1.0.0/view/popup-debug", ["backbone/1.1.2/backbone-debug", "underscore/1.6.0/underscore-debug", "jquery/1.10.1/jquery-debug"], function(require, exports, module) {
  var Backbone, $, _, share;
  Backbone = require("backbone/1.1.2/backbone-debug");
  $ = require("jquery/1.10.1/jquery-debug");
  _ = require("underscore/1.6.0/underscore-debug");
  share = require("popup/1.0.0/share-debug");
  PopupView = Backbone.View.extend({
    el: "#main",
    template: _.template($("#t_songInfo").html()),
    events: {
      'click #J-toggle-play': 'togglePlay',
      'click #J-btn-skip': 'skip',
      'click #J-btn-like': 'like',
      'click #J-btn-delete': 'delete',
      'click #J-btn-channel': 'showChannels',
      'click #J-btn-history': 'showHistory',
      'mouseover .play-btn-wrapper': 'fadeOutCD',
      'mouseout .play-btn-wrapper': 'fadeInCD',
      'mouseover #share': 'showShareList',
      'mouseout  #share': 'hideShareList',
      'click #shareList a': 'share',
      'click #replay': 'replay',
      'input #range': 'volume'
    },
    initialize: function() {
      this.render();
      this.listenTo(this.model, 'change:currentSong', this.changeSong);
      this.listenTo(this.model, 'change:time', this.playing);
    },
    render: function() {
      var html = this.template(this.model.attributes);
      this.$el.html(html);
      this.playing();
    },
    realModel: function() {
      return this.model.attributes;
    },
    togglePlay: function() {
      this.model.set({
        playing: !this.model.get('playing')
      });
      this.port.postMessage({
        type: 'togglePlay'
      });
      $("#cover").toggleClass('fn-rotating-paused');
      if (this.realModel().playing) {
        $("#J-toggle-play").addClass('playing').removeClass('paused');
        $('#cover').removeClass('fadeout');
      } else {
        $("#J-toggle-play").removeClass('playing').addClass('paused');
        $('#cover').addClass('fadeout');
      }
    },
    skip: function(e) {
      this.port.postMessage({
        type: 'skip'
      })
      $(e.target.parentNode).addClass('fn-rotating');
      $("#cover").addClass('fadeout').addClass('fn-rotating-paused');
    },
    like: function() {
      this.port.postMessage({
        type: 'toggleLike'
      })
      $("#J-btn-like").toggleClass('like').toggleClass('unlike');
    },
    delete: function(e) {
      this.port.postMessage({
        type: "delete"
      });
      $(e.target.parentNode).addClass('fn-rotating');
      $("#cover").addClass('fadeout').removeClass('fn-rotating-paused');
    },
    changeSong: function() {
      this.model.set({
        playing: !this.model.get('playing')
      });
      var currentSong = this.model.get('currentSong');
      var url = currentSong.picture;
      var cover = $("#cover");
      var that = this;
      cover.fadeOut('150', function() {
        var img = new Image();
        img.src = url;
        $(img).load(function() {
          cover.removeClass('fadeout').removeClass('fn-rotating-paused');
          cover.css("background-image", "url(" + url + ")");
          cover.fadeIn('350');
        })
      });
      this.realModel().playing && $("#J-toggle-play").addClass('playing').removeClass('paused').hide();
      $("#J-song-title").html(currentSong.title).attr('title', currentSong.title);
      $("#J-song-artist").html(currentSong.artist + '--' + currentSong.albumtitle).attr('title', currentSong.artist + '--' + currentSong.albumtitle).attr('href', 'http://music.douban.com' + currentSong.album);
      $("#J-btn-like").attr('class', currentSong.like == 1 ? 'button like' : 'button unlike');
      $("#controller li").removeClass('fn-rotating');
    },
    playing: function() {
      var time = this.model.get('time');
      var remain = time.duration - time.currentTime;
      var m = parseInt(remain / 60);
      var s = parseInt(remain % 60);
      s = (s < 10) ? ('0' + s) : s;
      $('#timer').html(m + ":" + s);
      $('#played').width((time.currentTime / time.duration * 100) + "%");
    },
    fadeOutCD: function() {
      if (this.model.get('playing')) {
        $('#cover').addClass('fadeout');
        $('#J-toggle-play').show();
      }
    },
    fadeInCD: function() {
      if (this.model.get('playing')) {
        $('#cover').removeClass('fadeout');
        $('#J-toggle-play').hide();
      }
    },
    showShareList: function() {
      $("#shareList").show();
    },
    hideShareList: function() {
      $("#shareList").hide();
    },
    share: function(o) {
      share[$(o.target).attr('id')](this.model.get('currentSong'));
    },
    replay: function() {
      this.model.set({
        isReplay: !this.model.get('isReplay')
      });
      $('#replay').toggleClass('fn-hover-fadein');
      this.port.postMessage({
        type: 'toggleReplay'
      });
    },
    volume: function(o) {
      this.port.postMessage({
        type: 'changeVolume',
        value: o.target.value / 100
      })
    },
    showChannels: function() {
      if ($("#J-btn-channel").attr('slided') == 'true') {
        $(".container").animate({
          left: '-180px'
        }, 500, function() {
          $("#J-btn-channel").attr('slided', 'false')
        });
      } else {
        $(".container").animate({
          left: '-360px'
        }, 500, function() {
          $("#J-btn-channel").attr('slided', 'true')
        });
      }
    },
    showHistory: function() {
      if ($("#J-btn-history").attr('slided') == 'true') {
        $(".container").animate({
          left: '-180px'
        }, 500, function() {
          $("#J-btn-history").attr('slided', 'false')
        });
      } else {
        $(".container").animate({
          left: '0px'
        }, 500, function() {
          $("#J-btn-history").attr('slided', 'true')
        });
      }
    }
  });
  module.exports = PopupView;
});
define("popup/1.0.0/share-debug", [], function(require, exports, module) {
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
      window.open("http://shuo.douban.com/!service/share?name=" + encodeURIComponent(song.title) + "&href=" + encodeURIComponent(url) + "&image=" + encodeURIComponent(pic) + "&desc=by小豆(http://goo.gl/iRxds)" + "&apikey=0458f5fa0cd49e2a0d0ae1ee267dda7e&target_type=rec&target_action=0&object_kind=3043&object_id=" + song.sid + "action_props=" + encodeURIComponent('%7B"url"%3A "' + "http://t.cn/zOxAHIV" + '"%2C "title" "' + song.artist + '--' + song.title + '"%7D'), "_blank", "width=615,height=505")
    }
  }
  module.exports = share;
});
define("popup/1.0.0/view/channels-debug", ["backbone/1.1.2/backbone-debug", "underscore/1.6.0/underscore-debug", "jquery/1.10.1/jquery-debug"], function(require, exports, module) {
  var Backbone, $, _, share;
  Backbone = require("backbone/1.1.2/backbone-debug");
  $ = require("jquery/1.10.1/jquery-debug");
  _ = require("underscore/1.6.0/underscore-debug");
  var ChannelsView = Backbone.View.extend({
    el: "#channels",
    template: _.template($("#t_channels").html()),
    templateFav: _.template($("#t_favchannels").html()),
    initialize: function() {
      _.bindAll(this, 'renderPublic', 'renderPrivate');
      var Channels = Backbone.Model.extend({
        url: "https://api.douban.com/v2/fm/app_channels"
      });
      this.channels = new Channels;
      var FavChannels = Backbone.Model.extend({
        url: "http://douban.fm/j/fav_channels"
      });
      this.favChannels = new FavChannels;
      this.favChannels.fetch({
        success: this.renderPrivate
      });
      this.channels.fetch({
        success: this.renderPublic
      });
      $('#currentChannel').html(localStorage.channelName);
      if (localStorage.channelCollected == 'true' || localStorage.channelCollected == 'false') {
        $.get("http://douban.fm/j/explore/is_fav_channel?cid=" + localStorage.channelId, function(data) {
          $('#J-fav-channel').attr('cid', localStorage.channelId).attr('collected', data.data.res.is_fav);
          data.data.res.is_fav ? $('#J-fav-channel').addClass('star').removeClass('unstar') : $('#J-fav-channel').addClass('unstar').removeClass('star')
        })
      } else {
        $('#J-fav-channel').attr('cid', localStorage.channelId).hide();
      }
    },
    events: {
      'click .J-channel-item': 'changeChannel',
      'click #J-fav-channel': 'favChannel',
      'click .J-btn-unfav-channel': 'unfavChannel'
    },
    renderPublic: function() {
      $('#public-channel').html(this.template(this.channels.attributes));
    },
    renderPrivate: function() {
      $('#private-channel').html(this.templateFav(this.favChannels.attributes));
    },
    changeChannel: function(e) {
      var s = $(e.target);
      $("#channels li").removeClass('item-selected');
      $(e.target.parentNode).addClass('item-selected');
      $('#currentChannel').html(s.attr('title')).attr('title', s.attr('title'));
      if (s.attr('collected') == 'true') {
        $('#J-fav-channel').addClass('star').removeClass('unstar').show();
      } else if (s.attr('collected') == 'false') {
        $('#J-fav-channel').addClass('unstar').removeClass('star').show();
      } else {
        $('#J-fav-channel').hide();
      }
      $('#J-fav-channel').attr('cid', s.attr('cid')).attr('collected', s.attr('collected'));
      $('#J-btn-channel').attr('title', s.attr('title'));
      $("#cover").addClass('fadeout').addClass('fn-rotating-paused');
      this.port.postMessage({
        type: 'changeChannel',
        channel: {
          channelId: s.attr('cid'),
          channelName: s.attr('title'),
          channelCollected: s.attr('collected')
        }
      });
    },
    favChannel: function() {
      var url;
      var currentChannel = $('#J-fav-channel');
      if (currentChannel.attr("collected") == 'true') {
        url = 'http://douban.fm/j/explore/unfav_channel?cid='
      } else if (currentChannel.attr("collected") == 'false') {
        url = 'http://douban.fm/j/explore/fav_channel?cid='
      } else {
        return;
      }
      $.get(url + currentChannel.attr('cid'), function(data) {
        if (data.status == true) {
          currentChannel.attr('collected') == 'true' ? localStorage.channelCollected = 'false' : localStorage.channelCollected = 'true';
          localStorage.channelCollected == 'true' ? currentChannel.addClass('star').removeClass('unstar') : $('#J-fav-channel').addClass('unstar').removeClass('star')
          currentChannel.attr('collected', localStorage.channelCollected)
        }
      })
    },
    unfavChannel: function(o) {
      var ch = $(o.target);
      $.get('http://douban.fm/j/explore/unfav_channel?cid=' + ch.attr('cid'), function(data) {
        if (data.status == true) {
          ch.parent().fadeOut(500);
          if ($('#J-fav-channel').attr('cid') == ch.attr('cid')) {
            $('#J-fav-channel').attr('collected', 'false');
            localStorage.channelCollected = 'false';
            $('#J-fav-channel').addClass('unstar').removeClass('star');
          }
        }
      })
      return false;
    }
  });
  module.exports = ChannelsView;
});
define("popup/1.0.0/view/history-debug", ["backbone/1.1.2/backbone-debug", "underscore/1.6.0/underscore-debug", "jquery/1.10.1/jquery-debug"], function(require, exports, module) {
  //播放历史view
  var Backbone, $, _;
  Backbone = require("backbone/1.1.2/backbone-debug");
  $ = require("jquery/1.10.1/jquery-debug");
  _ = require("underscore/1.6.0/underscore-debug");
  HistoryView = Backbone.View.extend({
    el: "#history",
    template: _.template($("#t_historyList").html()),
    events: {
      'click .J-direct-play': 'directPlay',
      'click .J-direct-toggle-like': 'directToggleLike'
    },
    initialize: function() {
      this.render();
    },
    render: function() {
      var html = this.template({
        historyList: this.model
      });
      this.$el.html(html);
    },
    directPlay: function(o) {
      console.debug("directPlay")
      this.port.postMessage({
        type: 'directPlay',
        sid: $(o.target).attr('sid')
      });
    },
    directToggleLike: function(e) {
      $(e.target).toggleClass('like').toggleClass('unlike');
      this.port.postMessage({
        type: 'directToggleLike',
        sid: $(o.target).attr('sid')
      });
    }
  });
  module.exports = HistoryView;
});
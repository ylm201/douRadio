define("background/1.0.0/background-debug", ["jquery/1.10.1/jquery-debug", "underscore/1.6.0/underscore-debug", "backbone/1.1.2/backbone-debug"], function(require, exports, module) {
  var Radio = require("background/1.0.0/radio-debug");
  var radio = Radio.init("#radio");
  window.port = null;
  var currentNotification = null;

  function reportError(e) {
      var stack = e.stack;
      var stacks = stack.split('\n')
      for (i in stacks) {
        if (stacks[i].indexOf('chrome-extension://') > 0) {
          var params = stacks[1].split('/');
          console.log(params[params.length - 1] + '_' + e.message);
          _gaq.push(['_trackEvent', 'JsError', params[params.length - 1] + '_' + e.message]);
          break;
        }
      }
    }
    //校验是否登录douban.com，并把douban.com session cookie 设置到douban.fm域
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
        })
      } else {
        port && port.postMessage({
          type: 'login'
        })
      }
    })
    chrome.cookies.get({
      url: "http://douban.com",
      name: "ck"
    }, function(cookie) {
      if (cookie) {
        chrome.cookies.set({
          url: "http://douban.fm",
          name: "ck",
          value: cookie.value
        })
      }
    })
  }
  checkLogin();
  //应用更新埋点
  chrome.runtime.onInstalled.addListener(function(details) {
      if (details.reason === 'update') {
        if (details.previousVersion.indexOf('3.1.') < 0) { //仅主版本号不一致才显示更新列表页面
          window.open('options.html')
        }
        _gaq.push(['_trackEvent', 'update', chrome.app.getDetails().version, details.previousVersion]);
      }
    })
    //统计脚本
  radio.on("songEnded", function(currentSong) {
      _gaq.push(['_trackEvent', 'play', this.kind == "session" ? "session" : "normal", currentSong && currentSong.kbps]);
    })
    //歌曲切换
  radio.on("songChanged", function(currentSong) {
      port && port.postMessage({
        type: 'songChanged',
        obj: currentSong
      });
      //popup未弹出时才发起桌面通知;播放时才显示通知，防止extension刚加载时就弹出通知
      if (!port && !radio.audio.paused && localStorage.enableNotify != 'N') {
        //当前已经有桌面通知则关闭
        currentNotification && chrome.notifications.clear(prevNotification, function() {})
        chrome.notifications.create('', {
          iconUrl: radio.currentSong.picture,
          title: radio.currentSong.artist,
          message: radio.currentSong.title,
          type: 'basic',
          buttons: [{
            title: '下一首'
          }]
        }, function(id) {
          currentNotification = id;
          setTimeout(function() {
            chrome.notifications.clear(id, function() {})
          }, 6000)
          chrome.notifications.onButtonClicked.addListener(function(clickId, index) {
            if (clickId == id && index == 0) {
              _gaq.push(['_trackEvent', 'click', 'skipFromNotify']);
              radio.skip()
            }
          })
        })
      }
      chrome.browserAction.setTitle({
        title: radio.currentSong.artist + ":" + radio.currentSong.title
      });
    })
    //歌曲播放中
  radio.on("playing", function(time) {
    port && port.postMessage({
      type: 'playing',
      obj: {
        currentTime: time.currentTime,
        duration: time.duration
      }
    });
  })
  chrome.extension.onConnect.addListener(function(port) {
    if (port.name != "douRadio") return;
    window.port = port;
    //background与popup断开连接
    port.onDisconnect.addListener(function() {
        window.port = undefined;
      })
      // 校验登录
    checkLogin();
    port.postMessage({
      type: "init",
      obj: {
        currentSong: radio.currentSong ? radio.currentSong : {
          title: '--',
          artist: '--',
          picture: '/img/cd.jpg',
          like: 0
        },
        playing: !radio.audio.paused,
        volume: radio.audio.volume,
        isReplay: radio.isReplay,
        time: {
          currentTime: radio.audio.currentTime,
          duration: radio.audio.duration
        },
        heared: radio.heared
      }
    })
    port.onMessage.addListener(function(request) {
      try {
        if (request.type == "skip") {
          radio.skip();
          return
        }
        if (request.type == "delete") {
          radio.del();
          return
        }
        if (request.type == "toggleLike") {
          if (radio.currentSong.like == 0) {
            radio.like()
            radio.currentSong.like = 1;
          } else {
            radio.unlike()
            radio.currentSong.like = 0;
          }
          return
        }
        if (request.type == "switch") {
          radio.powerOn()
          return
        }
        if (request.type == "togglePlay") {
          if (radio.currentSong == null) {
            radio.powerOn();
          } else {
            radio.audio.paused ? radio.audio.play() : radio.audio.pause();
          }
          return
        }
        if (request.type == 'toggleReplay') {
          radio.isReplay = !radio.isReplay;
          return;
        }
        if (request.type == "changeVolume") {
          radio.audio.volume = request.value
          localStorage.volume = request.value;
          return
        }
        if (request.type == 'changeChannel') {
          localStorage['channelId'] = request.channel.channelId;
          localStorage['channelName'] = request.channel.channelName;
          localStorage['channelCollected'] = request.channel.channelCollected;
          radio.powerOn();
          return;
        }
        if (request.type == 'directPlay') {
          radio.directPlay(request.sid);
          return;
        }
        if (request.type == 'directToggleLike') {
          radio.directToggleLike(request.sid);
          return;
        }
        if (request.type == 'analysis') {
          _gaq.push(request.trackParams);
          return;
        }
        return;
      } catch (e) {
        reportError(e);
      }
    })
  })
});
define("background/1.0.0/radio-debug", ["jquery/1.10.1/jquery-debug", "underscore/1.6.0/underscore-debug", "backbone/1.1.2/backbone-debug"], function(require, exports, module) {
  var $ = require("jquery/1.10.1/jquery-debug");
  var _ = require("underscore/1.6.0/underscore-debug");
  var Backbone = require("backbone/1.1.2/backbone-debug");
  var Radio = function() {
    this.currentSong = null;
    this.songList = [];
    this.heared = [];
    this.channel = 0;
    this.audio = null;
    this.isReplay = false;
    this.kind = '';
  };
  Radio.init = function(id) {
    var radio = new Radio();
    _.extend(radio, Backbone.Events);
    radio.audio = $(id)[0];
    radio.audio.volume = localStorage.volume ? localStorage.volume : 0.8;
    if (!localStorage['channelId']) {
      localStorage.setItem('channelId', '0');
      localStorage.setItem('channelName', '私人');
      localStorage.setItem('channelCollected', 'disabled');
    }
    radio.audio.addEventListener("ended", (function() {
      this.trigger('songEnded', this.currentSong);
      //删除播放记录列表里同id歌曲重新放入队列首
      for (id in this.heared) {
        var song = this.heared[id]
        if (song.sid == this.currentSong.sid) {
          this.heared.splice(id, 1);
        }
      }
      //本地记录已播歌曲
      this.heared.unshift(this.currentSong);
      //最多记录20首歌曲，超出剔除
      if (this.heared.length > 20) {
        this.heared.pop();
      }
      //播放次数大于1不异步通知
      if (this.currentSong.playTimes == 0) this.reportEnd();
      //播放次数增1
      this.currentSong.playTimes++;
      //单曲循环不切换歌曲
      if (this.isReplay) {
        this.audio.play();
        return;
      }
      if (this.songList.length > 1) {
        this.changeSong();
      } else { //播放列表已空，再次拉取
        this.getPlayList(this.currentSong, "p", this.changeSong);
      }
    }).bind(radio));
    radio.audio.addEventListener("timeupdate", (function() {
      this.trigger("playing", {
        currentTime: this.audio.currentTime,
        duration: this.audio.duration
      });
    }).bind(radio));
    //歌曲结束事件
    radio.audio.addEventListener("error", function(e) {
      radio.trigger("error", "loadSongError_" + e.target.error.code + ":" + radio.currentSong.retryTimes);
      if (radio.currentSong.retryTimes < 3) {
        radio.currentSong.retryTimes++;
        radio.currentSong.revoverTime = this.currentTime;
        this.load();
      }
    });
    radio.audio.addEventListener("loadedmetadata", function() {
      if (radio.currentSong.retryTimes > 0 && radio.currentSong.retryTimes <= 3 && radio.currentSong.revoverTime) {
        this.currentTime = radio.currentSong.revoverTime;
        radio.trigger("error", "revover:" + radio.currentSong.retryTimes);
      }
    })
    radio.getPlayList(undefined, 'n', function() {
      radio.changeSong(localStorage.autoPlay != 'Y');
    })
    return radio;
  };
  Radio.prototype.getPlayList = function(s, t, fn) {
    this.trigger("songListLoading", t);
    $.getJSON("http://douban.fm/j/mine/playlist", {
      type: t,
      channel: localStorage.channelId ? localStorage.channelId : 0,
      pb: localStorage.bitrate ? localStorage.bitrate : 64,
      sid: s ? s.sid : '',
      pt: this.audio.currentTime,
      r: Math.random(),
      kbps: localStorage.bitrate ? localStorage.bitrate : 64,
      from: "mainsite"
    }, (function(data) {
      if (data.err) {
        this.trigger("songListLoadError", t);
        return;
      }
      this.trigger("songListLoaded");
      var temp = [];
      data.song.forEach(function(o) {
        //filter ad songs
        if (!o.adtype || localStorage.filterAd != 'Y') {
          o.picture = o.picture.replace("mpic", "lpic");
          o.retryTimes = 0;
          o.playTimes = 0;
          temp.push(o);
        } else {
          console.log("filter song" + JSON.stringify(o));
        }
      })
      this.kind = data.kind;
      if (temp.length > 0) this.songList = temp;
      fn && (fn.bind(this))();
    }).bind(this))
  }
  Radio.prototype.report = function(t, s) {
    $.getJSON("http://douban.fm/j/mine/playlist", {
      type: t,
      channel: localStorage.channelId ? localStorage.channelId : 0,
      pb: localStorage.bitrate ? localStorage.bitrate : 64,
      sid: s ? s.sid : this.currentSong.sid,
      pt: this.audio.currentTime,
      r: Math.random(),
      kbps: localStorage.bitrate ? localStorage.bitrate : 64,
      from: "mainsite"
    }, (function(data) {
      if (data.err) {
        return;
      }
    }).bind(this))
  }
  Radio.prototype.reportEnd = function() {
    $.get("http://douban.fm/j/mine/playlist", {
      type: 'e',
      sid: this.currentSong.sid,
      channel: localStorage['channel'] ? localStorage['channel'].channelId : 61,
      from: "mainsite"
    })
  }
  Radio.prototype.changeSong = function(b) {
    this.currentSong = this.songList.shift();
    //预先加载，popup弹出能直接显示图片
    new Image().src = this.currentSong.picture;
    this.audio.src = this.currentSong.url;
    !b && this.audio.play();
    this.trigger("songChanged", this.currentSong);
  }
  Radio.prototype.skip = function() {
    this.audio.pause();
    if (this.kind == 'session') {
      this.report('s');
      if (this.songList.length <= 1) {
        this.trigger("songListLoading", "s");
        this.getPlayList(this.currentSong, "p", this.changeSong);
      } else {
        this.changeSong();
      }
    } else {
      this.getPlayList(this.currentSong, "s", this.changeSong);
    }
  }
  Radio.prototype.like = function(s) {
    s ? s.like = 1 : this.currentSong.like = 1;
    this.kind == 'session' ? this.report('r', s) : this.getPlayList(s ? s : this.currentSong, 'r');
  }
  Radio.prototype.unlike = function(s) {
    s ? s.like = 0 : this.currentSong.like = 0;
    this.kind == 'session' ? this.report('u', s) : this.getPlayList(s ? s : this.currentSong, 'u');
  }
  Radio.prototype.del = function() {
    this.audio.pause();
    if (this.kind == 'session') {
      this.report('b');
      if (this.songList.length <= 1) {
        this.trigger("songListLoading", "b");
        this.getPlayList(this.currentSong, "p", this.changeSong);
      } else {
        this.changeSong();
      }
    } else {
      this.getPlayList(this.currentSong, "b", this.changeSong);
    }
  }
  Radio.prototype.directPlay = function(sid) {
    for (id in this.heared) {
      var song = this.heared[id]
      if (song.sid == sid) {
        //重新插入列表
        this.songList.unshift(song);
        this.changeSong();
        return;
      }
    }
  }
  Radio.prototype.directToggleLike = function(sid) {
    for (id in this.heared) {
      var song = this.heared[id]
      if (song.sid == sid) {
        song.like == 0 ? this.like(song) : this.unlike(song);
        return;
      }
    }
  }
  Radio.prototype.powerOn = function(port) {
    this.audio.pause()
    this.getPlayList(this.currentSong, "n", this.changeSong)
  }
  module.exports = Radio;
});
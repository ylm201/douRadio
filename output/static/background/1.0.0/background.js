define("background/1.0.0/background",["jquery/1.10.1/jquery","underscore/1.6.0/underscore","backbone/1.1.2/backbone"],function(e){var t=e("background/1.0.0/radio"),i=t.init("#radio");window.port=null;var n=null,o=function(){chrome.cookies.get({url:"http://douban.com",name:"dbcl2"},function(e){e?chrome.cookies.set({url:"http://douban.fm",name:"dbcl2",value:e.value}):port&&port.postMessage({type:"login"})}),chrome.cookies.get({url:"http://douban.com",name:"ck"},function(e){e&&chrome.cookies.set({url:"http://douban.fm",name:"ck",value:e.value})})},r=function(){localStorage.version!=chrome.app.getDetails().version&&(window.open("options.html"),_gaq.push(["_trackEvent","update",chrome.app.getDetails().version,localStorage.version?localStorage.version:"--"]),localStorage.version=chrome.app.getDetails().version)};r(),o(),i.on("songEnded",function(e){_gaq.push(["_trackEvent","play","session"==this.kind?"session":"normal",e&&e.kbps])}),i.on("songChanged",function(e){port&&port.postMessage({type:"songChanged",obj:e}),port||i.audio.paused||"N"==localStorage.enableNotify||(n&&chrome.notifications.clear(n,function(){}),chrome.notifications.create("",{iconUrl:i.currentSong.picture,title:i.currentSong.artist,message:i.currentSong.title,type:"basic",buttons:[{title:"\u4e0b\u4e00\u9996"}],isClickable:!0},function(e){notification=e,setTimeout(function(){chrome.notifications.clear(e,function(){})},5e3),chrome.notifications.onButtonClicked.addListener(function(t,n){t==e&&0==n&&i.skip()})})),!i.audio.paused&&chrome.browserAction.setTitle({title:i.currentSong.artist+":"+i.currentSong.title})}),i.on("playing",function(e){port&&port.postMessage({type:"playing",obj:{currentTime:e.currentTime,duration:e.duration}})}),chrome.extension.onConnect.addListener(function(e){"douRadio"==e.name&&(window.port=e,e.onDisconnect.addListener(function(){window.port=void 0}),o(),e.postMessage({type:"init",obj:{currentSong:i.currentSong?i.currentSong:{title:"--",artist:"--",picture:"/img/cd.jpg",like:0},playing:!i.audio.paused,volume:i.audio.volume,isReplay:i.isReplay,time:{currentTime:i.audio.currentTime,duration:i.audio.duration},heared:i.heared}}),e.onMessage.addListener(function(e){return"skip"==e.type?void i.skip():"delete"==e.type?void i.del():"toggleLike"==e.type?void(0==i.currentSong.like?(i.like(),i.currentSong.like=1):(i.unlike(),i.currentSong.like=0)):"switch"==e.type?void i.powerOn():"togglePlay"==e.type?void(null==i.currentSong?i.powerOn():i.audio.paused?i.audio.play():i.audio.pause()):"toggleReplay"==e.type?void(i.isReplay=!i.isReplay):"changeVolume"==e.type?(i.audio.volume=e.value,void(localStorage.volume=e.value)):"changeChannel"==e.type?(localStorage.channelId=e.channel.channelId,localStorage.channelName=e.channel.channelName,localStorage.channelCollected=e.channel.channelCollected,void i.powerOn()):"directPlay"==e.type?void i.directPlay(e.sid):"directToggleLike"==e.type?void i.directToggleLike(e.sid):"analysis"==e.type?void _gaq.push(e.trackParams):void 0}))})}),define("background/1.0.0/radio",["jquery/1.10.1/jquery","underscore/1.6.0/underscore","backbone/1.1.2/backbone"],function(e,t,i){var n=e("jquery/1.10.1/jquery"),o=e("underscore/1.6.0/underscore"),r=e("backbone/1.1.2/backbone"),a=function(){this.currentSong=null,this.songList=[],this.heared=[],this.channel=0,this.audio=null,this.isReplay=!1,this.kind=""};a.init=function(e){var t=new a;return o.extend(t,r.Events),t.audio=n(e)[0],t.audio.volume=localStorage.volume?localStorage.volume:.8,localStorage.channelId||(localStorage.setItem("channelId","0"),localStorage.setItem("channelName","\u79c1\u4eba"),localStorage.setItem("channelCollected","disable")),t.audio.addEventListener("ended",function(){this.trigger("songEnded",this.currentSong);for(e in this.heared){var t=this.heared[e];t.sid==this.currentSong.sid&&this.heared.splice(e,1)}return this.heared.unshift(this.currentSong),this.heared.length>20&&this.heared.pop(),0==this.currentSong.playTimes&&this.reportEnd(),this.currentSong.playTimes++,this.isReplay?void this.audio.play():void(this.songList.length>1?this.changeSong():this.getPlayList(this.currentSong,"p",this.changeSong))}.bind(t)),t.audio.addEventListener("timeupdate",function(){this.trigger("playing",{currentTime:this.audio.currentTime,duration:this.audio.duration})}.bind(t)),t.audio.addEventListener("error",function(e){t.trigger("error","loadSongError_"+e.target.error.code+":"+t.currentSong.retryTimes),t.currentSong.retryTimes<3&&(t.currentSong.retryTimes++,t.currentSong.revoverTime=this.currentTime,this.load())}),t.audio.addEventListener("loadedmetadata",function(){t.currentSong.retryTimes>0&&t.currentSong.retryTimes<=3&&t.currentSong.revoverTime&&(this.currentTime=t.currentSong.revoverTime,t.trigger("error","revover:"+t.currentSong.retryTimes))}),t.getPlayList(void 0,"n",function(){t.changeSong("Y"!=localStorage.autoPlay)}),t},a.prototype.getPlayList=function(e,t,i){this.trigger("songListLoading",t),n.getJSON("http://douban.fm/j/mine/playlist",{type:t,channel:localStorage.channelId?localStorage.channelId:0,pb:localStorage.bitrate?localStorage.bitrate:64,sid:e?e.sid:"",pt:this.audio.currentTime,r:Math.random(),kbps:localStorage.bitrate?localStorage.bitrate:64,from:"mainsite"},function(e){if(e.err)return void this.trigger("songListLoadError",t);this.trigger("songListLoaded");var n=[];e.song.forEach(function(e){e.adtype&&"Y"==localStorage.filterAd?console.log("filter song"+JSON.stringify(e)):(e.picture=e.picture.replace("mpic","lpic"),e.retryTimes=0,e.playTimes=0,n.push(e))}),this.kind=e.kind,n.length>0&&(this.songList=n),i&&i.bind(this)()}.bind(this))},a.prototype.report=function(e,t){n.getJSON("http://douban.fm/j/mine/playlist",{type:e,channel:localStorage.channelId?localStorage.channelId:0,pb:localStorage.bitrate?localStorage.bitrate:64,sid:t?t.sid:this.currentSong.sid,pt:this.audio.currentTime,r:Math.random(),kbps:localStorage.bitrate?localStorage.bitrate:64,from:"mainsite"},function(e){e.err}.bind(this))},a.prototype.reportEnd=function(){n.get("http://douban.fm/j/mine/playlist",{type:"e",sid:this.currentSong.sid,channel:localStorage.channel?localStorage.channel.channelId:61,from:"mainsite"})},a.prototype.changeSong=function(e){this.currentSong=this.songList.shift(),(new Image).src=this.currentSong.picture,this.audio.src=this.currentSong.url,!e&&this.audio.play(),this.trigger("songChanged",this.currentSong)},a.prototype.skip=function(){this.audio.pause(),"session"==this.kind?(this.report("s"),this.songList.length<=1?(this.trigger("songListLoading","s"),this.getPlayList(this.currentSong,"p",this.changeSong)):this.changeSong()):this.getPlayList(this.currentSong,"s",this.changeSong)},a.prototype.like=function(e){e?e.like=1:this.currentSong.like=1,"session"==this.kind?this.report("r",e):this.getPlayList(e?e:this.currentSong,"r")},a.prototype.unlike=function(e){e?e.like=0:this.currentSong.like=0,"session"==this.kind?this.report("u",e):this.getPlayList(this.currentSong,"u")},a.prototype.del=function(){this.audio.pause(),"session"==this.kind?(this.report("b"),this.songList.length<=1?(this.trigger("songListLoading","b"),this.getPlayList(this.currentSong,"p",this.changeSong)):this.changeSong()):this.getPlayList(this.currentSong,"b",this.changeSong)},a.prototype.directPlay=function(e){for(id in this.heared){var t=this.heared[id];if(t.sid==e)return this.songList.unshift(t),void this.changeSong()}},a.prototype.directToggleLike=function(e){for(id in this.heared){var t=this.heared[id];if(t.sid==e)return void(0==t.like?this.like(t):this.unlike(t))}},a.prototype.powerOn=function(){this.audio.pause(),this.getPlayList(this.currentSong,"n",this.changeSong)},i.exports=a});
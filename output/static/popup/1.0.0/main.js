define("popup/1.0.0/main",["jquery/1.10.1/jquery","backbone/1.1.2/backbone","underscore/1.6.0/underscore"],function(e){var t,a,n=e("jquery/1.10.1/jquery"),l=(e("backbone/1.1.2/backbone"),e("popup/1.0.0/models/player")),o=e("popup/1.0.0/view/popup"),s=e("popup/1.0.0/view/channels"),i=e("popup/1.0.0/view/history"),r=chrome.extension.connect({name:"douRadio"});n("body").on("click","[seed]",function(){var e=n(this).attr("seed"),t=e.split("_");2==t.length?r.postMessage({type:"analysis",trackParams:["_trackEvent",t[0],t[1]]}):3==t.length&&r.postMessage({type:"analysis",trackParams:["_trackEvent",t[0],t[1],t[2]]})}),r.onMessage.addListener(function(e){"init"==e.type&&(t=new l(e.obj),a=new o({model:t}),a.port=r,channelsView=new s({player:t}),channelsView.port=r,historyView=new i({model:e.obj.heared}),historyView.port=r),"songChanged"==e.type&&t.set({currentSong:e.obj}),"songListLoading"==e.type&&(t.set({loadType:e.obj}),t.set({loading:!0})),"songListLoaded"==e.type&&(t.set({loadType:e.obj}),t.set({loading:!1})),"playing"==e.type&&t.set({time:e.obj}),"login"==e.type&&n("#notify").show()}),n("#notify_close").on("click",function(){n("#notify").hide()})}),define("popup/1.0.0/models/player",["backbone/1.1.2/backbone","underscore/1.6.0/underscore","jquery/1.10.1/jquery"],function(e,t,a){var n=e("backbone/1.1.2/backbone"),l=n.Model.extend({});a.exports=l}),define("popup/1.0.0/view/popup",["backbone/1.1.2/backbone","underscore/1.6.0/underscore","jquery/1.10.1/jquery"],function(e,t,a){var n,l,o,s;n=e("backbone/1.1.2/backbone"),l=e("jquery/1.10.1/jquery"),o=e("underscore/1.6.0/underscore"),s=e("popup/1.0.0/share"),PopupView=n.View.extend({el:"#main",template:o.template(l("#t_songInfo").html()),events:{"click #J-toggle-play":"togglePlay","click #J-btn-skip":"skip","click #J-btn-like":"like","click #J-btn-delete":"delete","click #J-btn-channel":"showChannels","click #J-btn-history":"showHistory","click #J-replay":"replay","click .J-social-share":"share","mouseover .play-btn-wrapper":"fadeOutCD","mouseout .play-btn-wrapper":"fadeInCD","input #range":"volume"},initialize:function(){this.render(),this.listenTo(this.model,"change:currentSong",this.changeSong),this.listenTo(this.model,"change:time",this.playing)},render:function(){var e=this.template(this.model.attributes);this.$el.html(e),this.playing()},realModel:function(){return this.model.attributes},togglePlay:function(){this.model.set({playing:!this.model.get("playing")}),this.port.postMessage({type:"togglePlay"}),l("#cover").toggleClass("fn-rotating-paused"),this.realModel().playing?(l("#J-toggle-play").addClass("playing").removeClass("paused"),l("#cover").removeClass("fadeout")):(l("#J-toggle-play").removeClass("playing").addClass("paused"),l("#cover").addClass("fadeout"))},skip:function(e){this.port.postMessage({type:"skip"}),l(e.target.parentNode).addClass("fn-rotating"),l("#cover").addClass("fadeout").addClass("fn-rotating-paused")},like:function(){this.port.postMessage({type:"toggleLike"}),l("#J-btn-like").toggleClass("like").toggleClass("unlike")},"delete":function(e){this.port.postMessage({type:"delete"}),l(e.target.parentNode).addClass("fn-rotating"),l("#cover").addClass("fadeout").removeClass("fn-rotating-paused")},changeSong:function(){this.model.set({playing:!this.model.get("playing")});var e=this.model.get("currentSong"),t=e.picture,a=l("#cover");a.fadeOut("150",function(){var e=new Image;e.src=t,l(e).load(function(){a.removeClass("fadeout").removeClass("fn-rotating-paused"),a.css("background-image","url("+t+")"),a.fadeIn("350")})}),this.realModel().playing&&l("#J-toggle-play").addClass("playing").removeClass("paused").hide(),l("#J-song-title").html(e.title).attr("title",e.title),l("#J-song-artist").html(e.artist+"--"+e.albumtitle).attr("title",e.artist+"--"+e.albumtitle).attr("href","http://music.douban.com"+e.album),l("#J-btn-like").attr("class",1==e.like?"button like":"button unlike"),l("#controller li").removeClass("fn-rotating")},playing:function(){var e=this.model.get("time"),t=e.duration-e.currentTime,a=parseInt(t/60),n=parseInt(t%60);n=10>n?"0"+n:n,l("#timer").html(a+":"+n),l("#played").width(e.currentTime/e.duration*100+"%")},fadeOutCD:function(){this.model.get("playing")&&(l("#cover").addClass("fadeout"),l("#J-toggle-play").show())},fadeInCD:function(){this.model.get("playing")&&(l("#cover").removeClass("fadeout"),l("#J-toggle-play").hide())},share:function(e){s[l(e.target).attr("share_target")](this.model.get("currentSong"))},replay:function(){this.model.set({isReplay:!this.model.get("isReplay")}),l("#J-replay").toggleClass("fn-hover-fadein"),this.port.postMessage({type:"toggleReplay"})},volume:function(e){this.port.postMessage({type:"changeVolume",value:e.target.value/100})},showChannels:function(){"true"==l("#J-btn-channel").attr("slided")?l(".container").animate({left:"-180px"},500,function(){l("#J-btn-channel").attr("slided","false")}):l(".container").animate({left:"-360px"},500,function(){l("#J-btn-channel").attr("slided","true")})},showHistory:function(){"true"==l("#J-btn-history").attr("slided")?l(".container").animate({left:"-180px"},500,function(){l("#J-btn-history").attr("slided","false")}):l(".container").animate({left:"0px"},500,function(){l("#J-btn-history").attr("slided","true")})}}),a.exports=PopupView}),define("popup/1.0.0/share",[],function(e,t,a){var n={weibo:function(e){url="http://douban.fm/?start="+e.sid+"g"+e.ssid+"g0&cid=0";var t=e.picture&&e.picture.replace(/mpic|spic/,"lpic"),a="\u5206\u4eab"+e.artist+"\u7684\u5355\u66f2\u300a"+e.title+"\u300b(\u6765\u81ea@\u8c46\u74e3FM)";window.open("http://service.weibo.com/share/share.php?url="+encodeURIComponent(url)+"&appkey=694135578&title="+encodeURIComponent(a)+"&pic="+encodeURIComponent(t)+"&language=zh-cn","_blank","width=615,height=505")},douban:function(e){url="http://douban.fm/?start="+e.sid+"g"+e.ssid+"g0&cid=0";{var t=e.picture&&e.picture.replace(/mpic|spic/,"lpic");"\u5206\u4eab"+e.artist+"\u7684\u5355\u66f2\u300a"+e.title+"\u300b(\u6765\u81ea@\u8c46\u74e3FM)"}window.open("http://shuo.douban.com/!service/share?name="+encodeURIComponent(e.title)+"&href="+encodeURIComponent(url)+"&image="+encodeURIComponent(t)+"&desc=by\u5c0f\u8c46(http://goo.gl/iRxds)&apikey=0458f5fa0cd49e2a0d0ae1ee267dda7e&target_type=rec&target_action=0&object_kind=3043&object_id="+e.sid+"action_props="+encodeURIComponent('%7B"url"%3A "http://t.cn/zOxAHIV"%2C "title" "'+e.artist+"--"+e.title+'"%7D'),"_blank","width=615,height=505")}};a.exports=n}),define("popup/1.0.0/view/channels",["backbone/1.1.2/backbone","underscore/1.6.0/underscore","jquery/1.10.1/jquery"],function(e,t,a){var n,l,o;n=e("backbone/1.1.2/backbone"),l=e("jquery/1.10.1/jquery"),o=e("underscore/1.6.0/underscore");var s=n.View.extend({el:"#channels",template:o.template(l("#t_channels").html()),templateFav:o.template(l("#t_favchannels").html()),initialize:function(){o.bindAll(this,"renderPublic","renderPrivate");var e=n.Model.extend({url:"https://api.douban.com/v2/fm/app_channels"});this.channels=new e;var t=n.Model.extend({url:"http://douban.fm/j/fav_channels"});this.favChannels=new t,this.favChannels.fetch({success:this.renderPrivate}),this.channels.fetch({success:this.renderPublic}),l("#currentChannel").html(localStorage.channelName),"true"==localStorage.channelCollected||"false"==localStorage.channelCollected?l.get("http://douban.fm/j/explore/is_fav_channel?cid="+localStorage.channelId,function(e){l("#J-fav-channel").attr("cid",localStorage.channelId).attr("collected",e.data.res.is_fav),e.data.res.is_fav?l("#J-fav-channel").addClass("star").removeClass("unstar"):l("#J-fav-channel").addClass("unstar").removeClass("star")}):l("#J-fav-channel").attr("cid",localStorage.channelId).hide()},events:{"click .J-channel-item":"changeChannel","click #J-fav-channel":"favChannel","click .J-btn-unfav-channel":"unfavChannel"},renderPublic:function(){l("#public-channel").html(this.template(this.channels.attributes))},renderPrivate:function(){l("#private-channel").html(this.templateFav(this.favChannels.attributes))},changeChannel:function(e){var t=l(e.target);l("#channels li").removeClass("item-selected"),l(e.target.parentNode).addClass("item-selected"),l("#currentChannel").html(t.attr("title")).attr("title",t.attr("title")),"true"==t.attr("collected")?l("#J-fav-channel").addClass("star").removeClass("unstar").show():"false"==t.attr("collected")?l("#J-fav-channel").addClass("unstar").removeClass("star").show():l("#J-fav-channel").hide(),l("#J-fav-channel").attr("cid",t.attr("cid")).attr("collected",t.attr("collected")),l("#J-btn-channel").attr("title",t.attr("title")),l("#cover").addClass("fadeout").addClass("fn-rotating-paused"),this.port.postMessage({type:"changeChannel",channel:{channelId:t.attr("cid"),channelName:t.attr("title"),channelCollected:t.attr("collected")}})},favChannel:function(){var e,t=l("#J-fav-channel");if("true"==t.attr("collected"))e="http://douban.fm/j/explore/unfav_channel?cid=";else{if("false"!=t.attr("collected"))return;e="http://douban.fm/j/explore/fav_channel?cid="}l.get(e+t.attr("cid"),function(e){1==e.status&&(localStorage.channelCollected="true"==t.attr("collected")?"false":"true","true"==localStorage.channelCollected?t.addClass("star").removeClass("unstar"):l("#J-fav-channel").addClass("unstar").removeClass("star"),t.attr("collected",localStorage.channelCollected))})},unfavChannel:function(e){var t=l(e.target);return l.get("http://douban.fm/j/explore/unfav_channel?cid="+t.attr("cid"),function(e){1==e.status&&(t.parent().fadeOut(500),l("#J-fav-channel").attr("cid")==t.attr("cid")&&(l("#J-fav-channel").attr("collected","false"),localStorage.channelCollected="false",l("#J-fav-channel").addClass("unstar").removeClass("star")))}),!1}});a.exports=s}),define("popup/1.0.0/view/history",["backbone/1.1.2/backbone","underscore/1.6.0/underscore","jquery/1.10.1/jquery"],function(e,t,a){var n,l,s;n=e("backbone/1.1.2/backbone"),l=e("jquery/1.10.1/jquery"),s=e("underscore/1.6.0/underscore"),HistoryView=n.View.extend({el:"#history",template:s.template(l("#t_historyList").html()),events:{"click .J-direct-play":"directPlay","click .J-direct-toggle-like":"directToggleLike"},initialize:function(){this.render()},render:function(){var e=this.template({historyList:this.model});this.$el.html(e)},directPlay:function(e){console.debug("directPlay"),this.port.postMessage({type:"directPlay",sid:l(e.target).attr("sid")})},directToggleLike:function(e){l(e.target).toggleClass("like").toggleClass("unlike"),this.port.postMessage({type:"directToggleLike",sid:l(o.target).attr("sid")})}}),a.exports=HistoryView});
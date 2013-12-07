define(function(require, exports, module) {
	
	var radio=require("./radio").init("#radio");
	var hasLogin=false;
	window.port=null;
	var notification=null;
    chrome.cookies.get({
        url:"http://douban.com",
        name:"dbcl2"        
    },function(cookie){        
        if(cookie){
            chrome.cookies.set({
                url:"http://douban.fm",
                name:"dbcl2",
                value:cookie.value
            })
        }
    })
	//歌曲切换
	radio.on("songChanged",function(currentSong){
		port&&port.postMessage({type:'songChanged',obj:currentSong});
		if(!port&&!radio.audio.paused){
			if(notification)  notification.cancel();
			notification = webkitNotifications.createNotification(radio.currentSong.picture,radio.currentSong.artist,radio.currentSong.title);
            notification.show();
            setTimeout(function(){
                notification.cancel();
            },5000)
		}
		!radio.audio.paused&&chrome.browserAction.setTitle({title:radio.currentSong.artist+":"+radio.currentSong.title});
	})
	
	//正在载入播放列表
	radio.on("songListLoading",function(t){
		port&&port.postMessage({type:'songListLoading',obj:t});
	})
	
	//播放列表已载入
	radio.on("songListLoaded",function(t){
		port&&port.postMessage({type:'songListLoaded',obj:t});
	})
	
	//歌曲播放中
	radio.on("playing",function(time){
		port&&port.postMessage({type:'playing',obj:{currentTime:time.currentTime,duration:time.duration}});
	})
	
	chrome.extension.onConnect.addListener(function(port){
		if(port.name!="douRadio") return;
		window.port=port;
		port.onDisconnect.addListener(function(){
			window.port=undefined;
		})	
		port.postMessage(
		{
			type:"init",
			obj:{
				currentSong:radio.currentSong?radio.currentSong:{title:'--',artist:'--',picture:'/img/cd.jpg',like:0},
				playing:!radio.audio.paused,
				volume:radio.audio.volume,
				isReplay:radio.isReplay,
				time:{currentTime:radio.audio.currentTime,duration:radio.audio.duration}
			}
		})
		port.onMessage.addListener(function(request){
			if(request.type=="skip"){
				radio.skip();
				return
			}
			if(request.type=="delete"){
				radio.del();
				return
			}
			if(request.type=="toggleLike"){
				if(radio.currentSong.like==0){
					radio.like()
					radio.currentSong.like=1;
				}else{
					radio.unlike()
					radio.currentSong.like=0;
				}
				return
			}
			if(request.type=="switch"){
				radio.powerOn()
				return
			}
			if(request.type=="togglePlay"){
				if(radio.currentSong==null){
					radio.powerOn();
				}else{
					radio.audio.paused?radio.audio.play():radio.audio.pause();
				}
				return
			}
			if(request.type=='toggleReplay'){
				radio.isReplay=!radio.isReplay;
			}
			if(request.type=="changeVolume"){
				radio.audio.volume=request.value
				return
			}
			if(request.type=='changeChannel'){
				localStorage['channelId']=request.channel.channelId;
				localStorage['channelName']=request.channel.channelName;
				localStorage['channelCollected']=request.channel.channelCollected;
				radio.powerOn();
			}
			return;
		})
	})
});
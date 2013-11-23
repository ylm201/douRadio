define(function(require, exports, module) {
	
	var radio=require("radio").init("#radio");
	
	//歌曲切换
	radio.on("songChanged",function(currentSong){
		port&&port.postMessage({type:'currentSong',currentSong:currentSong});
		//TODO notify逻辑
	})
	
	//正在载入播放列表
	radio.on("songListLoading",function(currentSong){
		port&&port.postMessage({type:'songListLoading',currentSong:currentSong});
	})
	
	//播放列表已载入
	radio.on("songListLoaded",function(currentSong){
		port&&port.postMessage({type:'songListLoaded',currentSong:currentSong});
	})
	
	//歌曲播放中
	radio.on("playing",function(time){
		port&&port.postMessage({type:'playing',time:time});
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
			song:radio.currentSong,
			power:radio.power,
			pause:radio.audio.paused,
			volume:radio.audio.volume
		})
		port.onMessage.addListener(function(request){
			if(request.type=="power"){
				radio.power?radio.powerOff():radio.powerOn();
				return;
			}
			if(request.type=="skip"){
				radio.skip(port);
				return
			}
			if(request.type=="delete"){
				radio.del();
				return
			}
			if(request.type=="like"){
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
			if(request.type=="pause"){
				radio.audio.paused==true?radio.audio.play():radio.audio.pause()
				return
			}
			if(request.type=="volume"){
				radio.audio.volume=request.vol
				return
			}
			return;
		})
	})
}
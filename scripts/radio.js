/**
 * 封装radio操作
 * */
var Radio=function(){
	this.c_song={};
	this.song_list=[];
	this.channel=0;
	this.power=false;
	this.audio=null;
	this.power=false;
	this.uid='';
	this.heared='';
	this.red=new Red()
}

/**
 *初始化播放器
 * */
Radio.init=function(audio){
	console.log("init radio...")
	var radio=new Radio()
	radio.audio=audio
	radio.channel=localStorage['channel']?localStorage['channel']:1		
	//douban.fm的cookie是session级别，从豆瓣主站获取dbcl2的cookie到
	chrome.cookies.get({
		url:"http://douban.com",
		name:"dbcl2"	
	},function(b){	

		if(b){
			chrome.cookies.set({
				url:"http://douban.fm",
				name:"dbcl2",
				value:b.value
			})
		}
	})
	return radio	
}

/**
 *获取播放列表
 * */
Radio.prototype.getPlayList=function(t,skip,callback){
	var self =this
	if(skip){
		this.audio.pause()
	}
	var self=this
	$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:this.channel=="-1"?0:this.channel,
			h:this.heared,
			sid:this.c_song? this.c_song.sid:'',
			r:Math.random(),
			from:"mainsite"
		},function(data){
			var songs=data.song
			if(localStorage.channel!="-1"){
				for(s in songs){
					self.song_list[s]=songs[s]
				}
			}else{
				self.song_list=self.red.getSongList()
			}
			if(skip){
				self.changeSong(t,callback)
			}
		})
}

Radio.prototype.reportEnd=function(){
	temp=this.heared.split("|")
	temp.push(this.c_song.sid+":"+"p")
	this.heared=temp.slice(-20).join("|")
	$.get("http://douban.fm/j/mine/playlist",{
			type:'e',
			sid:this.c_song.sid,
			channel:this.channel,
			from:"mainsite"	
		})		
}

Radio.prototype.changeSong=function(t,callback){
	var c=localStorage.channel?localStorage.channel:"0"
	_gaq.push(['_trackEvent', 'channel' + c, 'played']);	
	this.c_song=this.song_list.shift();
	if(t!='n'){
		h_songs=this.heared.split("|");
		h_songs.push(this.c_song.sid+":"+t);
		this.heared=h_songs.slice(-20).join("|")
	}
	this.audio.src=this.c_song.url
	this.audio.play()
	callback(this.c_song)
	if(this.song_list.length<=0){
		this.getPlayList("p",false)
	}
}

Radio.prototype.skip=function(c){
	this.getPlayList("s",true,c)	
}

Radio.prototype.like=function(){
	this.getPlayList("r",false)
}

Radio.prototype.unlike=function(){
	this.getPlayList("u",false)
}

Radio.prototype.del=function(){
	this.getPlayList("b",true,c)
}

Radio.prototype.powerOn=function(c){
	this.power=true
	this.red.init()
	this.getPlayList("n",true,c)
}

Radio.prototype.powerOff=function(){
	this.power=false
	this.audio.pause()
}

var radio=Radio.init(document.getElementById("radio"));
radio.audio.addEventListener("ended",function(){
	radio.reportEnd()
	radio.changeSong("p",function(song){
		chrome.extension.sendRequest({song:song,type:"end"})
	})
	var notification = webkitNotifications.createHTMLNotification('notification.html');
	notification.show();
})

radio.audio.addEventListener("timeupdate",function(){
	chrome.extension.sendRequest({type:"timeUpdate",
		c:this.currentTime,
		d:this.duration
	})
})
chrome.extension.onRequest.addListener(function(request,sender,callback){
	console.log("type:"+request.type)
	if(request.type=="init"){
		callback({song:radio.c_song,power:radio.power})
		return
	}
	if(request.type=="on_off"){
		radio.power?radio.powerOff():radio.powerOn(callback)
		return;
	}
	if(!radio.power){return}
	if(request.type="skip"){
		radio.skip(callback)
		return
	}
	if(request.type=="delete"){
		radio.del(callback)
		return
	}
	if(request.type=="like"){
		radio.c_song.like==0?radio.like():radio.unlike()
		callback(radio.c_song)
		return
	}
	if(request.type=="skip"){
		radio.skip(callback)
		return
	}
	if(request.type=="update"){
		radio.audio.addEventListener("timeupdate",function(){
			callback(radioaudio.currentTime,radio.audio.duration)
		})
		return
	}
	if(request.type=="end"){
		radio.audio.addEventListener("end",function(){
			radio.reportEnd()
			radio.changeSong("p",callback)
			var notification = webkitNotifications.createHTMLNotification('notification.html');
			notification.show();
		})
	}
	return;
})


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
	//this.red=new Red()
}

/**
 *初始化播放器
 * */
Radio.init=function(audio){
	var radio=new Radio()
	radio.audio=audio
	radio.audio.volume=localStorage.volume?localStorage.volume:0.8
	radio.channel=localStorage['channel']?localStorage['channel']:1		
	//douban.fm的cookie是session级别，从douban.com获取dbcl2的cookie到douban.fm
	chrome.cookies.get({
		url:"http://douban.com",
		name:"dbcl2"	
	},function(b){	
		if(b){
			console.info("get cookie:"+b.value)
			chrome.cookies.set({
				url:"http://douban.fm",
				name:"dbcl2",
				value:b.value
			})
		}else{
			console.warn("failed to get cookie!")
		}
	})
	return radio	
}

/**
 *获取播放列表
 * */
Radio.prototype.getPlayList=function(t,skip,port){
	if(t!="r"||t!="u"){
		port&&port.postMessage({type:"loadingList"})
	}
	var self =this
	$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:localStorage.channel=="-1"?0:localStorage.channel,
			h:this.heared,
			sid:this.c_song? this.c_song.sid:'',
			r:Math.random(),
			from:"mainsite"
		},function(data){
			port&&port.postMessage({type:"loadedList"})
			var songs=data.song
			if(localStorage.channel!="-1"){
				for(s in songs){
					self.song_list.push(songs[s])
				}
			}else{
				//self.song_list=self.red.getSongList()
			}
			if(skip){
				//日志打印
				console.info("---------------------")
				for(s in self.song_list){
					console.info(self.song_list[s].title+"--"+self.song_list[s].artist)
				}
				self.changeSong(t,port)
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

Radio.prototype.changeSong=function(t,port){
	var c=localStorage.channel?localStorage.channel:"0"
	_gaq.push(['_trackEvent', 'channel' + c, 'played']);	
	this.c_song=this.song_list.shift();
	//console.log("get new song "+this.c_song.artist+"--"+this.c_song.title)
	//歌曲小于两首时加载
	if(this.song_list.length<=2){
		this.getPlayList("p",false,port)
	}
	if(t!='n'){
		h_songs=this.heared.split("|");
		h_songs.push(this.c_song.sid+":"+t);
		this.heared=h_songs.slice(-20).join("|")
	}
	this.audio.src=this.c_song.url
	this.audio.play()
	port&&port.postMessage({type:"song",song:radio.c_song})
}

Radio.prototype.skip=function(c){
	this.changeSong("s",c)	
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

Radio.prototype.powerOn=function(port){
	this.power=true
	//this.red.init()
	this.getPlayList("n",true,port)
}

Radio.prototype.powerOff=function(port){
	this.power=false
	this.audio.pause()
	port.postMessage({type:"song",song:{}})
}

var radio=Radio.init(document.getElementById("radio"));
var p;
radio.audio.addEventListener("ended",function(){
	radio.reportEnd()
	radio.changeSong("p",p)
	var notification = webkitNotifications.createHTMLNotification('notification.html');
	notification.show();
})

radio.audio.addEventListener("error",function(e){
	console.error("error on load audio!")
	window.e&&console.log(e)
})

var onTimeUpdate=function(){
	var r=radio.audio;
	p&&p.postMessage({type:"timeUpdate",
		c:r.currentTime,
		d:r.duration
	})
}

//交互事件
chrome.extension.onConnect.addListener(function(port){
	if(port.name!="douRadio") return
	p=port
	radio.power&&port.postMessage(
	{
		type:"init",
		song:radio.c_song,
		power:radio.power,
		pause:radio.audio.paused,
		c:radio.audio.currentTime,
		d:radio.audio.duration,
		volume:radio.audio.volume
	})
	port.onDisconnect.addListener(function(){
		p=undefined;
		radio.audio.removeEventListener("timeupdate",onTimeUpdate)
	})
	radio.audio.addEventListener("timeupdate",onTimeUpdate)		
	port.onMessage.addListener(function(request){
		if(request.type=="on_off"){
			radio.power?radio.powerOff(port):radio.powerOn(port);
			return;
		}
		if(!radio.power){return}
		if(request.type=="skip"){
			radio.skip(port);
			return
		}
		if(request.type=="delete"){
			radio.del(port);
			return
		}
		if(request.type=="like"){
			if(radio.c_song.like==0){
				radio.like()
				radio.c_song.like=1;
			}else{
				radio.unlike()
				radio.c_song.like=0;
			}
			port.postMessage({type:"rate",like:radio.c_song.like})
			return
		}
		if(request.type=="switch"){
			radio.powerOn(port)
		}
		if(request.type=="pause"){
			radio.audio.paused==true?radio.audio.play():radio.audio.pause()
			return
		}
		if(request.type=="volume"){
			radio.audio.volume=request.vol
			localStorage.volume=vol
		}
		return;
	})
})

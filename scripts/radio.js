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
	this.checked=false;
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
	if(skip){
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
			if(t=="n") self.song_list=[]
			if(localStorage.channel!="-1"){
				for(s in songs){
					songs[s].sid&&self.song_list.push(songs[s])
				}
			}else{
				//self.song_list=self.red.getSongList()
			}
			if(self.song_list.length>20) self.song_list=self.song_list.slice(-20)						
			//日志打印
			//if(t=="p"){
				console.info("----------------------------------------------")
				for(s in self.song_list){
					console.info(self.song_list[s].title+"--"+self.song_list[s].artist)
				}	
			//}
			skip&&self.changeSong(t,port)
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
	this.audio.pause()
	if(this.song_list.length<=0){
		this.getPlayList("p",true,port)
		return
	}
	var c=localStorage.channel?localStorage.channel:"0"
	_gaq.push(['_trackEvent', 'channel' + c, 'played']);	
	this.c_song=this.song_list.shift();
	//if(this.song_list.length==2){
	//	this.getPlayList("p",false,port)
	//}
	if(t!='n'){
		h_songs=this.heared.split("|");
		h_songs.push(this.c_song.sid+":"+t);
		this.heared=h_songs.slice(-20).join("|")
	}
	this.audio.src=this.c_song.url
	this.audio.play()
	if(port){
		port.postMessage({type:"song",song:radio.c_song})
	}else{
		var notification = webkitNotifications.createHTMLNotification('notification.html');
		notification.show();
	}
}

Radio.prototype.skip=function(p){
	this.changeSong("s",p)	
}

Radio.prototype.like=function(){
	this.getPlayList("r",false)
}

Radio.prototype.unlike=function(){
	this.getPlayList("u",false)
}

Radio.prototype.del=function(p){
	this.audio.pause()
	this.getPlayList("b",true,p)
}

Radio.prototype.powerOn=function(port){
	this.power=true
	//this.red.init()
	this.getPlayList("n",true,port)
}

Radio.prototype.powerOff=function(port){
	this.power=false
	radio.audio.removeEventListener("timeupdate",onTimeUpdate)
	this.audio.pause()
	this.audio.src=null
	this.c_song={}
	port.postMessage({type:"song",song:{}})
}

var radio=Radio.init(document.getElementById("radio"));
var p;
radio.audio.addEventListener("ended",function(){
	radio.reportEnd()
	radio.changeSong("p",p)
})

radio.audio.addEventListener("error",function(e){
	console.error("error on load audio!",e)
})

var onTimeUpdate=function(){
	var r=radio.audio;
	p&&p.postMessage({type:"timeUpdate",
		c:radio.power?r.currentTime:0,
		d:radio.power?r.duration:0
	})
}

//交互事件
chrome.extension.onConnect.addListener(function(port){
	if(port.name!="douRadio") return
	radio.audio.addEventListener("timeupdate",onTimeUpdate)	
	p=port
	port.postMessage(
	{
		type:"init",
		song:radio.c_song,
		power:radio.power,
		pause:radio.audio.paused,
		c:radio.power?radio.audio.currentTime:0,
		d:radio.power?radio.audio.duration:0,
		volume:radio.audio.volume,
		checked:radio.checked
	})
	port.onDisconnect.addListener(function(){
		p=undefined;
		radio.audio.removeEventListener("timeupdate",onTimeUpdate)
	})	
	port.onMessage.addListener(function(request){
		if(request.type=="on_off"){
			radio.power?radio.powerOff(port):radio.powerOn(port);
			return;
		}
		if(request.type=="checked"){
			radio.checked=true;
			return
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
			return
		}
		if(request.type=="pause"){
			radio.audio.paused==true?radio.audio.play():radio.audio.pause()
			return
		}
		if(request.type=="volume"){
			radio.audio.volume=request.vol
			localStorage.volume=request.vol
			return
		}
		return;
	})
})

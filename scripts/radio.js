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
}

/**
 *初始化播放器
 * */
Radio.init=function(audio){
	$.ajaxSetup({async:false})
	console.log("init radio...")
	var radio=new Radio()
	radio.audio=audio
	radio.channel=localStorage['channel']?localStorage['channel']:0	
	audio.addEventListener("ended",function(){
		radio.reportEnd()
		radio.changeSong("p")
	})
	
	//获取douban.com上的cookie，添加到douban.fm上
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
			radio.uid=b.value.split(":")[0]
		}
	})
	return radio	
}

/**
 *获取播放列表
 * */
Radio.prototype.getPlayList=function(t,skip){
	var self =this
	$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:this.channel,
			h:this.heared,
			sid:this.c_song? this.c_song.sid:'',
			r:Math.random(),
			uid:this.uid
		},function(data){
			var songs=data.song
			for(s in songs){
				self.song_list[s]=songs[s]
			}
		})
	if(skip){
		this.changeSong(t)
	}
}

Radio.prototype.onGetPlayList=function(data){
	console.log(this)
}


Radio.prototype.reportEnd=function(){
	temp=this.heared.split("|")
	temp.push(this.c_song.sid+":"+"p")
	this.heared=temp.slice(-20).join("|")
	$.get("http://douban.fm/j/mine/playlist",{
			type:'e',
			sid:this.c_song.sid,
			channel:this.channel	
		})		
}

Radio.prototype.changeSong=function(t){
	this.c_song=this.song_list.shift();
	if(t!='n'){
		h_songs=this.heared.split("|");
		h_songs.push(this.c_song.sid+":"+t);
		this.heared=h_songs.slice(-20).join("|")
	}
	this.audio.pause()
	console.log("get next song: "+this.c_song.sid)
	this.audio.src=this.c_song.url
	this.audio.load()
	this.audio.play()
	if(this.song_list.length<=0){
		console.log("get new song list")
		this.getPlayList("p",false)
	}
}

Radio.prototype.skip=function(){
	this.getPlayList("s",true)	
}

Radio.prototype.like=function(){
	this.getPlayList("r",false)
}

Radio.prototype.unlike=function(){
	this.getPlayList("u",false)
}

Radio.prototype.del=function(){
	this.getPlayList("b",true)
}

Radio.prototype.powerOn=function(){
	this.power=true
	this.getPlayList("n",true)
}

Radio.prototype.powerOff=function(){
	this.power=false
	this.audio.pause()
}

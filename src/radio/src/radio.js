define(function(require, exports, module) {
	var $=require("jquery");
	var Events=require("events");
	var Radio=function(){
		this.currentSong={};
		this.songList=[];
		this.channel=0;
		this.power=false;
		this._audio=null;
	};
	Events.mixTo(Radio);
	Radio.init=function(id){
		var radio=new Radio();
		radio.audio=$(id);
		radio.audio.volume=localStorage.volume?localStorage.volume:0.8;
		radio.channel=localStorage['channel']?localStorage['channel']:61;
		this.audio.addEventListener("ended",(function(){
			this.reportEnd();
			if(this.songList.length>1){
				this.changeSong();
			}else{
				this.getPlayList("p",that.changeSong);
			}
		}).bind(this));
		this.audio.addEventListener("timeupdate",(function(){
			this.tiggle("playing",{currentTime:this.audio.currentTime,duration:this.audio.duration});
		}).bind(this));
		return radio;
	};
	
	Radio.prototype.getPlayList=function(t,fn){
		this.tiggle("songListLoading")
		$.getJSON("http://douban.fm/j/mine/playlist",{
				type:t,
				channel:this.channel,
				pb:localStorage.pb?localStorage.pb:128,
				sid:this.currentSong? this.currentSong.sid:'',
				r:Math.random(),
				from:"mainsite"
			},(function(data){
				if(data.err){
					this.tiggle("songListLoadError");
					return;
				}
				this.tiggle("songListLoaded")
				this.songList=data.song;
				fn&&fn();		
		}).bind(this))
	}

	Radio.prototype.reportEnd=function(){
		$.get("http://douban.fm/j/mine/playlist",{
				type:'e',
				sid:this.currentSong.sid,
				channel:localStorage['channel']?localStorage['channel']:61,
				from:"mainsite"	
		})		
	}

	Radio.prototype.changeSong=function(){
		this._audio.pause();
		this.currentSong=this.songList.shift();
		this.audio.src=this.currentSong.url;
		this.audio.play();
		this.tiggle("songChanged",this.currentSong);
	}

	Radio.prototype.skip=function(){
		this.audio.pause();
		this.getPlayList("s",this.changeSong)	
	}

	Radio.prototype.like=function(){
		this.getPlayList("r")
	}

	Radio.prototype.unlike=function(){
		this.getPlayList("u")
	}

	Radio.prototype.del=function(){
		this.audio.pause();
		this.getPlayList("b",true,this.changeSong);
	}

	Radio.prototype.powerOn=function(port){
		this.audio.pause()
		this.getPlayList("n",true,port)
	}

	Radio.prototype.powerOff=function(port){
		this.power=false
		radio.audio.removeEventListener("timeupdate",onTimeUpdate)
		this.audio.pause()
		this.audio.src=null
		this.currentSong={}
		port.postMessage({type:"song",song:{}})
	}
	
	exports.Radio=Radio;
	
});
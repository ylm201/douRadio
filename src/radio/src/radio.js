define(function(require, exports, module) {
	var $=require("$");
	var _ = require('underscore');
	var Backbone=require('backbone');
	var Radio=function(){
		this.currentSong=null;
		this.songList=[];
		this.channel=0;
		this.audio=null;
		this.isReplay=false;
	};
	Radio.init=function(id){
		var radio=new Radio();
		_.extend(radio,Backbone.Events);
		radio.audio=$(id)[0];
		radio.audio.volume=localStorage.volume?localStorage.volume:0.8;
		radio.channel=localStorage['channel']?localStorage['channel']:-3;
		radio.audio.addEventListener("ended",(function(){
			if(this.isReplay){
				this.audio.play();
				return;
			}
			this.reportEnd();
			if(this.songList.length>1){
				this.changeSong();
			}else{
				this.getPlayList("p",this.changeSong);
			}
		}).bind(radio));
		radio.audio.addEventListener("timeupdate",(function(){
			this.trigger("playing",{currentTime:this.audio.currentTime,duration:this.audio.duration});
		}).bind(radio));
		radio.getPlayList('n',function(){
			radio.changeSong(true);
		})
		return radio;
	};
	
	Radio.prototype.getPlayList=function(t,fn){
		this.trigger("songListLoading",t);
		$.getJSON("http://douban.fm/j/mine/playlist",{
				type:t,
				channel:0,
				pb:localStorage.pb?localStorage.pb:64,
				sid:this.currentSong? this.currentSong.sid:'',
				pt:this.audio.currentTime,
				r:Math.random(),
				from:"mainsite"
			},(function(data){
				if(data.err){
					this.trigger("songListLoadError",t);
					return;
				}
				this.trigger("songListLoaded");
				data.song.forEach(function(o){
					o.picture=o.picture.replace("mpic","lpic");
				})
				this.songList=data.song;
				fn&&(fn.bind(this))();		
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

	Radio.prototype.changeSong=function(b){
		this.currentSong=this.songList.shift();
		//new Image().src=this.currentSong.picture;
		this.audio.src=this.currentSong.url;
		!b&&this.audio.play();
		this.trigger("songChanged",this.currentSong);
	}

	Radio.prototype.skip=function(){
		this.audio.pause();
		this.getPlayList("s",this.changeSong);	
	}

	Radio.prototype.like=function(){
		this.getPlayList("r")
	}

	Radio.prototype.unlike=function(){
		this.getPlayList("u")
	}

	Radio.prototype.del=function(){
		this.audio.pause();
		this.getPlayList("b",this.changeSong);
	}

	Radio.prototype.powerOn=function(port){
		this.audio.pause()
		this.getPlayList("n",this.changeSong)
	}
	
	module.exports=Radio;
	
});
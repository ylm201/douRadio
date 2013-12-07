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
		this.kind='';
	};
	Radio.init=function(id){
		var radio=new Radio();
		_.extend(radio,Backbone.Events);
		radio.audio=$(id)[0];
		radio.audio.volume=localStorage.volume?localStorage.volume:0.8;
		if(!localStorage['channelId'])  localStorage.setItem('channelId','0');
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

		radio.audio.addEventListener("error", function(e) { 
            console.log("playing error: ");
            console.log(e.target.error?e.target.error.code:null);
            // exception recover
            if(e.target.error){
            	var currentTime=e.target.currentTime;
            	console.log("reload song");
            	e.target.load();
            	e.target.setTimeout(function(){
            		console.log("replay song");
            		e.target.play();
            		e.target.currentTime=currentTime;
            	},2000)
            }

        });
		radio.getPlayList('n',function(){
			radio.changeSong(true);
		})
		return radio;
	};
	
	Radio.prototype.getPlayList=function(t,fn){
		this.trigger("songListLoading",t);
		$.getJSON("http://douban.fm/j/mine/playlist",{
				type:t,
				channel:localStorage.channelId?localStorage.channelId:0,
				pb:localStorage.pb?localStorage.pb:192,
				sid:this.currentSong? this.currentSong.sid:'',
				pt:this.audio.currentTime,
				r:Math.random(),
				kbps:localStorage.pb?localStorage.pb:192,
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
				this.kind=data.kind;
				this.songList=data.song;
				fn&&(fn.bind(this))();		
		}).bind(this))
	}

	Radio.prototype.reportEnd=function(){
		$.get("http://douban.fm/j/mine/playlist",{
				type:'e',
				sid:this.currentSong.sid,
				channel:localStorage['channel']?localStorage['channel'].channelId:61,
				from:"mainsite"	
		})		
	}

	Radio.prototype.changeSong=function(b){
		this.currentSong=this.songList.shift();
		new Image().src=this.currentSong.picture;
		this.audio.src=this.currentSong.url;
		this.audio.load();
		this.audio.currentTime=400;
		!b&&this.audio.play();
		this.trigger("songChanged",this.currentSong);
	}

	Radio.prototype.skip=function(){
		this.audio.pause();
		if(this.kind=='session'){
			if(this.songList.length<=1){
				this.trigger("songListLoading","s");
				this.getPlayList("p",this.changeSong);	
			}else{
				this.changeSong();
			}
		}else{
			this.getPlayList("s",this.changeSong);
		}
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
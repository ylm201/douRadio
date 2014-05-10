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
		if(!localStorage['channelId']){
			localStorage.setItem('channelId','0');
			localStorage.setItem('channelName','私人');
			localStorage.setItem('channelCollected','disable');
		}
		radio.audio.addEventListener("ended",(function(){
			this.trigger('songEnded',this.currentSong);
			if(this.isReplay){
				this.audio.play();
				if(this.currentSong.replayTimes==0){
					this.reportEnd();
					this.currentSong.replayTimes++;
				}
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
            radio.trigger("error","loadSongError_"+e.target.error.code+":"+radio.currentSong.retryTimes);
            if(radio.currentSong.retryTimes<3){
            	radio.currentSong.retryTimes++;
            	radio.currentSong.revoverTime=this.currentTime;
            	this.load();
            }else{
            	console.error("exceed max retry time!");
            }
        });

        radio.audio.addEventListener("loadedmetadata",function(){
			if(radio.currentSong.retryTimes>0&&radio.currentSong.retryTimes<=3&&radio.currentSong.revoverTime){
        		this.currentTime=radio.currentSong.revoverTime;
        		radio.trigger("error","revover:"+radio.currentSong.retryTimes);
        	}
        })
		radio.getPlayList('n',function(){
			radio.changeSong(localStorage.autoPlay!='Y');
		})
		return radio;
	};

	Radio.prototype.getPlayList=function(t,fn){
		this.trigger("songListLoading",t);
		$.getJSON("http://douban.fm/j/mine/playlist",{
				type:t,
				channel:localStorage.channelId?localStorage.channelId:0,
				pb:localStorage.bitrate?localStorage.bitrate:64,
				sid:this.currentSong? this.currentSong.sid:'',
				pt:this.audio.currentTime,
				r:Math.random(),
				kbps:localStorage.bitrate?localStorage.bitrate:64,
				from:"mainsite"
			},(function(data){
				if(data.err){
					this.trigger("songListLoadError",t);
					return;
				}
				this.trigger("songListLoaded");
				var temp=[];
				data.song.forEach(function(o){
					//filter ad songs
					if(!o.adtype||localStorage.filterAd!='Y'){
						o.picture=o.picture.replace("mpic","lpic");
						o.retryTimes=0;
						o.replayTimes=0;
						temp.push(o);
					}else{
						console.log("filter song"+JSON.stringify(o));
					}
				})
				this.kind=data.kind;
				if(temp.length>0) this.songList=temp;
				fn&&(fn.bind(this))();
		}).bind(this))
	}

	Radio.prototype.report=function(t){
		$.getJSON("http://douban.fm/j/mine/playlist",{
				type:t,
				channel:localStorage.channelId?localStorage.channelId:0,
				pb:localStorage.bitrate?localStorage.bitrate:64,
				sid:this.currentSong? this.currentSong.sid:'',
				pt:this.audio.currentTime,
				r:Math.random(),
				kbps:localStorage.bitrate?localStorage.bitrate:64,
				from:"mainsite"
			},(function(data){
				if(data.err){
					return;
				}
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
		!b&&this.audio.play();
		this.trigger("songChanged",this.currentSong);
	}

	Radio.prototype.skip=function(){
		this.audio.pause();
		if(this.kind=='session'){
			this.report('s');
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
		this.kind=='session'?this.report('r'):this.getPlayList('r');
	}

	Radio.prototype.unlike=function(){
		this.kind=='session'?this.report('u'):this.getPlayList('u');
	}

	Radio.prototype.del=function(){
		this.audio.pause();
		if(this.kind=='session'){
			this.report('b');
			if(this.songList.length<=1){
				this.trigger("songListLoading","b");
				this.getPlayList("p",this.changeSong);
			}else{
				this.changeSong();
			}
		}else{
			this.getPlayList("b",this.changeSong);
		}
	}

	Radio.prototype.powerOn=function(port){
		this.audio.pause()
		this.getPlayList("n",this.changeSong)
	}

	module.exports=Radio;

});

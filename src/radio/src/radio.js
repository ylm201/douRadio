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
            console.log("playing error: "+e.target.error.code+","+e.target.currentTime);
            // exception recover
            if(radio.currentSong.retryTimes<3){
            	radio.currentSong.retryTimes++;
            	console.log("retryTimes: "+radio.currentSong.retryTimes);
            	var currentTime=e.target.currentTime;
            	e.target.load();
            	e.target.pause();
            	console.log("reload song");
            	setTimeout(function(){
            		console.log("begin replay song:"+e.target.currentTime+","+currentTime);
            		e.target.currentTime=currentTime;
            		e.target.play();
            		console.log("end replay song:"+e.target.currentTime+","+currentTime);
            	},2000)
            }else{
            	console.error("exceed max retry time!");
            }

        });

        radio.audio.addEventListener("loadedmetadata",function(){
        	console.log("metadata loaded");
        	if(false&&radio.currentSong.loadError&&radio.currentSong.currentTime!=0){
        		console.log("begin replay song:"+e.target.currentTime+","+currentTime);
            	radio.audio.currentTime=radio.currentSong.currentTime;
            	radio.audio.play();
            	console.log("end replay song:"+e.target.currentTime+","+currentTime);
        	}
        })
		radio.getPlayList('n',function(){
			radio.changeSong(!localStorage.autoPlay=='Y');
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
				this.songList=temp;
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
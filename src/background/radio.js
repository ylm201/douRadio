
var $=require("jquery");
var _ = require('underscore');
var Backbone=require('backbone');
var Radio=function(){
	this.currentSong=null;
	this.songList=[];
	this.heared=[];
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
		localStorage.setItem('channelCollected','disabled');
	}
	radio.audio.addEventListener("ended",(function(){
		this.trigger('songEnded',this.currentSong);
		//删除播放记录列表里同id歌曲重新放入队列首
		for(id in this.heared){
			var song=this.heared[id]
			if(song.sid==this.currentSong.sid){
				this.heared.splice(id,1);
			}
		}
		//本地记录已播歌曲
		this.heared.unshift(this.currentSong);
		//最多记录20首歌曲，超出剔除
		if(this.heared.length>20){
			this.heared.pop();
		}
		//播放次数大于1不异步通知
		if(this.currentSong.playTimes==0) this.reportEnd();
		//播放次数增1
		this.currentSong.playTimes++;
		//单曲循环不切换歌曲
		if(this.isReplay){
			this.audio.play();
			return;
		}
		if(this.songList.length>1){
			this.changeSong();
		}else{//播放列表已空，再次拉取
			this.getPlayList(this.currentSong,"p",this.changeSong);
		}
	}).bind(radio));

	radio.audio.addEventListener("timeupdate",(function(){
		this.trigger("playing",{currentTime:this.audio.currentTime,duration:this.audio.duration});
	}).bind(radio));

	//歌曲结束事件
	radio.audio.addEventListener("error", function(e) {
        radio.trigger("error","loadSongError_"+e.target.error.code+":"+radio.currentSong.retryTimes);
        if(radio.currentSong.retryTimes<3){
        	radio.currentSong.retryTimes++;
        	radio.currentSong.revoverTime=this.currentTime;
        	this.load();
        }
    });

    radio.audio.addEventListener("loadedmetadata",function(){
		if(radio.currentSong.retryTimes>0&&radio.currentSong.retryTimes<=3&&radio.currentSong.revoverTime){
    		this.currentTime=radio.currentSong.revoverTime;
    		radio.trigger("error","revover:"+radio.currentSong.retryTimes);
    	}
    })
	radio.getPlayList(undefined,'n',function(){
		radio.changeSong(localStorage.autoPlay!='Y');
	})
	return radio;
};

Radio.prototype.getPlayList=function(s,t,fn){
	this.trigger("songListLoading",t);
	$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:localStorage.channelId?localStorage.channelId:0,
			pb:localStorage.bitrate?localStorage.bitrate:64,
			sid:s?s.sid:'',
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
					o.playTimes=0;
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

Radio.prototype.report=function(t,s){
	$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:localStorage.channelId?localStorage.channelId:0,
			pb:localStorage.bitrate?localStorage.bitrate:64,
			sid:s?s.sid:this.currentSong.sid,
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
			this.getPlayList(this.currentSong,"p",this.changeSong);
		}else{
			this.changeSong();
		}
	}else{
		this.getPlayList(this.currentSong,"s",this.changeSong);
	}
}

Radio.prototype.like=function(s){
	s?s.like=1:this.currentSong.like=1;
	this.kind=='session'?this.report('r',s):this.getPlayList(s?s:this.currentSong,'r');
}

Radio.prototype.unlike=function(s){
	s?s.like=0:this.currentSong.like=0;
	this.kind=='session'?this.report('u',s):this.getPlayList(s?s:this.currentSong,'u');
}

Radio.prototype.del=function(){
	this.audio.pause();
	if(this.kind=='session'){
		this.report('b');
		if(this.songList.length<=1){
			this.trigger("songListLoading","b");
			this.getPlayList(this.currentSong,"p",this.changeSong);
		}else{
			this.changeSong();
		}
	}else{
		this.getPlayList(this.currentSong,"b",this.changeSong);
	}
}

Radio.prototype.directPlay=function(sid){
	for(id in this.heared){
		var song=this.heared[id]
		if(song.sid==sid){
			//重新插入列表
			this.songList.unshift(song);
			this.changeSong();
			return;
		}
	}
}

Radio.prototype.directToggleLike=function(sid){
	for(id in this.heared){
		var song=this.heared[id]
		if(song.sid==sid){
			song.like==0?this.like(song):this.unlike(song);
			return;
		}
	}			
}

Radio.prototype.powerOn=function(port){
	this.audio.pause()
	this.getPlayList(this.currentSong,"n",this.changeSong)
}

module.exports=Radio;
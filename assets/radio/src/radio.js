define(function(require, exports, module) {

    // add your code
	var $ = require('$');
	var Radio=function(){
		this.c_song={};
		this.song_list=[];
		this.channel=0;
		this.power=false;
		this.audio=null;
		this.power=false;
		this.uid='';
		this.heared='';
		this.checked=false;
		this.hasError=false;
		this.errorText="";
		if(!localStorage.channel) localStorage.channel=61
	}

	/**
	 *初始化播放器
	 * */
	Radio.init=function(audio){
		var radio=new Radio();
		radio.audio=audio;
		radio.audio.volume=localStorage.volume?localStorage.volume:0.8;
		radio.channel=localStorage['channel']?localStorage['channel']:61;		
		//douban.fm的cookie是session级别，从douban.com获取dbcl2的cookie到douban.fm
			chrome.cookies.get({
				url:"http://douban.com",
			name:"dbcl2"	
			},function(b){	
				if(b){
					console.info("get cookie:"+b.value);
					chrome.cookies.set({
						url:"http://douban.fm",
						name:"dbcl2",
						value:b.value
					});
				}else{
					console.warn("failed to get cookie!");
				}
			})
		return radio	
	}

	Radio.prototype.error=function(error){
		_gaq.push(['_trackPageview','error-'+error]);
		p&&p.postMessage({type:"error",errorText:error});
		this.hasError=true;
		this.errorText=error;
	}

	Radio.prototype.cleanError=function(){
		p&&p.postMessage({type:"cleanError"});
		this.hasError=false;
		this.errorText="";
	}

	/**
	 *获取播放列表
	 * */
	Radio.prototype.getPlayList=function(t,skip,callback){
		var self =this;
		var ch=localStorage.channel?localStorage.channel:0;
		var context;
		if(ch=="dj"&&localStorage.djc){
			ch=localStorage.djc;
		}else if(ch=="subject"){
			localStorage.context&&(context=localStorage.context);
			ch=0;
		}
		$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:ch,
			h:this.heared,
			sid:this.c_song? this.c_song.sid:'',
			r:Math.random(),
			from:"mainsite",
			context:context?context:""
		},function(data){
			if(data.err){
				self.error(data.err);
				return;
			}
			//加载歌曲callback
			callback&&callback();
			if(t=="n") self.power=true;
			var songs=data.song;
			self.song_list=[];
			console.log("loadiddng song...");
			for(s in songs){
				songs[s].sid&&self.song_list.push(songs[s]);
				console.log(songs[s]);
			}
			console.log("loading song end..");
			if(self.song_list.length>0) skip&&self.changeSong(t,port)
		})
	}

	Radio.prototype.reportEnd=function(){
		temp=this.heared.split("|")
			temp.push(this.c_song.sid+":"+"p")
			this.heared=temp.slice(-20).join("|")
			$.get("http://douban.fm/j/mine/playlist",{
				type:'e',
			sid:this.c_song.sid,
			channel:localStorage['channel']?localStorage['channel']:61,
			from:"mainsite"	
			})		
	}

	Radio.prototype.changeSong=function(t,port){
		//消除错误
			this.audio.pause();
			if(this.song_list.length<=0){
				this.getPlayList("p",true,port);
				return;
			}	
		this.c_song=this.song_list.shift();
		if(t!='n'){
			h_songs=this.heared.split("|");
			h_songs.push(this.c_song.sid+":"+t);
			this.heared=h_songs.slice(-20).join("|")
		}
		this.audio.src=this.c_song.url
			//this.audio.play()
			//if(port){
			//	port.postMessage({type:"song",song:radio.c_song})
			//}else{
			//	var notification = webkitNotifications.createNotification("",this.c_song.artist,this.c_song.title);
			//	notification.show();
			//	setTimeout(function(){
			//		notification.cancel();
			//	},5000)
			//}
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
		this.audio.pause()
			this.getPlayList("n",true,port)
	}

	Radio.prototype.powerOff=function(port){
		this.power=false
			radio.audio.removeEventListener("timeupdate",onTimeUpdate)
			this.audio.pause()
			this.audio.src=null
			this.c_song={}
		port.postMessage({type:"song",song:{}})
			chrome.browserAction.setTitle({title:"小豆电台"})
	}

    module.exports = Radio;

});

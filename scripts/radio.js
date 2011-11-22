$.ajaxSetup({ async: false });	
var radio=function(){
	var songs=[],c_song={},heared='',stored_channel=0,audio=$("#radio")[0],t_power=false,uid;
	var getPlayList=function(t,skip){
		$.getJSON("http://douban.fm/j/mine/playlist",{
			type:t,
			channel:0,
			h:heared,
			sid:c_song ? c_song.sid:'',
			r:Math.random(),
			uid:uid
		},//end params
		function(data){
			s=data.song;
			for(d in s){
				songs[d]=s[d];								
			}
			if(skip){
				changeSong(t);
			}
		});//end getJSON
	};
	var report=function(){
		temp = heared.split("|");
		temp.push(c_song.sid + ":" + "p");
		heared = temp.slice(-20).join("|");
		$.get("http://douban.fm/j/mine/playlist",{
			type:'e',
			sid:c_song.sid,
			channel:stored_channel
		});
	};	
	var operate=function(t){
		switch(t){
			case "b":
			case "s":
			case "n":
				songs=[];
				getPlayList(t,true);
				break;
			case "e":
				report();
				changeSong("p");
				break;			
			case "r":
			case "u":
				getPlayList(t,false)
				break;
			default:
				break;
		}//switch end
	};
	var changeSong=function(t){
		c_song=songs.shift();
		if(t!='n'){//记录收听过的歌曲(不论正常收听还是跳过)
			h_songs = heared.split("|");
			h_songs.push(c_song.sid + ":" + t);
			heared = h_songs.slice(-20).join("|");
		};
		temp=(c_song.url.split('/'))[8];
		audio.pause();
		console.log("get next song:"+c_song.sid)
		try{//如果歌曲为广告将无法播放，则刷新播放列表获取新歌曲
			audio.src=c_song.url
			//audio.src="http://otho.douban.com/view/song/small/"+temp;
			audio.load()
			audio.play()
			if(songs.length==0){
				console.log("get new song list")
				getPlayList("p",false)
			}
		}catch(err){
			console.log("load music error:"+err)
			getPlayList("p",false)
		}	
	};
	audio.addEventListener("ended", function() {
		operate("e")
		var notification = webkitNotifications.createHTMLNotification('notification.html');
		notification.show();
	});
	chrome.cookies.get({
		url: "http://douban.com",
		name: "dbcl2"
	}, function(b) {
		b && chrome.cookies.set({
			url: "http://douban.fm",
		  name: "dbcl2",
		  value: b.value
		});
		uid=b.value.split(":")[0]
	});//get-end
	
	return {
			skip: function(){
				operate("s");
			},
			like: function(){
				operate("r");
			},
			ulike:function(){
				operate("u");
			},
			del:function(){
				operate("b");
			},
			next:function(){
				 operate("s");
			},
			getSong: function(){
				return c_song;
			},
			power:function(){
				return t_power;
			},
			open:function(){
				t_power=true;
				operate("n");
			},
			close:function(){
				audio.pause();
				audio.src='';
				c_song={};
				t_power=false;
			},
			doSomething:function(s){
				doSomething=s
			}
	}
}();

$.ajaxSetup({ async: false });	
var radio=function(){
var songs=[],c_song={},heared='',stored_channel=0,audio=$("#radio")[0],t_power=false,uid;
var getPlayList=function(t,skip){//t-->type�������� --��ȡ�µĲ����б�--������		
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
		for(d in s)
		{
			songs[d]=s[d];								
		}
		if(skip){
			changeSong(t);
		}
	});//end getJSON
};
var report=function(){//�̱���
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
						songs=[];//��ղ����б�
						getPlayList(t,true);
						break;
				case "e":
						report();//����������ϱ���
						changeSong("p");
						if(songs.length<=0){
							getPlayList("p",false);//��Ŀ���ź��б��Կգ���Ҫ��ȡ�б�
						}
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
				if(t!='n'){
					h_songs = heared.split("|");
					h_songs.push(c_song.sid + ":" + t);
					heared = h_songs.slice(-20).join("|");
				};
				temp=(c_song.url.split('/'))[8];
				audio.pause();
				setTimeout(function(){				
					audio.src="http://otho.douban.com/view/song/small/"+temp;
					audio.load()
					audio.play()},1000)
				if(songs.length==0){
					operate("p");
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
					play: function(){										
						audio.addEventListener("ended", function() {
							operate("e")
							var notification = webkitNotifications.createHTMLNotification('notification.html');
							notification.show();
						});
						operate("n");
					},
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
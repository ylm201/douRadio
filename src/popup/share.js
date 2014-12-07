var  share={
	weibo:function(song){
		url="http://douban.fm/?start="+song.sid+"g"+song.ssid+"g0&cid=0";
		var pic=song.picture&&song.picture.replace(/mpic|spic/,"lpic");
		var content="分享"+song.artist+"的单曲《"+song.title+"》(来自@豆瓣FM)";
		window.open("http://service.weibo.com/share/share.php?url=" 
		+ encodeURIComponent(url) + "&appkey=694135578" 
		+ "&title=" + encodeURIComponent(content) + "&pic=" + encodeURIComponent(pic) 
		+ "&language=zh-cn", "_blank", "width=615,height=505");
	},
	douban:function(song){
		url="http://douban.fm/?start="+song.sid+"g"+song.ssid+"g0&cid=0";
		var pic=song.picture&&song.picture.replace(/mpic|spic/,"lpic");
		var content="分享"+song.artist+"的单曲《"+song.title+"》(来自@豆瓣FM)";
		window.open("http://shuo.douban.com/!service/share?name="+encodeURIComponent(song.title)
			+"&href="+encodeURIComponent(url)
			+"&image="+encodeURIComponent(pic)
			+"&desc=by小豆(http://goo.gl/iRxds)"
			+"&apikey=0458f5fa0cd49e2a0d0ae1ee267dda7e&target_type=rec&target_action=0&object_kind=3043&object_id="+song.sid
			+"action_props="+encodeURIComponent('%7B"url"%3A "'+"http://t.cn/zOxAHIV"+'"%2C "title" "'+song.artist+'--'+song.title+'"%7D'),"_blank","width=615,height=505")
	}
}
module.exports=share;

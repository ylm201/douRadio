var c_song={}
var power=false
//初始化
chrome.extension.sendRequest({type:"init"},function(data){
	data.power&&showSong(data.song)
	power=data.power
})

//时间轴事件
chrome.extension.onRequest.addListener(function(req,sender){
	if(req.type=="timeUpdate"){
		updateTime(req.c,req.d)
	}
	if(req.type=="end"){
		showSong(req.song)
	}
	if(req.type=="loading"){
		$("#timer").html("<img src='img/loading.gif'/>")
	}
})
var changeToTime=function(time){
	var min=0
	var second=0
	min=parseInt(time/60)
	second=parseInt(time%60)
	min=isNaN(min)?0:min
	second=isNaN(second)?0:second
	if(second<10){
		second="0"+second
	}
	return min+":"+second
},updateTime=function(c,d){
	var t=(c/d)*240
	$("#played").css("width",t+"px")
	$("#timer").text(changeToTime(c)+"/"+changeToTime(d))
}

//显示当前歌曲
showSong=function(data){
	c_song=data
	if(data&&data.like==1){
		$("#like").attr("src","img/rated.png")
	}else{
		$("#like").attr("src","img/unrated.png")
	}
	if(power==true){
		$("#power").attr("src","img/off.png")
	}else{
		$("#power").attr("src","img/on.png")
	}
	if(data.title){
		$("#song_title").html(data.title)
		$("#song_title").attr("title",data.title)	
		$("#song_artist").html(data.artist)
		$("#song_artist").attr("title",data.artist)
	}
	hideLoading()
},sendRequest=function(t){//后台交互事件
	chrome.extension.sendRequest({type:t},function(song){
		showSong(song)
	})
},showLoading=function(){
	$("#notify").fadeIn()
},hideLoading=function(){
	$("#notify").fadeOut()
}

//播放事件绑定
$("#skip").bind("click",function(){
	showLoading();
	sendRequest("skip");
	return false;
});

$("#power").bind("click",function(){
	sendRequest("on_off")
	power=!power
	power&&showLoading()
	return false;
});

$("#like").bind("click",function(){
	sendRequest("like")
	return false;
});

$("#delete").bind("click",function(){
	showLoading()
	sendRequest("delete")
	return false;
});

$("#pause").bind("click",function(){
	power&&sendRequest("pause")
	power&&($("#mask").show())
})

//音量按钮
$("#range")[0].addEventListener("input",function(){
	var d=$(this).val()
	var len=$(this).val()/100*50
	$("#volume_bar").css("width",len+"px")
	var v=radio.audio.volume=$(this).val()/100
	chrome.extension.sendRequest({volume:v})
})

$("#volume img").toggle(function(){
	$("#range").show()
	$("#volume_bar").show()
},function(){
	$("#range").hide()
	$("#volume_bar").hide()
})

//频道切换
$("#switcher").bind("click",function(){
	$("#channel_popup").fadeIn("slow")
	var sc=localStorage["channel"]?localStorage["channel"]:"0"
	$("#"+sc).addClass("channel_selected")
		.siblings().removeClass("channel_selected")
})

$("#channels li").bind("click",function(){
	var sc=$(this).attr("id")
	localStorage["channel"]=sc
	$(this).addClass("channel_selected")
		.siblings().removeClass("channel_selected")
	$("#channel_popup").fadeOut("slow")
	showLoading()
	sendRequest({type:"switch"})
})

$("#close_c").bind("click",function(){
	$("#channel_popup").fadeOut("slow")
})

//分享按钮
$("#share img").bind("click",function(){
	var channel=localStorage.channel?localStorage.channel:"0";
	var content="分享"+c_song.artist+"的单曲《"+c_song.title+"》(来自@豆瓣FM)";
	var url="";
	_gaq.push(['_trackEvent', 'share-'+this.id, 'clicked']);	
	if(channel!="-1"||this.id=="fanfou"){
		url="http://douban.fm/?start="+c_song.sid+"g"+c_song.ssid+"g"+channel+"&cid="+channel
	}
	var pic=c_song.picture&&c_song.picture.replace(/mpic|spic/,"lpic")
	if(this.id=="sina"){
		window.open("http://service.weibo.com/share/share.php?url=" 
			+ encodeURIComponent(url) + "&appkey=694135578" 
			+ "&title=" + encodeURIComponent(content) + "&pic=" + encodeURIComponent(pic) 
			+ "&language=zh-cn", "_blank", "width=615,height=505");
		window.close()
		return;
	}
	if(this.id=="douban"){
	window.open("http://shuo.douban.com/!service/share?name="+encodeURIComponent(song.title)
		+"&ref="+encodeURIComponent(url)+
		"&image="+encodeURIComponent(pic)
		+"&desc=(豆瓣电台chrome插件-小豆)"+
		"&apikey=0458f5fa0cd49e2a0d0ae1ee267dda7e","_blank","width=615,height=505");
		window.close()
		return;
	}
	if(this.id="fanfou"){
	window.open("http://fanfou.com/sharer?t="+encodeURIComponent(content)
		+"&u="+encodeURIComponent("http://douban.fm")+"&s=bm","_blank","width=600,height=400");
		window.close()
		return;
	}
})

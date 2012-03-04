var radio=chrome.extension.getBackgroundPage().radio;
console.log(radio);


function showSong(){
	var data=radio.c_song;
	if(data&&data.like==1){
		$("#like").attr("src","img/rated.png")
	}else{
		$("#like").attr("src","img/unrated.png")
	}
	if(radio.power==true){
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
};

$("#skip").bind("click",function(){
	if(!radio.power){
		return false;
	}
	radio.skip();
	showSong();
	return false;
});

$("#power").bind("click",function(){
	if(radio.power===false){
		radio.powerOn();
		$(this).attr("src","img/off.png")
		showSong();
	}else{
		radio.powerOff();
		$(this).attr("src","img/on.png")
		$("#song_title").html("--")
		$("#song_title").attr("title","")
		$("#song_artist").html("豆瓣电台")
		$("#song_artist").attr("title","豆瓣电台")

	}
	return false;
});

$("#like").bind("click",function(){
	if(!radio.power){
		return false;
	}
	if(radio.c_song.like==0){
		radio.like();
		$("#like").attr("src","img/rated.png");
		radio.c_song.like=1;
	}else{
		radio.unlike();
		$("#like").attr("src","img/unrated.png");
		radio.c_song.like=0;
	}
	return false;
});

$("#delete").bind("click",function(){
	if(!radio.power){
		return false;
	}
	radio.del();
	showSong()
	return false;
});

$("#comment_commit").bind("click",function(){
	var nodes=$(".comment_button")
	content=$("#comment_input").val()
	$.each(nodes,function(index,value){
		var isSelected=$(value).attr("selected")
		if(isSelected=="true"){
			doComment($(value).attr("id"),content)
		}
	})
});

$("#range")[0].addEventListener("input",function(){
	var d=$(this).val()
	var len=$(this).val()/100*50
	$("#volume_bar").css("width",len+"px")
	var a=radio.audio.volume=$(this).val()/100
	localStorage["volume"]=$(this).val()/100
})

$("#volume img").toggle(function(){
	$("#range").show()
	$("#volume_bar").show()
},function(){
	$("#range").hide()
	$("#volume_bar").hide()
})



$("#comment_close").bind("click",function(){
	$("#comment_popup").slideUp()
})

$(".comment_button").bind("click",function(){
	var isSelected=$(this).attr("selected")
	if(isSelected=="true"){
		$(this).attr("selected","false")
		$(this).css("opacity","0.4")
	}else{
		$(this).attr("selected","true")
		$(this).css("opacity","1.0")
	}	
})

$("#share img").bind("click",function(){
	var song=radio.c_song;
	var channel=localStorage.channel?localStorage.channel:"0";
	var content="分享"+song.artist+"的单曲《"+song.title+"》(来自@豆瓣FM)";
	var url="";
	_gaq.push(['_trackEvent', 'share-'+this.id, 'clicked']);	
	if(radio.channel!="-1"||this.id=="fanfou"){
		url="http://douban.fm/?start="+song.sid+"g"+song.ssid+"g"+channel+"&cid="+channel
	}
	var pic=song.picture&&song.picture.replace(/mpic|spic/,"lpic")
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

$("#switcher").bind("click",function(){
	$("#channel_popup").fadeIn("slow")
	var sc=localStorage["channel"]?localStorage["channel"]:"0"
	var c=$("#"+sc)
	$("#"+sc).addClass("channel_selected")
		.siblings().removeClass("channel_selected")
})

$("#channels li").bind("click",function(){
	var sc=$(this).attr("id")
	localStorage["channel"]=sc
	radio.channel=sc
	$(this).addClass("channel_selected")
		.siblings().removeClass("channel_selected")
	$("#channel_popup").fadeOut("slow")
	if(radio.power==true){
		radio.powerOn();
		showSong();
	}
})

$("#close_c").bind("click",function(){
	$("#channel_popup").fadeOut("slow")
})


$("#pause").bind("click",function(){
	if(!radio.power){
		return false;
	}
	radio.audio.pause()
	$("#mask").show()
})

$("#mask").bind("click",function(){
	radio.audio.play()
	$("#mask").hide()
})

var audio=radio.audio
audio.addEventListener("ended",function(){
	showSong()	
})

audio.addEventListener("timeupdate",function(){
	var t=(this.currentTime/this.duration)*240
	$("#played").css("width",t+"px")
	var min=0
	var second=0
	var current=this.currentTime
	min=parseInt(current/60)
	second=parseInt(current%60)
	if(second<10){
		second="0"+second
	}
	var c=min+":"+second
	min=0
	second=0
	total=this.duration
	min=parseInt(total/60)
	second=parseInt(total%60)
	min=isNaN(min)?0:min
	second=isNaN(second)?0:second
	if(second<10){
		second="0"+second
	}
	var t=min+":"+second
	$("#timer").text(c+"/"+t)

})


if(radio.power){
	showSong();
	if(radio.audio.paused){
		$("#mask").show()
	}
}
var vol=localStorage["volume"]
if(!vol){
	vol=0.8
}
$("#range").val(vol*100)
$("#volume_bar").css("width",vol*50+"px")
audio.volume=vol

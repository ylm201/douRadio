var radio=chrome.extension.getBackgroundPage().radio;
console.log(radio);

function showSong(){
	var data=radio.c_song;
	console.log(radio);
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
		$("#song_title").html(data.title+"--"+data.artist)
		$("#song_title").attr("title",data.title+"--"+data.artist)	
	}
};

$("#skip").bind("click",function(){
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
	}
	return false;
});

$("#like").bind("click",function(){
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
	radio.del();
	showSong()
	return false;
});

$("#comment_commit").bind("click",function(){
	var nodes=$(".comment_button")
	$.each(nodes,function(index,value){
		var isSelected=$(value).attr("selected")
		if(isSelected=="true"){
			doComment($(value).attr("id"),$("#comment_input").val())
		}
	})
});

function doComment(id,content){
	var s=localStorage[id]
	var ts=s.split(",")
	sendApiRequest({
		url:"http://api.fanfou.com/statuses/update.json",
		method:"POST",
		content:{status:content},
		consumer_key:"327fe47f56d57ead9539c3498772fc3d",
		consumer_secret:"688edd10e5a2c923cf9421a644240e70",
		access_token:ts[0],
		access_secret:ts[1],
		onSuccess:function(data){
			console.log(data)
		}
	})
}

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
	$("#comment_popup").slideDown("slow")
	var c= $(this).attr("class")
	$("#"+c).css("opacity","1.0")
			.attr("selected","true")
	var content=$("#song_title").attr("title")
	content="#豆瓣电台#"+content
	console.log(content)
	$("#comment_input").val(content)
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
	$(this).addClass("channel_selected")
		.siblings().removeClass("channel_selected")
	$("#channel_popup").fadeOut("slow")
	if(radio.power==true){
		radio.powerOn();
		showSong();
	}
})

var audio=radio.audio
audio.addEventListener("timeupdate",function(){
	var min=0;
	var second=0
	var current=this.currentTime
	min=parseInt(current/60)
	second=parseInt(current%60)
	if(second<10){
		second="0"+second
	}
	$("#current").text(min+":"+second)

	min=0;
	second=0
	total=this.duration
	min=parseInt(total/60)
	second=parseInt(total%60)
	if(second<10){
		second="0"+second
	}
	$("#total").text(min+":"+second)

})

audio.addEventListener("play",function(){
})
if(radio.power){
	showSong();
}

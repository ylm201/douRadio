var c_song={}
var power=false
var lock=false
var checked=false

var ch=$("#"+localStorage.channel).html()
$("#switcher").attr("title",ch)

var port=chrome.extension.connect({name:"douRadio"})

//登录处理
var verifyCookie=function(c){
	chrome.cookies.get({
		url:"http://douban.com",
		name:"dbcl2"	
	},function(b){	
		if(b){
			console.info("get cookie:"+b.value)
			chrome.cookies.set({
				url:"http://douban.fm",
				name:"dbcl2",
				value:b.value
			})
			$("#notify_login").hide()
			checked=true
		}else{
			!c&&$("#notify_login").show()
			c&&$("#notify_login").hide()
			port.postMessage({type:"check"})
			_gaq.push(['_trackEvent', 'not_login', 'happen']);	
			console.warn("failed to get cookie")
			checked=false
		}
	})
}

port.onMessage.addListener(function(msg){
	if(msg.type=="timeUpdate"){
		updateTime(msg.c,msg.d)
	}
	if(msg.type=="song"){
		showSong(msg.song)
	}
	if(msg.type=="loadingList"){
		showLoading()
	}
	if(msg.type=="loadedList"){
		hideLoading()
	}
	if(msg.type=="rate"){
		if(msg.like==1){
			$("#like").attr("src","img/rated.png")
			localStorage.autoShare&&setTimeout(function(){
				doShare(localStorage.autoShare)
			},300)
		}else{
			$("#like").attr("src","img/unrated.png")
		}
	}
	if(msg.type=="init"){
		//音量按钮
		power=msg.power
		if(power==true){
			$("#power").attr("src","img/off.png")
		}else{
			$("#power").attr("src","img/on.png")
		}
		//歌曲信息显示
		showSong(msg.song)
		//暂停状态显示
		msg.power&&msg.pause&&$("#mask").show()
		//时间条状态获取
		updateTime(msg.c,msg.d)
		//音量状态获取
		$("#range").val(msg.volume*100)
		//cookie检查
		verifyCookie(msg.checked)
		if(localStorage.settingShow&&localStorage.settingShow=="false"){
			$("#setting_a").hide()
		}
		return
	}
	if(msg.type=="error"){
		$(".warn").hide();
		$("#error").html("<span>哎呀，出错了("+msg.errorText+")</span>").fadeIn();
		return
	}
	if(msg.type=="cleanError"){
		$(".warn").hide();
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
	if(!c||!d||c==0||d==0){
		$("#timer").html("<img src='img/loading.gif'/>")
		$("#played").css("width","0px")
	}else{
		$("#played").css("width",t+"px")
		$("#timer").text(changeToTime(c)+"/"+changeToTime(d))
	}
	!power&&$("#timer").html("")
	!power&&$("#played").css("width","0px")
}

//显示当前歌曲
showSong=function(data){
	c_song=data
	if(data&&data.like==1){
		$("#like").attr("src","img/rated.png")
	}else{
		$("#like").attr("src","img/unrated.png")
	}
	if(data.title){
		$("#song_title").html(data.title)
		$("#song_title").attr("title",data.title)	
		$("#song_artist").html(data.artist)
		$("#song_artist").attr("title",data.artist)
		power&&$("#timer").html("<img src='img/loading.gif'/>")
		$("#played").css("width","0px")
	}else{
		$("#song_artist").html("豆瓣电台")
		$("#song_title").html("--")
		$("timer").html("")
	}
},sendRequest=function(t){//后台交互事件
	!lock&&port.postMessage({type:t})
},showLoading=function(){
	lock=true
	$("#notify").fadeIn()
},hideLoading=function(){
	$("#notify").fadeOut()
	lock=false
}

//播放事件绑定
$("#skip").bind("click",function(){
	sendRequest("skip");
	return false;
});

$("#power").bind("click",function(){
	sendRequest("on_off")
	power=!power
	if(power==true){
		$("#power").attr("src","img/off.png")
	}else{
		$("#power").attr("src","img/on.png")
		$("#timer").html("")
		$("#played").css("width","0px")
	}
	return false;
});

$("#like").bind("click",function(){
	if(checked){
		sendRequest("like")
	}else{
		$("#notify_login").show()
		setTimeout(function(){$("#notify_login").fadeOut()},2000)
	}
	return false;
});

$("#delete").bind("click",function(){
	if(checked){
		sendRequest("delete")
	}else{
		$("#notify_login").show()
		setTimeout(function(){$("#notify_login").fadeOut()},2000)
	}
	return false;
});

$("#pause").bind("click",function(){
	power&&sendRequest("pause")
	pause&&$("#mask").show()
})

$("#mask").bind("click",function(){
	power&&sendRequest("pause")
	$("#mask").hide()
})

//音量按钮
$("#range")[0].addEventListener("input",function(){
	var v=$(this).val()/100
	port.postMessage({type:"volume",vol:v})
})
$("#volume img").toggle(function(){
	$("#range").show()
},function(){
	$("#range").hide()
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
	if(!localStorage.channel||localStorage.channel!=sc){
		localStorage.channel=sc
		sendRequest("switch")
	}
	$(this).addClass("channel_selected")
		.siblings().removeClass("channel_selected")
	$("#channel_popup").fadeOut("slow")
	var ch=$("#"+localStorage.channel).html()
	$("#switcher").attr("title",ch)

})

$("#close_c").bind("click",function(){
	$("#channel_popup").fadeOut("slow")
})

$("#login_close").bind("click",function(){
	$("#notify_login").fadeOut()
	port.postMessage({type:"checked"})
})


var share_sina=function(content,url,pic){
	window.open("http://service.weibo.com/share/share.php?url=" 
			+ encodeURIComponent(url) + "&appkey=694135578" 
			+ "&title=" + encodeURIComponent(content) + "&pic=" + encodeURIComponent(pic) 
			+ "&language=zh-cn", "_blank", "width=615,height=505");
	window.close()
	return;
},share_douban=function(content,url,pic){
	window.open("http://shuo.douban.com/!service/share?name="+encodeURIComponent(c_song.title)
		+"&href="+encodeURIComponent(url)
		+"&image="+encodeURIComponent(pic)
		+"&desc=by小豆(http://goo.gl/iRxds)"
		+"&apikey=0458f5fa0cd49e2a0d0ae1ee267dda7e&target_type=rec&target_action=0&object_kind=3043&object_id="+c_song.sid
		+"action_props="+encodeURIComponent('%7B"url"%3A "'+"http://t.cn/zOxAHIV"+'"%2C "title" "'+c_song.artist+'--'+c_song.title+'"%7D'),"_blank","width=615,height=505")
		window.close()
		return;
},share_fanfou=function(content){
	window.open("http://fanfou.com/sharer?t="+encodeURIComponent(content)
		+"&u="+encodeURIComponent("http://douban.fm")+"&s=bm","_blank","width=600,height=400");
		window.close()
		return;
},doShare=function(id){
	var channel=localStorage.channel?localStorage.channel:"0";
	var content="分享"+c_song.artist+"的单曲《"+c_song.title+"》(来自@豆瓣FM)";
	var url="";
	_gaq.push(['_trackEvent', 'share-'+id, 'clicked']);	
	if(channel!="-1"||this.id=="fanfou"){
		url="http://douban.fm/?start="+c_song.sid+"g"+c_song.ssid+"g"+channel+"&cid="+channel
	}
	var pic=c_song.picture&&c_song.picture.replace(/mpic|spic/,"lpic")
	if(id=="sina"){
		share_sina(content,url,pic)
	}
	if(id=="douban"){
		share_douban(content,url,pic)
	}
	if(id=="fanfou"){
		share_fanfou(content)
	}
}

//分享按钮
$(".share_button").bind("click",function(){
	doShare(this.id)
})

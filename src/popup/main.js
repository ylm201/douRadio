var $=require("jquery");
var Backbone=require("backbone");
var Player=Backbone.Model.extend();
var PopupView=require("./view/popup");
var ChannelsView=require("./view/channels");
var HistoryView=require("./view/history");
var player,popupView;
var port=chrome.extension.connect({name:"douRadio"})

//全局异常监控
window.onerror = function(message, url, line, col, stack) {
	var params=url.split('/');
	_gaq.push(['_trackEvent', 'JsErrorPopup', params[params.length-1] + ':' + line + ':'+col+':' + message]);
}

//引用ga会影响popup弹出速度，使用port转发消息给background
$('body').on('click','[seed]',function(){
	var seed=$(this).attr("seed");
	var params=seed.split("_");
	if(params.length==2){
		port.postMessage({type:'analysis',trackParams:['_trackEvent', params[0], params[1]]});
	}else if(params.length==3){
		port.postMessage({type:'analysis',trackParams:['_trackEvent', params[0], params[1],params[2]]});
	}
})

port.postMessage({type:'analysis',trackParams:['_trackEvent', 'popup', '-']})

//background消息监听
port.onMessage.addListener(function(msg){

	//初始化
	if(msg.type=='init'){
		player=new Player(msg.obj);
		popupView=new PopupView({'model':player});
		popupView.port=port;
		channelsView = new ChannelsView({player:player});
		channelsView.port=port;
		historyView=new HistoryView({model:msg.obj.heared});
		historyView.port=port;
	}

	//歌曲切换
	if(msg.type=='songChanged'){
		player.set({currentSong:msg.obj})
	}

	//正在播放
	if(msg.type=='playing'){
		player.set({time:msg.obj});
	}

	//登录
	if(msg.type=='login'){
		player.set({needLogin:true});
		$('#notify').show();
	}
});
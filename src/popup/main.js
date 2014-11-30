var $=require("jquery");
var Backbone=require("backbone");
var Player=require("./models/player");
var PopupView=require("./view/popup");
var ChannelsView=require("./view/channels");
var HistoryView=require("./view/history");
var player,popupView;
var port=chrome.extension.connect({name:"douRadio"})
port.onMessage.addListener(function(msg){

	if(msg.type=='init'){
		player=new Player(msg.obj);
		popupView=new PopupView({'model':player});
		popupView.port=port;
		channelsView = new ChannelsView({player:player});
		channelsView.port=port;
		historyView=new HistoryView({model:msg.obj.heared});
		historyView.port=port;
	}

	if(msg.type=='songChanged'){
		player.set({currentSong:msg.obj})
	}

	if(msg.type=='songListLoading'){
		player.set({loadType:msg.obj});
		player.set({loading:true})
	}

	if(msg.type=='songListLoaded'){
		player.set({loadType:msg.obj});
		player.set({loading:false})
	}

	if(msg.type=='playing'){
		player.set({time:msg.obj});
	}

	if(msg.type=='login'){
		$('#notify').show();
	}
});

$("#notify_close").on("click",function(){
	$("#notify").hide()
})
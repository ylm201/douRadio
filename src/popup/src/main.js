define(function(require, exports, module) {
	var $=require("$");
	var Backbone=require("backbone");
	var Player=require("./models/player");
	var PopupView=require("./view/popup");
	var ChannelsView=require("./view/channels");
	//var FavChannelsView=require("./view/favChannels");
	var player,popupView;
	var port=chrome.extension.connect({name:"douRadio"})
	port.onMessage.addListener(function(msg){

		if(msg.type=='init'){
			player=new Player(msg.obj);
			popupView=new PopupView({'model':player});
			popupView.port=port;
			var channelsView = new ChannelsView();
			channelsView.port=port;
			channelsView.player=player;
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
});
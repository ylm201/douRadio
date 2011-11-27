	var radio=chrome.extension.getBackgroundPage().radio;
	console.log(radio)
	var showSong=function(){
			var data=radio.c_song;
			console.log(radio)
			if(data.like==1){
				$("#like").attr("src","/img/rated.png")
			}else{
				$("#like").attr("src","/img/unrated.png")
			}
			if(radio.power==true){
				$("#power").attr("src","img/off.png")
			}else{
				$("#power").attr("src","img/on.png")
			}
			if(data.title){
				$("#song_title").html(data.title+"--"+data.artist)
			}

	};
	
	//构造签名头部
	function getRequestHeader(data){
		var message = {
		    method: "POST",
		    action: "http://api.fanfou.com/statuses/update.json",	
		    parameters: {
		        oauth_consumer_key: "327fe47f56d57ead9539c3498772fc3d",
		        oauth_token: localStorage["fanfou_access_token"],
				oauth_signature_method: "HMAC-SHA1",
		        oauth_signature: "",
		        oauth_timestamp: "",
		        oauth_nonce: "",
				status:data
			  }
		  }
		  // 签名
		  OAuth.setTimestampAndNonce(message);
		  OAuth.SignatureMethod.sign(message, {
		      consumerSecret: "688edd10e5a2c923cf9421a644240e70",
		      tokenSecret: localStorage["fanfou_access_token_secret"],
		  });

		//构造OAuth头部
		var oauth_header = "OAuth realm=\"\", oauth_consumer_key=";
		oauth_header += message.parameters.oauth_consumer_key + ', oauth_nonce=';
		oauth_header += message.parameters.oauth_nonce + ', oauth_timestamp=';
		oauth_header += message.parameters.oauth_timestamp + ', oauth_signature_method=HMAC-SHA1, oauth_signature=';
		oauth_header += message.parameters.oauth_signature + ', oauth_token=';
		oauth_header += message.parameters.oauth_token;	
		return oauth_header		
	}
	
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
				$(this).attr("src","img/on.ong")
			}
			return false;
	});
	$("#like").bind("click",function(){
			if(radio.c_song.like==0){
				radio.like();
				$("#like").attr("src","/img/rated.png")
				radio.c_song.like=1
			}else{
				radio.unlike();
				$("#like").attr("src","/img/unrated.png")
				radio.c_song.like=0
			}
			return false;
	});
	$("#delete").bind("click",function(){
		radio.del();
		return false;
	});
	$('#submit').bind("click",function(){
		var value=$("#comment")[0].value;
		var content=' #豆瓣电台# '+radio.c_song.artist+'--'+radio.c_song.title+' '+value

		$.ajax({
				url : "http://api.fanfou.com/statuses/update.json",
				type : "POST",
				data:{
					status:content
				},
				beforeSend : function(req) {
				req.setRequestHeader('Authorization',getRequestHeader(content));
				},
				error:function(XmlHttpRequest,textStatus,errortown){
					alert(XMLHttpRequest);
				}
		});
		//radio.like();
		var $comment=$('#comment');
		var $submit=$('#submit');
		$comment.addClass("dd");
		$submit.addClass("dd");
	});
	var comment=function(){
		//var $comment=$('#comment');
		//var $submit=$('#submit');
		//$comment.removeClass("dd");
		//$submit.removeClass("dd");
		//chrome.tabs.executeScript(null, {file: "lib/jquery.min.js"});
		//chrome.tabs.executeScript(null, {file: "scripts/content_scripts.js"});
	}
	//radio.powerOn()
	showSong();

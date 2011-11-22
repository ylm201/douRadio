	var radio=chrome.extension.getBackgroundPage().radio;
	var showSong=function(){
			var data=radio.getSong();
			$("#result1").setTemplateElement("template");	
			$("#result1").processTemplate(data);
			if(data.like==0){
				$("#like").html("like");
			}else{
				$("#like").html("unlike");
			}
			$("#play").html(radio.power()==true?"off":"on")
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
	$("#play").bind("click",function(){
			if(radio.power()===false){
				radio.open();
				$(this).html("off")
				showSong();
			}else{
				radio.close();
				$("#result1").setTemplateElement("template");	
				$("#result1").processTemplate({});
				$(this).html("on")
			}
			return false;
	});
	$("#like").bind("click",function(){
			if(radio.getSong().like==0){
				radio.like();
				comment();
			}else{
				radio.unlike();
			}
			return false;
	});
	$("#delete").bind("click",function(){
		radio.del();
		return false;
	});
	$('#submit').bind("click",function(){
		var value=$("#comment")[0].value;
		var content=' #豆瓣电台# '+radio.getSong().artist+'--'+radio.getSong().title+' '+value

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
		var $comment=$('#comment');
		var $submit=$('#submit');
		$comment.removeClass("dd");
		$submit.removeClass("dd");
	}
	showSong();

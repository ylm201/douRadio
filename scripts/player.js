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
	function make_base_auth(user, password) {
			var tok = user + ':' + password;
			hash=$.base64.encode(tok);
			 return "Basic " + hash;
	}; 
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
		$.ajax({
				url : "http://api.fanfou.com/statuses/update.json",
				type : "POST",
				data:{
					status:' #豆瓣电台# '+radio.getSong().artist+'--'+radio.getSong().title+' '+value
				},
				beforeSend : function(req) {
				req.setRequestHeader('Authorization', make_base_auth('ylm201@126.com','58814023'));
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

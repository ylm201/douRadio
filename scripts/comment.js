//构造签名头部
function getRequestHeader(data){
	var message = {
		method: data.method,
		action: data.auth_url,	
		parameters: {
			oauth_consumer_key: data.consumer_key,
			oauth_token: data.access_key,
			oauth_signature_method: "HMAC-SHA1",
			oauth_signature: "",
			oauth_timestamp: "",
			oauth_nonce: "",
			status:data.content
		}
	}
	// 签名
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, {
		consumerSecret: data.comsumerP_key,
		tokenSecret: data.access_token,
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

/**
 *发送评论
 * */
function sendComment(data){
	$.ajax({
		url : data.post_url,
		type : "POST",
		data:{data.content}
		beforeSend : function(req) {
			req.setRequestHeader('Authorization',getRequestHeader(data));
		},
		error:function(XmlHttpRequest,textStatus,errortown){
			console.log("评论时发生错误",errortown)
		}
	};
}


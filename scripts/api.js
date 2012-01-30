//构造签名头部
function getRequestHeader(data,api){
	var message = {
		method: data.method,
		action: data.url,	
		parameters: {
			oauth_consumer_key: api.api_key,
			oauth_token: api.access_token,
			oauth_signature_method: "HMAC-SHA1",
			oauth_signature: "",
			oauth_timestamp: "",
			oauth_nonce: ""
		}
	}
	// 签名
	console.log(typeof data.content)
	if(data.content&&typeof data.content!='string'){
		$.extend(message.parameters,data.content)
		console.log("message:"+message)
	}
	OAuth.setTimestampAndNonce(message);
	console.log("sign:"+api.consumer_secret+","+api.access_secret)
	OAuth.SignatureMethod.sign(message, {
		consumerSecret: api.api_key_secret,
		tokenSecret: api.access_secret
	});
	console.log("sign parameters")
	console.log(message)
	//构造OAuth头部
	var oauth_header = "OAuth realm=\"\", oauth_consumer_key=";
	oauth_header += message.parameters.oauth_consumer_key + ', oauth_nonce=';
	oauth_header += message.parameters.oauth_nonce + ', oauth_timestamp=';
	oauth_header += message.parameters.oauth_timestamp + ', oauth_signature_method=HMAC-SHA1, oauth_signature=';
	oauth_header += message.parameters.oauth_signature + ', oauth_token=';
	oauth_header += message.parameters.oauth_token;	
	return oauth_header		
}

/**,

 *发送Api请求
 @method POST/GET
 @url Api请求的URL
 @consumer_key 
 @access_token
 @consumer_secret
 @access_secret
 * */
function sendApiRequest(data){
	var t=getRequestMeta(data.type)
	$.ajax({
		url : data.url,
		type : data.method,
		data:data.content?data.content:null,
		contentType:data.contentType?data.contentType:"application/x-www-form-urlencoded",
		beforeSend : function(req) {
			req.setRequestHeader('Authorization',getRequestHeader(data,t));
		},
		error:function(XmlHttpRequest,textStatus,errortown){
			console.log("请求时发生错误发生错误",errortown)
		},
		success:function(obj){
			data.onSuccess(obj)
		}
	});
}
/**
 *获取api_secret等请求信息
 @type api类型（fanfou,sina,douban）
 * **/
function getRequestMeta(type){
	var api_meta=api_list[type];
	var s=localStorage[type].split(",");
	api_meta.access_token=s[0];
	api_meta.access_secret=s[1];
	return api_meta;
}

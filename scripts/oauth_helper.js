/**
 *集成Oauth与chrome extension api 实现oauth认证
 * */
var OAuthHelper=function(arg){
	this.api_key =arg.api_key
	this.api_key_secret =arg.api_key_secret
	this.request_token = "";
	this.request_token_secret = "";
	this.access_token = "";
	this.access_token_secret = "";
	this.signature_method = arg.signature_method
	this.request_token_uri = arg.request_token_url 
	this.access_token_uri = arg.access_token_url
	this.authorization_uri = arg.authorization_url
	this.prefix=arg.prefix	
}

OAuthHelper.prototype.getRequestToken=function(){
	var message = {
		method: "GET",
		action: this.request_token_uri,
		parameters: {
			oauth_consumer_key: this.api_key,
			oauth_signature_method: this.signature_method,
			oauth_signature: "",
			oauth_timestamp: "",
			oauth_nonce: ""
		}
	}
	// 签名
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, {
		consumerSecret: this.api_key_secret
	})

	$.get(message.action,message.parameters,function(response){
		var responseObj = OAuth.getParameterMap(OAuth.decodeForm(response));				
		this.request_token = responseObj.oauth_token
		this.request_token_secret = responseObj.oauth_token_secret
		console.log("request token: "this.request_token_secret)
		console.loga("request token secret: "this.request_token_secret)
		var url=authorization_uri + request_token+"&oauth_callback="+encodeURI(window.location.href);		
		chrome.tabs.create({url:url})
		this.onAuthorized()	
	})									
}

/**
 *
 * */
OAuthHelper.prototype.onAuthorized=function(){
	var self=this
	chrome.tabs.onUpdated.addListener(function(tabId,info,tab){
		if(info.url.endWith("oauth_callback"){
			self.getAccessToken()
		}
	})
}

OAuthHelper.getAccessToken=function(){
	var message = {
		method: "GET",
		action: this,access_token_uri,
		parameters: {
			oauth_consumer_key: this.api_key,
			oauth_token:this.request_token 
			oauth_signature_method: this.signature_method,
			oauth_signature: "",
			oauth_timestamp: "",
			oauth_nonce: ""
		}
	}
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, {
		consumerSecret: this.api_key_secret,
		tokenSecret: this.request_key_secret
	});
	var self=this
	$.get(access_token_uri,message.parameters,function(response){
		var responseObj = OAuth.getParameterMap(OAuth.decodeForm(response));
		access_token = responseObj.oauth_token
		access_token_secret = responseObj.oauth_token_secret
		localStorage[self.prefix+"_access_token"]=access_token
		localStorage[self.prefix+"_access_secret"]=access_token_secret			
	})		
}

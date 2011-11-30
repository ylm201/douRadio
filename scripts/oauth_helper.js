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


OAuthHelper.prototype.auth=function(){
	this.getRequestToken()

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
	var self=this
	$.get(message.action,message.parameters,function(response){
		var responseObj = OAuth.getParameterMap(OAuth.decodeForm(response));				
		self.request_token = responseObj.oauth_token
		self.request_token_secret = responseObj.oauth_token_secret
		console.log("request token: "+self.request_token)
		console.log("request token secret: "+self.request_token_secret)
		var url=self.authorization_uri + self.request_token+"&oauth_callback="+encodeURI(window.location.origin+"/oauth_callback.htm");	
		console.log(url)
		chrome.tabs.create({url:url},function(tab){
			self.onAuthorized()	
		})
	})									
}

/**
 *
 * */
OAuthHelper.prototype.onAuthorized=function(){
	var self=this
	//var call_back_page=window.location.origin+"/oauth_callback.htm"
	chrome.tabs.onUpdated.addListener(function(tabId,info,tab){	
		var b=tab.url.indexOf(self.authorization_uri)
		console.log("vaildate result:"+b)
		if(info.status=="loading"&&tab.url.indexOf("oauth_callback.htm")>-1&&tab.url.indexOf(self.authorization_uri)<0){
			console.log("updated....."+tab.url)
			self.getAccessToken()
		}
	})
}

OAuthHelper.prototype.getAccessToken=function(){
	var message = {
		method: "GET",
		action: this.access_token_uri,
		parameters: {
			oauth_consumer_key: this.api_key,
			oauth_token:this.request_token, 
			oauth_signature_method: this.signature_method,
			oauth_signature: "",
			oauth_timestamp: "",
			oauth_nonce: ""
		}
	}
	OAuth.setTimestampAndNonce(message);
	console.log(this.api_key_secret)
	console.log(this.request_token_secret)
	OAuth.SignatureMethod.sign(message, {
		consumerSecret: this.api_key_secret,
		tokenSecret: this.request_token_secret
	});
	var self=this
	$.get(message.action,message.parameters,function(response){
		var responseObj = OAuth.getParameterMap(OAuth.decodeForm(response));
		access_token = responseObj.oauth_token
		access_token_secret = responseObj.oauth_token_secret
		console.log("access_token:"+access_token)
		console.log("access_token_secret:"+access_token_secret)
		localStorage[self.prefix+"_access_token"]=access_token
		localStorage[self.prefix+"_access_secret"]=access_token_secret
		alert("success")
	})		
}

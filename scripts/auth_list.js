var fanfou={
	request_token_url: "http://fanfou.com/oauth/request_token",
	access_token_url:  "http://fanfou.com/oauth/access_token",
	authorization_url: "http://fanfou.com/oauth/authorize?oauth_token=",
	api_key:"327fe47f56d57ead9539c3498772fc3d",
	api_key_secret:"688edd10e5a2c923cf9421a644240e70",
	callback:function(token,secret){
		sendApiRequest({
			url:"http://api.fanfou.com/account/verify_credentials.json",
			method:"GET",
			consumer_key:this.api_key,
			consumer_secret:this.api_key_secret,
			access_token:token, 
			access_secret:secret, 
			onSuccess:function(data){
				console.log(data)
				localStorage["fanfou"]=token+","+secret;
				if(localStorage["users"]){
					localStorage["users"]=localStorage["users"]+","+data.id+"|"+data.name+"|"+"fanfou"
				}else{
					localStorage["users"]=data.id+"|"+data.name+"|"+"fanfou"
				}
			}	
		})
	} 
}

var douban={
	api_key:"0458f5fa0cd49e2a0d0ae1ee267dda7e",
	api_key_secret:"8670104fb9f59f9d",
	request_token_url:"http://www.douban.com/service/auth/request_token",
	authorization_url:"http://www.douban.com/service/auth/authorize?oauth_token=",
	access_token_url:"http://www.douban.com/service/auth/access_token",
	callback:function(token,secret){//http://api.douban.com/people/@me
		sendApiRequest({
			url:"http://api.douban.com/people/%40me?alt=json",
			method:"GET",
			consumer_key:this.api_key,
			consumer_secret:this.api_key_secret,
			access_token:token, 
			access_secret:secret, 
			onSuccess:function(data){
				console.log(data)
				localStorage["douban"]=token+","+secret;
				if(localStorage["users"]){
					localStorage["users"]=localStorage["users"]+","+data["db:uid"].$t+"|"+data["title"].$t+"|"+"douban"
				}else{
					localStorage["users"]=data["db:uid"].$t+"|"+data["title"].$t+"|"+"douban"
				}
			}	
		})
	}
}


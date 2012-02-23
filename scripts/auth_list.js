var fanfou={
	type:"fanfou",
	request_token_url: "http://fanfou.com/oauth/request_token",
	access_token_url:  "http://fanfou.com/oauth/access_token",
	authorization_url: "http://fanfou.com/oauth/authorize?oauth_token=",
	api_key:"327fe47f56d57ead9539c3498772fc3d",
	api_key_secret:"688edd10e5a2c923cf9421a644240e70",
	callback:function(token,secret){
		sendApiRequest({
			type:"fanfou",
			url:"http://api.fanfou.com/account/verify_credentials.json",
			method:"GET",
			onSuccess:function(data){
				console.log(data)
				if(localStorage["users"]){
					localStorage["users"]=localStorage["users"]+","+data.id+"|"+data.name+"|"+"fanfou"
				}else{
					localStorage["users"]=data.id+"|"+data.name+"|"+"fanfou"
				}
				init()
			}	
		})
	} 
}

var douban={
	type:"douban",
	api_key:"0458f5fa0cd49e2a0d0ae1ee267dda7e",
	api_key_secret:"8670104fb9f59f9d",
	request_token_url:"http://www.douban.com/service/auth/request_token",
	authorization_url:"http://www.douban.com/service/auth/authorize?oauth_token=",
	access_token_url:"http://www.douban.com/service/auth/access_token",
	callback:function(token,secret){//http://api.douban.com/people/@me
		sendApiRequest({
			type:"douban",
			url:"http://api.douban.com/people/%40me?alt=json",
			method:"GET",
			onSuccess:function(data){
				console.log(data)
				if(localStorage["users"]){
					localStorage["users"]=localStorage["users"]+","+data["db:uid"].$t+"|"+data["title"].$t+"|"+"douban"
				}else{
					localStorage["users"]=data["db:uid"].$t+"|"+data["title"].$t+"|"+"douban"
				}
				init()
			}	
		})
	}
}

var sina={
	type:"sina",
	api_key:"2454233639",
	api_key_secret:"254c387e705f582a28f21e92bf8d892c",
	request_token_url:"http://api.t.sina.com.cn/oauth/request_token",
	access_token_url:"http://api.t.sina.com.cn/oauth/access_token",
	authorization_url:"http://api.t.sina.com.cn/oauth/authorize?oauth_token=",
	callback:function(token,secret){
		sendApiRequest({
			type:"sina",
			url:"http://api.t.sina.com.cn/account/verify_credentials.json",
			method:"GET",
			onSuccess:function(data){
				console.log(data)
				if(localStorage["users"]){
					localStorage["users"]=localStorage["users"]+","+data.id+"|"+data.name+"|"+"sina"
				}else{
					localStorage["users"]=data.id+"|"+data.name+"|"+"sina"
				}
				init()

			}
		})
	}	
}

var api_list={}
api_list["fanfou"]=fanfou
api_list["douban"]=douban
api_list["sina"]=sina

function doComment(id,content){
	$.ajaxSetup({async:false})
	content=content+" "+url
	if(id=="fanfou"){
		sendApiRequest({
			type:"fanfou",
			url:"http://api.fanfou.com/statuses/update.json",
			method:"POST",
			content:{status:content},
			onSuccess:function(data){
				console.log(data)
				$("#comment_popup").slideUp("slow",function(){
					$("#notify").fadeIn("slow").fadeOut("slow")
				})
			}
		})
	}

	if(id=="douban"){
	    var request_body = "<entry xmlns:ns0=\"http://www.w3.org/2005/Atom\""+
		   "xmlns:db=\"http://www.douban.com/xmlns/\">";		
	    	request_body += "<content>"+content+"</content>";
		request_body += "</entry>";		
		sendApiRequest({
			type:"douban",
			url:"http://api.douban.com/miniblog/saying",
			method:"POST",
			content:request_body,
			contentType:"application/atom+xml;charset=utf-8",
			onSuccess:function(data){
				console.log(data)
				$("#comment_popup").slideUp("slow",function(){
					$("#notify").fadeIn("slow").fadeOut("slow")
				})
			}
		})
	}
	
	if(id=="sina"){
		var song=radio.c_song
		var channel=localStorage["channel"]=="-1"?"0":localStorage["channel"]
		var url="http://douban.fm/?start="+song.sid+"g"+song.ssid+"g"+channel+"&cid="+channel
		sendApiRequest({
			type:"sina",
			url:"http://api.t.sina.com.cn/statuses/update.json",
			method:"POST",
			content:{status:content,source:"694135578"},
			onSuccess:function(data){
				console.log(data)
				$("#comment_popup").slideUp("slow",function(){
					$("#notify").fadeIn("slow").fadeOut("slow")
				})
			}
		})
	}
}

function shortUrl(url){
	console.log("url:"+url)
	var returnUrl;
	$.post("http://dwz.cn/create.php",{url:url},function(data){
		console.log(data)
		var v=$.parseJSON(data)
		returnUrl=v.tinyurl

	})
	return returnUrl	
}


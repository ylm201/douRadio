var addChannel=function(req){
	var channels=JSON.parse(localStorage.getItem("myChannels"));
		if (!channels) channels={};
		if(channels[req.id]){
			return false;
		}else{
			channels[req.id]=req.title;
			localStorage.setItem("myChannels",JSON.stringify(channels));
			return true;
		}
}
chrome.extension.onRequest.addListener(function(req,sender,resp){
	if(req.type=="addChannel"){
		var b=addChannel(req);
		if(b){
			resp({status:"N"})
		}else{
			resp({status:"Y"})
		}
	}
	if(req.type=="playChannel"){
		addChannel(req)
		localStorage.channel=req.id;
		radio.powerOn();	
		resp();
	}
	if(req.type=="playMusic"){
		localStorage.channel=0;
		localStorage.context=req.context;
		radio.powerOn();
		resp();
		var channels=JSON.parse(localStorage.getItem("myChannels"));
		if (!channels) channels={};
		if(channels[req.context]){
			return false;
		}else{
			channels[req.context]=req.title;
			localStorage.setItem("myChannels",JSON.stringify(channels));
			return true;
		}
	}
});

var addChannel=function(req){
	var channels=JSON.parse(localStorage.getItem("dj"));
		if (!channels) channels={};
		if(channels[req.id]){
			return false;
		}else{
			channels[req.id]=req.title;
			localStorage.setItem("dj",JSON.stringify(channels));
			return true;
		}
}
chrome.extension.onRequest.addListener(function(req,sender,resp){
	if(req.type=="playChannel"){
		addChannel(req)
		localStorage.channel="dj";
		localStorage.djc=req.id;
		//localStorage.removeItem("context");
		radio.powerOn();	
		resp();
	}
	if(req.type=="playMusic"){
		localStorage.channel="subject";
		localStorage.context=req.context;
		//localStorage.removeItem("djc");
		radio.powerOn();
		resp(req.title);
		var channels=JSON.parse(localStorage.getItem("subject"));
		if (!channels) channels={};
		if(!channels[req.context]){
			channels[req.context]=req.title;
			localStorage.setItem("subject",JSON.stringify(channels));
		}
	}
});

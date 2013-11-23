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

var _gaq = _gaq || [];
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
_gaq.push(['_setAccount', 'UA-27166419-4']);


chrome.runtime.onInstalled.addListener(function(detail){
	if(detail.reason=="update"){
		console.log("update");
		 _gaq.push(['_trackPageview',"update"]); 
	}else{
		console.log("install")
		_gaq.push(['_trackPageview',"install"]); 
	}
	//window.open("options.html");
})
chrome.browserAction.setTitle({title:"小豆电台"})

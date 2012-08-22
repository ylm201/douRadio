$(".ch-title").append("<span class='play-in-dou button' style='display:none'>小豆</span>")
$(".item-link").hover(function(){
	$(this).find(".play-in-dou").fadeIn();
},function(){
	$(this).find(".play-in-dou").fadeOut();
})
$(".play-in-dou").bind("click",function(){
	var id=$(this).parent().parent().find(".channel-id").val();
	var title=$(this).parent().parent().find(".ch-title").text();
	chrome.extension.sendRequest({type:"playChannel",id:id,title:replace(title)},function(resp){
		var span=$("<span id='playing'>正在播放："+replace(title)+"</span>");
		$("body").append(span);
		span.fadeIn(2000).fadeOut(2000)
	});
	return false;
})

var replace=function(title){
	var index=title.indexOf("MHz");
	return title.slice(0,index);
}

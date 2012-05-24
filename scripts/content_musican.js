if(/\/subject\/\d+\/?/.test(window.location.href)){
	if($(".a_song_interest").length>0){
		var span=$("span[property=v:itemreviewed]");
		span.after("<span class='play-in-dou button' style='display:inline-block'>小豆</span>");
		$(".play-in-dou").click(function(){
			var subject_id=window.location.pathname.split("/")[2];
			if(/\d+/.test(subject_id)){
				var title=$(this).siblings("span").text()
				chrome.extension.sendRequest({type:"playMusic",channel:0,context:"channel:0|subject_id:"+subject_id,title:title});
			}
		})
	}
}

if(/subject_search/.test(window.location.href)){
	if($(".start_radio_musician").length>0){
		$(".start_radio_musician").after("<span class='play-in-dou button ll' style='display:inline-block;margin-top:4px;'>小豆</span>")
			$(".play-in-dou").click(function(){
				var url=$(".start_radio_musician").attr("href");
				var context=url.split("?")[1];
					chrome.extension.sendRequest({type:"playMusic",channel:0,context:context});
			})
	}
}
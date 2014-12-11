var Radio=require("./radio");
var radio=Radio.init("#radio");
window.port=null;
var currentNotification=null;

function reportError(e){
	var stack=e.stack;
	var stacks=stack.split('\n')
	for(i in stacks){
		if(stacks[i].indexOf('chrome-extension://')>0){
			var params=stacks[1].split('/');
			console.log(params[params.length-1]+'_'+e.message);
			_gaq.push(['_trackEvent', 'JsError',params[params.length-1]+'_'+e.message]);
			break;
		}
	}
}

//校验是否登录douban.com，并把douban.com session cookie 设置到douban.fm域
var checkLogin=function(){
	chrome.cookies.get({
    url:"http://douban.com",
    name:"dbcl2"
    },function(cookie){
        if(cookie){
            chrome.cookies.set({
                url:"http://douban.fm",
                name:"dbcl2",
                value:cookie.value
            })
        }else{
        	port&&port.postMessage({type:'login'})
        }
    })
    chrome.cookies.get({
        url:"http://douban.com",
        name:"ck"
    },function(cookie){
        if(cookie){
            chrome.cookies.set({
                url:"http://douban.fm",
                name:"ck",
                value:cookie.value
            })
        }
    })
}
checkLogin();

//应用更新埋点
chrome.runtime.onInstalled.addListener(function (details){
	if(details.reason==='update'){
		if(details.previousVersion.indexOf('3\.1\.')<0){//仅主版本号不一致才显示更新列表页面
			window.open('options.html')
		}
		_gaq.push(['_trackEvent', 'update', chrome.app.getDetails().version,details.previousVersion]);
	}
})

//统计脚本
radio.on("songEnded",function(currentSong){
	_gaq.push(['_trackEvent', 'play', this.kind=="session"?"session":"normal",currentSong&&currentSong.kbps]);
})

//歌曲切换
radio.on("songChanged",function(currentSong){
	port&&port.postMessage({type:'songChanged',obj:currentSong});
	//popup未弹出时才发起桌面通知;播放时才显示通知，防止extension刚加载时就弹出通知
	if(!port&&!radio.audio.paused&&localStorage.enableNotify!='N'){
		//当前已经有桌面通知则关闭
		currentNotification&&chrome.notifications.clear(currentNotification,function(){})
		chrome.notifications.create('',
			{
				iconUrl:radio.currentSong.picture,
				title:radio.currentSong.artist,
				message:radio.currentSong.title,
				type:'basic',
				buttons:[{title:'下一首'}]
			},
			function(id){
				currentNotification=id;
				setTimeout(function(){chrome.notifications.clear(id,function(){})},6000)
				chrome.notifications.onButtonClicked.addListener(function(clickId,index){
					if(clickId==id&&index==0){
						_gaq.push(['_trackEvent', 'click', 'skipFromNotify']);
						radio.skip()
					}
				})
			}
		)
	}
	chrome.browserAction.setTitle({title:radio.currentSong.artist+":"+radio.currentSong.title});
})

//歌曲播放中
radio.on("playing",function(time){
	port&&port.postMessage({type:'playing',obj:{currentTime:time.currentTime,duration:time.duration}});
})

chrome.extension.onConnect.addListener(function(port){
	if(port.name!="douRadio") return;
	window.port=port;
	
	//background与popup断开连接
	port.onDisconnect.addListener(function(){
		window.port=undefined;
	})
	
	// 校验登录
	checkLogin();
	
	port.postMessage(
	{
		type:"init",
		obj:{
			currentSong:radio.currentSong?radio.currentSong:{title:'--',artist:'--',picture:'/img/cd.jpg',like:0},
			playing:!radio.audio.paused,
			volume:radio.audio.volume,
			isReplay:radio.isReplay,
			time:{currentTime:radio.audio.currentTime,duration:radio.audio.duration},
			heared:radio.heared
		}
	})
	port.onMessage.addListener(function(request){
		
		try{
			if(request.type=="skip"){
				radio.skip();
				return
			}
			if(request.type=="delete"){
				radio.del();
				return
			}
			if(request.type=="toggleLike"){
				if(radio.currentSong.like==0){
					radio.like()
					radio.currentSong.like=1;
				}else{
					radio.unlike()
					radio.currentSong.like=0;
				}
				return
			}
			if(request.type=="switch"){
				radio.powerOn()
				return
			}
			if(request.type=="togglePlay"){
				if(radio.currentSong==null){
					radio.powerOn();
				}else{
					radio.audio.paused?radio.audio.play():radio.audio.pause();
				}
				return
			}
			if(request.type=='toggleReplay'){
				radio.isReplay=!radio.isReplay;
				return;
			}
			if(request.type=="changeVolume"){
				radio.audio.volume=request.value
				localStorage.volume=request.value;
				return
			}
			if(request.type=='changeChannel'){
				localStorage['channelId']=request.channel.channelId;
				localStorage['channelName']=request.channel.channelName;
				localStorage['channelCollected']=request.channel.channelCollected;
				radio.powerOn();
				return;
			}
			if(request.type=='directPlay'){
				radio.directPlay(request.sid);
				return;
			}
			if(request.type=='directToggleLike'){
				radio.directToggleLike(request.sid);
				return;
			}
			if(request.type=='analysis'){
				_gaq.push(request.trackParams);
				return;
			}
			return;
		}catch(e){
			reportError(e);
		}
	})
})
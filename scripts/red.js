var Red=function(){
	this.total=0
}


Red.prototype.init=function(){
	//初始化加心歌曲总数
	$.ajaxSetup({async:false})
	var self=this
	$.get("http://douban.fm/mine",{start:0,type:'liked'},function(content){
		var total=$(content).find(".stat-liked i").text()
		self.total=parseInt(total)
		console.log("get total:"+self.total)
	})
}

Red.prototype.getSongList=function(){
	var page=Math.round(Math.random()*this.total)
	page=parseInt(page/15)*15	
	console.log("get red songs from page:"+page)
	return this.getSongs(page)
}

Red.prototype.getSongs=function(page){
	var redSongs=[]
	$.get("http://douban.fm/mine",{start:page,type:'liked'},function(content){
		var total=$(content).find(".stat-liked i").text()
		total=parseInt(total)
		$(content).find(".info_wrapper").each(function(index){
			var songId=$(this).find(".action").attr("sid")
			var url="http://otho.douban.com/view/song/small/p"+songId+".mp3"
			var albumUrl=$(this).find(".source a").attr("href")
			var album=$(this).find(".source a").text()
			var title=$(this).find(".song_title").text()
		        var performer=$(this).find(".performer").text()
			var song={
				sid:songId,
				url:url,
				album:album,
				albumUrl:albumUrl,
				artist:performer,
				title:title,
				like:1	
			}
			redSongs.push(song)
		})
		//随机排序
		redSongs.sort(function(){
			return Math.random()-0.5
		})
		//每页随机抽4首歌曲
		if(redSongs.length>4){
			redSongs=redSongs.slice(0,2)
		}
	})
	return redSongs
}



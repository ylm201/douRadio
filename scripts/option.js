$(function(){
	$("#enable_notify").bind("click",function(){
		if($(this)[0].checked==true){
            localStorage.setItem('enableNotify','Y');
		}else{
			localStorage.setItem('enableNotify','N');
		}
	});
	
	$("#filter_ad").bind("click",function(){
		if($(this)[0].checked==true){
            localStorage.setItem('filterAd','Y');
		}else{
			localStorage.setItem('filterAd','N');
		}
	});
	
	$("#auto_play").bind("click",function(){
		if($(this)[0].checked==true){
            localStorage.setItem('autoPlay','Y');
		}else{
			localStorage.setItem('autoPlay','N');
		}
	});
	
	if(localStorage.autoShare){
		$("#red_heart_share")[0].checked=true
		$("#"+localStorage.autoShare)[0].checked=true
		$("#if_share").show()
	}
	
	$("#red_heart_share").bind("click",function(){
		if(this.checked){
			$("#if_share").fadeIn()
		}else{
			$("#if_share").fadeOut()
			localStorage.removeItem("autoShare")
			$(".share").attr("checked",false)
		}
	})
	
	$(".share").bind("click",function(){
		localStorage.autoShare=this.id
	})

	$("#if_setting").bind("click",function(){
		if(this.checked==false){
			localStorage.settingShow=false
			$("#info").fadeIn()
		}else{
			localStorage.settingShow=true
			$("#info").fadeOut()
		}		
	})
	
	
    if(localStorage.getItem('enableNotify')!='N'){
        $('#enable_notify')[0].checked=true;
    }else{
        $('#enable_notify')[0].checked=false;
    }
	
	if(localStorage.getItem('filterAd')!='Y'){
        $('#filter_ad')[0].checked=false;
    }else{
        $('#filter_ad')[0].checked=true;
    }
	
	if(localStorage.getItem('autoPlay')!='Y'){
		$('#auto_play')[0].checked=false;
	}else{
		$('#auto_play')[0].checked=true;
	}
});

$(function(){
	$("#enable_notify").bind("click",function(){
		if($(this)[0].checked==true){
            localStorage.setItem('enableNotify','Y');
		}else{
			localStorage.setItem('enableNotify','N');
		}
	});
	
	$("#enable_ad").bind("click",function(){
		if($(this)[0].checked==true){
            localStorage.setItem('enableAd','Y');
		}else{
			localStorage.setItem('enableAd','N');
		}
	});
	
    if(localStorage.getItem('enableNotify')!='N'){
        $('#enable_notify')[0].checked=true;
    }else{
        $('#enable_notify')[0].checked=false;
    }
	
	if(localStorage.getItem('enableAd')!='N'){
        $('#enable_ad')[0].checked=true;
    }else{
        $('#enable_ad')[0].checked=false;
    }
});

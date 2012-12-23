$(function(){
	$("#enable_notify").bind("click",function(){
		if($(this)[0].checked==true){
            localStorage.setItem('enableNotify','Y');
		}else{
			localStorage.setItem('enableNotify','N');
		}
	});

    if(localStorage.getItem('enableNotify')!='N'){
        $('#enable_notify')[0].checked=true;
    }else{
        $('#enable_notify')[0].checked=false;
    }
});

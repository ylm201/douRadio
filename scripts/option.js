$(function(){
	$("#enable_notify").bind("click",function(){
		if($(this).val()=="Y"){
            localStorage.setItem('enableNotify','Y');
		}else{
			localStorage.setItem('enableNotify','N');
		}
	});

    if(localStorage.getItem('enableNotify')!='N'){
        $('#enable_notify').setAttribute('checked','true');
    }else{
        $('#enable_notify').setAttribute('checked','false');
    }
});

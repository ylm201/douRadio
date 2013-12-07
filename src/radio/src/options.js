define(function(require, exports, module){
	$=require("$");
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
    
    $("input[name='bitrate']").bind("click",function(){
        localStorage.setItem('bitrate',$(this).val());
    });

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

    var selector=".bitrate[value='"+(localStorage.bitrate?localStorage.bitrate:'64')+"']";
    $(selector).attr("checked","true");

});
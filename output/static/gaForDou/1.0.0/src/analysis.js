define("gaForDou/1.0.0/src/analysis",["jquery/1.10.1/jquery"],function(){define(function(t,e,n){$=t("jquery/1.10.1/jquery"),window._gaq=window._gaq||[],function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://ssl.google-analytics.com/ga.js";var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)}(),_gaq.push(["_setAccount","UA-27166419-5"]),_gaq.push(["_trackPageview",location.href]),$("body").on("click","[seed]",function(){var t=$(this).attr("seed"),e=t.split("_");2==e.length?_gaq.push(["_trackEvent",e[0],e[1]]):3==e.length&&_gaq.push(["_trackEvent",e[0],e[1],e[2]])});var a={trackEvent:function(){2==arguments.length?_gaq.push(["_trackEvent",arguments[0],arguments[1]]):3==arguments.length&&_gaq.push(["_trackEvent",arguments[0],arguments[1],arguments[2]])}};n.exports=a})});
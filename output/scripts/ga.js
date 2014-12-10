window._gaq = window._gaq || [];
(function() {
        var ga = document.createElement('script'); 
        ga.type = 'text/javascript'; 
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; 
        s.parentNode.insertBefore(ga, s);
})();
_gaq.push(['_setAccount', 'UA-27166419-5']);


window.onerror = function(message, url, line, col) {
	console.log(message);
	_gaq.push(['_trackEvent', 'JsError', url + ':' + line + ':'+col+':' + message]);
}
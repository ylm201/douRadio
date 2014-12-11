seajs.config({
  base: "/static/",
});
seajs.use("background/1.0.0/background-debug");
window.onerror = function(message, url, line, col) {
	console.log(message);
	_gaq.push(['_trackEvent', 'JsError', url + ':' + line + ':'+col+':' + message]);
}

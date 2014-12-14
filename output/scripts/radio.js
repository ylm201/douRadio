seajs.config({
  base: "/static/",
});
seajs.use("background/1.0.0/background");
window.onerror = function(message, url, line, col) {
	console.error(message);
	_gaq.push(['_trackEvent', 'JsError', url + ':' + line + ':'+col+':' + message, chrome.app.getDetails().version]);
}

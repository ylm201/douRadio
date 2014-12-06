define("backbone/1.1.2/backbone",["underscore/1.6.0/underscore","jquery/1.10.1/jquery"],function(t,e){var i=this,s=e,n=t("underscore/1.6.0/underscore"),r=t("jquery/1.10.1/jquery"),a=i.Backbone,h=[],o=h.slice;s.VERSION="1.1.2",s.$=r,s.noConflict=function(){return i.Backbone=a,this},s.emulateHTTP=!1,s.emulateJSON=!1;var u=s.Events={on:function(t,e,i){if(!l(this,"on",t,[e,i])||!e)return this;this._events||(this._events={});var s=this._events[t]||(this._events[t]=[]);return s.push({callback:e,context:i,ctx:i||this}),this},once:function(t,e,i){if(!l(this,"once",t,[e,i])||!e)return this;var s=this,r=n.once(function(){s.off(t,r),e.apply(this,arguments)});return r._callback=e,this.on(t,r,i)},off:function(t,e,i){if(!this._events||!l(this,"off",t,[e,i]))return this;if(!t&&!e&&!i)return this._events=void 0,this;for(var s=t?[t]:n.keys(this._events),r=0,a=s.length;a>r;r++){t=s[r];var h=this._events[t];if(h)if(e||i){for(var o=[],u=0,c=h.length;c>u;u++){var d=h[u];(e&&e!==d.callback&&e!==d.callback._callback||i&&i!==d.context)&&o.push(d)}o.length?this._events[t]=o:delete this._events[t]}else delete this._events[t]}return this},trigger:function(t){if(!this._events)return this;var e=o.call(arguments,1);if(!l(this,"trigger",t,e))return this;var i=this._events[t],s=this._events.all;return i&&d(i,e),s&&d(s,arguments),this},stopListening:function(t,e,i){var s=this._listeningTo;if(!s)return this;var r=!e&&!i;i||"object"!=typeof e||(i=this),t&&((s={})[t._listenId]=t);for(var a in s)t=s[a],t.off(e,i,this),(r||n.isEmpty(t._events))&&delete this._listeningTo[a];return this}},c=/\s+/,l=function(t,e,i,s){if(!i)return!0;if("object"==typeof i){for(var n in i)t[e].apply(t,[n,i[n]].concat(s));return!1}if(c.test(i)){for(var r=i.split(c),a=0,h=r.length;h>a;a++)t[e].apply(t,[r[a]].concat(s));return!1}return!0},d=function(t,e){var i,s=-1,n=t.length,r=e[0],a=e[1],h=e[2];switch(e.length){case 0:for(;++s<n;)(i=t[s]).callback.call(i.ctx);return;case 1:for(;++s<n;)(i=t[s]).callback.call(i.ctx,r);return;case 2:for(;++s<n;)(i=t[s]).callback.call(i.ctx,r,a);return;case 3:for(;++s<n;)(i=t[s]).callback.call(i.ctx,r,a,h);return;default:for(;++s<n;)(i=t[s]).callback.apply(i.ctx,e);return}},f={listenTo:"on",listenToOnce:"once"};n.each(f,function(t,e){u[e]=function(e,i,s){var r=this._listeningTo||(this._listeningTo={}),a=e._listenId||(e._listenId=n.uniqueId("l"));return r[a]=e,s||"object"!=typeof i||(s=this),e[t](i,s,this),this}}),u.bind=u.on,u.unbind=u.off,n.extend(s,u);var p=s.Model=function(t,e){var i=t||{};e||(e={}),this.cid=n.uniqueId("c"),this.attributes={},e.collection&&(this.collection=e.collection),e.parse&&(i=this.parse(i,e)||{}),i=n.defaults({},i,n.result(this,"defaults")),this.set(i,e),this.changed={},this.initialize.apply(this,arguments)};n.extend(p.prototype,u,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(){return n.clone(this.attributes)},sync:function(){return s.sync.apply(this,arguments)},get:function(t){return this.attributes[t]},escape:function(t){return n.escape(this.get(t))},has:function(t){return null!=this.get(t)},set:function(t,e,i){var s,r,a,h,o,u,c,l;if(null==t)return this;if("object"==typeof t?(r=t,i=e):(r={})[t]=e,i||(i={}),!this._validate(r,i))return!1;a=i.unset,o=i.silent,h=[],u=this._changing,this._changing=!0,u||(this._previousAttributes=n.clone(this.attributes),this.changed={}),l=this.attributes,c=this._previousAttributes,this.idAttribute in r&&(this.id=r[this.idAttribute]);for(s in r)e=r[s],n.isEqual(l[s],e)||h.push(s),n.isEqual(c[s],e)?delete this.changed[s]:this.changed[s]=e,a?delete l[s]:l[s]=e;if(!o){h.length&&(this._pending=i);for(var d=0,f=h.length;f>d;d++)this.trigger("change:"+h[d],this,l[h[d]],i)}if(u)return this;if(!o)for(;this._pending;)i=this._pending,this._pending=!1,this.trigger("change",this,i);return this._pending=!1,this._changing=!1,this},unset:function(t,e){return this.set(t,void 0,n.extend({},e,{unset:!0}))},clear:function(t){var e={};for(var i in this.attributes)e[i]=void 0;return this.set(e,n.extend({},t,{unset:!0}))},hasChanged:function(t){return null==t?!n.isEmpty(this.changed):n.has(this.changed,t)},changedAttributes:function(t){if(!t)return this.hasChanged()?n.clone(this.changed):!1;var e,i=!1,s=this._changing?this._previousAttributes:this.attributes;for(var r in t)n.isEqual(s[r],e=t[r])||((i||(i={}))[r]=e);return i},previous:function(t){return null!=t&&this._previousAttributes?this._previousAttributes[t]:null},previousAttributes:function(){return n.clone(this._previousAttributes)},fetch:function(t){t=t?n.clone(t):{},void 0===t.parse&&(t.parse=!0);var e=this,i=t.success;return t.success=function(s){return e.set(e.parse(s,t),t)?(i&&i(e,s,t),void e.trigger("sync",e,s,t)):!1},U(this,t),this.sync("read",this,t)},save:function(t,e,i){var s,r,a,h=this.attributes;if(null==t||"object"==typeof t?(s=t,i=e):(s={})[t]=e,i=n.extend({validate:!0},i),s&&!i.wait){if(!this.set(s,i))return!1}else if(!this._validate(s,i))return!1;s&&i.wait&&(this.attributes=n.extend({},h,s)),void 0===i.parse&&(i.parse=!0);var o=this,u=i.success;return i.success=function(t){o.attributes=h;var e=o.parse(t,i);return i.wait&&(e=n.extend(s||{},e)),n.isObject(e)&&!o.set(e,i)?!1:(u&&u(o,t,i),void o.trigger("sync",o,t,i))},U(this,i),r=this.isNew()?"create":i.patch?"patch":"update","patch"===r&&(i.attrs=s),a=this.sync(r,this,i),s&&i.wait&&(this.attributes=h),a},destroy:function(t){t=t?n.clone(t):{};var e=this,i=t.success,s=function(){e.trigger("destroy",e,e.collection,t)};if(t.success=function(n){(t.wait||e.isNew())&&s(),i&&i(e,n,t),e.isNew()||e.trigger("sync",e,n,t)},this.isNew())return t.success(),!1;U(this,t);var r=this.sync("delete",this,t);return t.wait||s(),r},url:function(){var t=n.result(this,"urlRoot")||n.result(this.collection,"url")||j();return this.isNew()?t:t.replace(/([^\/])$/,"$1/")+encodeURIComponent(this.id)},parse:function(t){return t},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return!this.has(this.idAttribute)},isValid:function(t){return this._validate({},n.extend(t||{},{validate:!0}))},_validate:function(t,e){if(!e.validate||!this.validate)return!0;t=n.extend({},this.attributes,t);var i=this.validationError=this.validate(t,e)||null;return i?(this.trigger("invalid",this,i,n.extend(e,{validationError:i})),!1):!0}});var g=["keys","values","pairs","invert","pick","omit"];n.each(g,function(t){n[t]&&(p.prototype[t]=function(){var e=o.call(arguments);return e.unshift(this.attributes),n[t].apply(n,e)})});var v=s.Collection=function(t,e){e||(e={}),e.model&&(this.model=e.model),void 0!==e.comparator&&(this.comparator=e.comparator),this._reset(),this.initialize.apply(this,arguments),t&&this.reset(t,n.extend({silent:!0},e))},m={add:!0,remove:!0,merge:!0},_={add:!0,remove:!1};n.extend(v.prototype,u,{model:p,initialize:function(){},toJSON:function(t){return this.map(function(e){return e.toJSON(t)})},sync:function(){return s.sync.apply(this,arguments)},add:function(t,e){return this.set(t,n.extend({merge:!1},e,_))},remove:function(t,e){var i=!n.isArray(t);t=i?[t]:n.clone(t),e||(e={});for(var s=0,r=t.length;r>s;s++){var a=t[s]=this.get(t[s]);if(a){delete this._byId[a.id],delete this._byId[a.cid];var h=this.indexOf(a);this.models.splice(h,1),this.length--,e.silent||(e.index=h,a.trigger("remove",a,this,e)),this._removeReference(a,e)}}return i?t[0]:t},set:function(t,e){e=n.defaults({},e,m),e.parse&&(t=this.parse(t,e));var i=!n.isArray(t);t=i?t?[t]:[]:t.slice();for(var s,r,a,h,o,u=e.at,c=this.comparator&&null==u&&e.sort!==!1,l=n.isString(this.comparator)?this.comparator:null,d=[],f=[],p={},g=e.add,v=e.merge,_=e.remove,y=!c&&g&&_?[]:!1,b=0,w=t.length;w>b;b++){if(a=t[b]||{},s=this._isModel(a)?r=a:a[this.model.prototype.idAttribute||"id"],h=this.get(s))_&&(p[h.cid]=!0),v&&(a=a===r?r.attributes:a,e.parse&&(a=h.parse(a,e)),h.set(a,e),c&&!o&&h.hasChanged(l)&&(o=!0)),t[b]=h;else if(g){if(r=t[b]=this._prepareModel(a,e),!r)continue;d.push(r),this._addReference(r,e)}r=h||r,r&&(!y||!r.isNew()&&p[r.id]||y.push(r),p[r.id]=!0)}if(_){for(var b=0,w=this.length;w>b;b++)p[(r=this.models[b]).cid]||f.push(r);f.length&&this.remove(f,e)}if(d.length||y&&y.length)if(c&&(o=!0),this.length+=d.length,null!=u)for(var b=0,w=d.length;w>b;b++)this.models.splice(u+b,0,d[b]);else{y&&(this.models.length=0);for(var x=y||d,b=0,w=x.length;w>b;b++)this.models.push(x[b])}if(o&&this.sort({silent:!0}),!e.silent){for(var b=0,w=d.length;w>b;b++)(r=d[b]).trigger("add",r,this,e);(o||y&&y.length)&&this.trigger("sort",this,e)}return i?t[0]:t},reset:function(t,e){e||(e={});for(var i=0,s=this.models.length;s>i;i++)this._removeReference(this.models[i],e);return e.previousModels=this.models,this._reset(),t=this.add(t,n.extend({silent:!0},e)),e.silent||this.trigger("reset",this,e),t},push:function(t,e){return this.add(t,n.extend({at:this.length},e))},pop:function(t){var e=this.at(this.length-1);return this.remove(e,t),e},unshift:function(t,e){return this.add(t,n.extend({at:0},e))},shift:function(t){var e=this.at(0);return this.remove(e,t),e},slice:function(){return o.apply(this.models,arguments)},get:function(t){return null==t?void 0:this._byId[t]||this._byId[t.id]||this._byId[t.cid]},at:function(t){return this.models[t]},where:function(t,e){return n.isEmpty(t)?e?void 0:[]:this[e?"find":"filter"](function(e){for(var i in t)if(t[i]!==e.get(i))return!1;return!0})},findWhere:function(t){return this.where(t,!0)},sort:function(t){if(!this.comparator)throw new Error("Cannot sort a set without a comparator");return t||(t={}),n.isString(this.comparator)||1===this.comparator.length?this.models=this.sortBy(this.comparator,this):this.models.sort(n.bind(this.comparator,this)),t.silent||this.trigger("sort",this,t),this},pluck:function(t){return n.invoke(this.models,"get",t)},fetch:function(t){t=t?n.clone(t):{},void 0===t.parse&&(t.parse=!0);var e=t.success,i=this;return t.success=function(s){var n=t.reset?"reset":"set";i[n](s,t),e&&e(i,s,t),i.trigger("sync",i,s,t)},U(this,t),this.sync("read",this,t)},create:function(t,e){if(e=e?n.clone(e):{},!(t=this._prepareModel(t,e)))return!1;e.wait||this.add(t,e);var i=this,s=e.success;return e.success=function(t,n){e.wait&&i.add(t,e),s&&s(t,n,e)},t.save(null,e),t},parse:function(t){return t},clone:function(){return new this.constructor(this.models,{model:this.model,comparator:this.comparator})},_reset:function(){this.length=0,this.models=[],this._byId={}},_prepareModel:function(t,e){if(this._isModel(t))return t.collection||(t.collection=this),t;e=e?n.clone(e):{},e.collection=this;var i=new this.model(t,e);return i.validationError?(this.trigger("invalid",this,i.validationError,e),!1):i},_isModel:function(t){return t instanceof p},_addReference:function(t){this._byId[t.cid]=t,null!=t.id&&(this._byId[t.id]=t),t.on("all",this._onModelEvent,this)},_removeReference:function(t){this===t.collection&&delete t.collection,t.off("all",this._onModelEvent,this)},_onModelEvent:function(t,e,i,s){("add"!==t&&"remove"!==t||i===this)&&("destroy"===t&&this.remove(e,s),e&&t==="change:"+e.idAttribute&&(delete this._byId[e.previous(e.idAttribute)],null!=e.id&&(this._byId[e.id]=e)),this.trigger.apply(this,arguments))}});var y=["forEach","each","map","collect","reduce","foldl","inject","reduceRight","foldr","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","toArray","size","first","head","take","initial","rest","tail","drop","last","without","difference","indexOf","shuffle","lastIndexOf","isEmpty","chain","sample","partition"];n.each(y,function(t){n[t]&&(v.prototype[t]=function(){var e=o.call(arguments);return e.unshift(this.models),n[t].apply(n,e)})});var b=["groupBy","countBy","sortBy","indexBy"];n.each(b,function(t){n[t]&&(v.prototype[t]=function(e,i){var s=n.isFunction(e)?e:function(t){return t.get(e)};return n[t](this.models,s,i)})});var w=s.View=function(t){this.cid=n.uniqueId("view"),t||(t={}),n.extend(this,n.pick(t,E)),this._ensureElement(),this.initialize.apply(this,arguments)},x=/^(\S+)\s*(.*)$/,E=["model","collection","el","id","attributes","className","tagName","events"];n.extend(w.prototype,u,{tagName:"div",$:function(t){return this.$el.find(t)},initialize:function(){},render:function(){return this},remove:function(){return this._removeElement(),this.stopListening(),this},_removeElement:function(){this.$el.remove()},setElement:function(t){return this.undelegateEvents(),this._setElement(t),this.delegateEvents(),this},_setElement:function(t){this.$el=t instanceof s.$?t:s.$(t),this.el=this.$el[0]},delegateEvents:function(t){if(!t&&!(t=n.result(this,"events")))return this;this.undelegateEvents();for(var e in t){var i=t[e];if(n.isFunction(i)||(i=this[t[e]]),i){var s=e.match(x);this.delegate(s[1],s[2],n.bind(i,this))}}return this},delegate:function(t,e,i){this.$el.on(t+".delegateEvents"+this.cid,e,i)},undelegateEvents:function(){return this.$el&&this.$el.off(".delegateEvents"+this.cid),this},undelegate:function(t,e,i){this.$el.off(t+".delegateEvents"+this.cid,e,i)},_createElement:function(t){return document.createElement(t)},_ensureElement:function(){if(this.el)this.setElement(n.result(this,"el"));else{var t=n.extend({},n.result(this,"attributes"));this.id&&(t.id=n.result(this,"id")),this.className&&(t["class"]=n.result(this,"className")),this.setElement(this._createElement(n.result(this,"tagName"))),this._setAttributes(t)}},_setAttributes:function(t){this.$el.attr(t)}}),s.sync=function(t,e,i){var r=k[t];n.defaults(i||(i={}),{emulateHTTP:s.emulateHTTP,emulateJSON:s.emulateJSON});var a={type:r,dataType:"json"};if(i.url||(a.url=n.result(e,"url")||j()),null!=i.data||!e||"create"!==t&&"update"!==t&&"patch"!==t||(a.contentType="application/json",a.data=JSON.stringify(i.attrs||e.toJSON(i))),i.emulateJSON&&(a.contentType="application/x-www-form-urlencoded",a.data=a.data?{model:a.data}:{}),i.emulateHTTP&&("PUT"===r||"DELETE"===r||"PATCH"===r)){a.type="POST",i.emulateJSON&&(a.data._method=r);var h=i.beforeSend;i.beforeSend=function(t){return t.setRequestHeader("X-HTTP-Method-Override",r),h?h.apply(this,arguments):void 0}}"GET"===a.type||i.emulateJSON||(a.processData=!1),"PATCH"===a.type&&S&&(a.xhr=function(){return new ActiveXObject("Microsoft.XMLHTTP")});var o=i.error;i.error=function(t,e,s){i.textStatus=e,i.errorThrown=s,o&&o.apply(this,arguments)};var u=i.xhr=s.ajax(n.extend(a,i));return e.trigger("request",e,u,i),u};var S=!("undefined"==typeof window||!window.ActiveXObject||window.XMLHttpRequest&&(new XMLHttpRequest).dispatchEvent),k={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};s.ajax=function(){return s.$.ajax.apply(s.$,arguments)};var T=s.Router=function(t){t||(t={}),t.routes&&(this.routes=t.routes),this._bindRoutes(),this.initialize.apply(this,arguments)},H=/\((.*?)\)/g,P=/(\(\?)?:\w+/g,$=/\*\w+/g,I=/[\-{}\[\]+?.,\\\^$|#\s]/g;n.extend(T.prototype,u,{initialize:function(){},route:function(t,e,i){n.isRegExp(t)||(t=this._routeToRegExp(t)),n.isFunction(e)&&(i=e,e=""),i||(i=this[e]);var r=this;return s.history.route(t,function(n){var a=r._extractParameters(t,n);r.execute(i,a,e)!==!1&&(r.trigger.apply(r,["route:"+e].concat(a)),r.trigger("route",e,a),s.history.trigger("route",r,e,a))}),this},execute:function(t,e){t&&t.apply(this,e)},navigate:function(t,e){return s.history.navigate(t,e),this},_bindRoutes:function(){if(this.routes){this.routes=n.result(this,"routes");for(var t,e=n.keys(this.routes);null!=(t=e.pop());)this.route(t,this.routes[t])}},_routeToRegExp:function(t){return t=t.replace(I,"\\$&").replace(H,"(?:$1)?").replace(P,function(t,e){return e?t:"([^/?]+)"}).replace($,"([^?]*?)"),new RegExp("^"+t+"(?:\\?([\\s\\S]*))?$")},_extractParameters:function(t,e){var i=t.exec(e).slice(1);return n.map(i,function(t,e){return e===i.length-1?t||null:t?decodeURIComponent(t):null})}});var A=s.History=function(){this.handlers=[],n.bindAll(this,"checkUrl"),"undefined"!=typeof window&&(this.location=window.location,this.history=window.history)},C=/^[#\/]|\s+$/g,N=/^\/+|\/+$/g,R=/#.*$/;A.started=!1,n.extend(A.prototype,u,{interval:50,atRoot:function(){var t=this.location.pathname.replace(/[^\/]$/,"$&/");return t===this.root&&!this.location.search},getHash:function(t){var e=(t||this).location.href.match(/#(.*)$/);return e?e[1]:""},getPath:function(){var t=decodeURI(this.location.pathname+this.location.search),e=this.root.slice(0,-1);return t.indexOf(e)||(t=t.slice(e.length)),t.slice(1)},getFragment:function(t){return null==t&&(t=this._hasPushState||!this._wantsHashChange?this.getPath():this.getHash()),t.replace(C,"")},start:function(t){if(A.started)throw new Error("Backbone.history has already been started");A.started=!0,this.options=n.extend({root:"/"},this.options,t),this.root=this.options.root,this._wantsHashChange=this.options.hashChange!==!1,this._hasHashChange="onhashchange"in window,this._wantsPushState=!!this.options.pushState,this._hasPushState=!!(this.options.pushState&&this.history&&this.history.pushState),this.fragment=this.getFragment();var e=window.addEventListener||function(t,e){return attachEvent("on"+t,e)};if(this.root=("/"+this.root+"/").replace(N,"/"),!(this._hasHashChange||!this._wantsHashChange||this._wantsPushState&&this._hasPushState)){var i=document.createElement("iframe");i.src="javascript:0",i.style.display="none",i.tabIndex=-1;var s=document.body;this.iframe=s.insertBefore(i,s.firstChild).contentWindow,this.navigate(this.fragment)}if(this._hasPushState?e("popstate",this.checkUrl,!1):this._wantsHashChange&&this._hasHashChange&&!this.iframe?e("hashchange",this.checkUrl,!1):this._wantsHashChange&&(this._checkUrlInterval=setInterval(this.checkUrl,this.interval)),this._wantsHashChange&&this._wantsPushState){if(!this._hasPushState&&!this.atRoot())return this.location.replace(this.root+"#"+this.getPath()),!0;this._hasPushState&&this.atRoot()&&this.navigate(this.getHash(),{replace:!0})}return this.options.silent?void 0:this.loadUrl()},stop:function(){var t=window.removeEventListener||function(t,e){return detachEvent("on"+t,e)};this._hasPushState?t("popstate",this.checkUrl,!1):this._wantsHashChange&&this._hasHashChange&&!this.iframe&&t("hashchange",this.checkUrl,!1),this.iframe&&(document.body.removeChild(this.iframe.frameElement),this.iframe=null),this._checkUrlInterval&&clearInterval(this._checkUrlInterval),A.started=!1},route:function(t,e){this.handlers.unshift({route:t,callback:e})},checkUrl:function(){var t=this.getFragment();return t===this.fragment&&this.iframe&&(t=this.getHash(this.iframe)),t===this.fragment?!1:(this.iframe&&this.navigate(t),void this.loadUrl())},loadUrl:function(t){return t=this.fragment=this.getFragment(t),n.any(this.handlers,function(e){return e.route.test(t)?(e.callback(t),!0):void 0})},navigate:function(t,e){if(!A.started)return!1;e&&e!==!0||(e={trigger:!!e});var i=this.root+(t=this.getFragment(t||""));if(t=decodeURI(t.replace(R,"")),this.fragment!==t){if(this.fragment=t,""===t&&"/"!==i&&(i=i.slice(0,-1)),this._hasPushState)this.history[e.replace?"replaceState":"pushState"]({},document.title,i);else{if(!this._wantsHashChange)return this.location.assign(i);this._updateHash(this.location,t,e.replace),this.iframe&&t!==this.getHash(this.iframe)&&(e.replace||this.iframe.document.open().close(),this._updateHash(this.iframe.location,t,e.replace))}return e.trigger?this.loadUrl(t):void 0}},_updateHash:function(t,e,i){if(i){var s=t.href.replace(/(javascript:|#).*$/,"");t.replace(s+"#"+e)}else t.hash="#"+e}}),s.history=new A;var O=function(t,e){var i,s=this;i=t&&n.has(t,"constructor")?t.constructor:function(){return s.apply(this,arguments)},n.extend(i,s,e);var r=function(){this.constructor=i};return r.prototype=s.prototype,i.prototype=new r,t&&n.extend(i.prototype,t),i.__super__=s.prototype,i};p.extend=v.extend=T.extend=w.extend=A.extend=O;var j=function(){throw new Error('A "url" property or function must be specified')},U=function(t,e){var i=e.error;e.error=function(s){i&&i(t,s,e),t.trigger("error",t,s,e)}}});
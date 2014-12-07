//播放历史view
var Backbone, $ , _;
Backbone = require('backbone');
$ = require('jquery');
_ = require('underscore');
HistoryView = Backbone.View.extend({
    el:"#history",
    template:_.template($("#t_historyList").html()),
    events: {
        'click .J-direct-play': 'directPlay',
        'click .J-direct-toggle-like':'directToggleLike'
    },
    initialize:function () {
        this.render();
    },
    render: function () {
        var html = this.template({historyList:this.model});
        this.$el.html(html);
    },
    directPlay:function(o){
        console.debug("directPlay")
        this.port.postMessage({type:'directPlay',sid:$(o.target).attr('sid')});
    },
    directToggleLike:function(e){
        $(e.target).toggleClass('like').toggleClass('unlike');
        this.port.postMessage({type:'directToggleLike',sid:$(o.target).attr('sid')});
    }
});
module.exports = HistoryView;
define(function(require, exports, module){
    var Backbone, $ , _,share;
    Backbone = require('backbone');
    $ = require('$');
    _ = require('underscore');
    share=require('../share');
    var ChannelsView=require('./channels');
    PopupView = Backbone.View.extend({
        el:"#main",
        template:_.template($("#t_songInfo").html()),
        events: {
            'click #control a': 'play',
            'click #skip':'skip',
            'click #like':'like',
            'click #delete':'deleteSong',
            'click #search':'showChannels',
            'mouseover #control':'fadeOutCD',
            'mouseout #control':'fadeInCD',
            'mouseover #share':'showShareList',
            'mouseout  #share':'hideShareList',
            'click #shareList a':'share',
            'click #replay':'replay',
            'input #range':'volume'
        },
        initialize:function () {
            this.render();
            this.listenTo(this.model,'change:currentSong', this.changeSong);
            this.listenTo(this.model,'change:time',this.playing);
            this.listenTo(this.model,'change:loading',this.loading);
        },
        render: function () {
            var html = this.template(this.model.attributes);
            this.$el.html(html);
            this.playing();
        },
        realModel:function(){
            return this.model.attributes;
        },
        play:function() {
            var lastPlayingStatus=this.model.get('playing');
            this.model.set({playing:!lastPlayingStatus})
            this.port.postMessage({type:'togglePlay'});
            if(!lastPlayingStatus){
                $("#control a").attr('class','button playing');
                $("#cover").removeClass('fadeout').addClass('rotating');;
            }else{
                $("#control a").attr('class','button paused');
                $("#cover").addClass('fadeout').removeClass('rotating');
            }
        },
        skip:function(){
            this.model.get('playing')&&this.port.postMessage({type:'skip'})
        },
        like:function(){
            this.model.get('playing')&&this.port.postMessage({type:'toggleLike'})
            this.model.get('playing')&&$("#like").toggleClass('like').toggleClass('unlike');
        },
        deleteSong:function(){
            this.model.get('playing')&&this.port.postMessage({type:"delete"});
        },
        changeSong:function(){
            var currentSong=this.model.get('currentSong');
            var url=currentSong.picture;
            var cover=$("#cover");
            var that=this;
            cover.fadeOut('150', function() {
                var img=new Image();
                img.src=url;
                $(img).load(function(){
                    if(that.model.get('playing')) cover.removeClass('fadeout').addClass('rotating');
                    cover.css("background-image","url("+url+")");
                    cover.fadeIn('350');
                })
            });
            $("#title").html(currentSong.title).attr('title',currentSong.title);
            $("#artist").html(currentSong.artist+'--'+currentSong.albumtitle).attr('title',currentSong.artist+'--'+currentSong.albumtitle).attr('href','http://music.douban.com'+currentSong.album);
            $("#like").attr('class', currentSong.like==1?'button like':'button unlike');
        },
        playing:function(){
            var time=this.model.get('time');
            var remain=time.duration-time.currentTime;
            var m=parseInt(remain/60);
            var s=parseInt(remain%60);
            s=(s<10)?('0'+s):s;
            $('#timer').html(m+":"+s);
            $('#played').width((time.currentTime/time.duration*100)+"%");
        },
        fadeOutCD:function(){
            if($("#control a").hasClass('playing')){
                $('#cover').addClass('fadeout');
                $('#control a').show();
            }
        },
        fadeInCD:function(){
            if($("#control a").hasClass('playing')){
                $('#cover').removeClass('fadeout');
                $('#control a').hide();
            }
        },
        showShareList:function(){
            $("#shareList").show();
        },
        hideShareList:function(){
            $("#shareList").hide();
        },
        share:function(o){
            share[$(o.target).attr('id')](this.model.get('currentSong'));
        },
        loading:function(){
            var op=$("#operation li[op='"+this.model.get('loadType')+"']");
            if(this.model.get('loading')){
                op.removeClass('rotated').addClass('rotate').addClass('rotating');
                if(this.model.get('loadType')!='r'&&this.model.get('loadType')!='u') $("#cover").addClass('fadeout').removeClass('rotating');
            }else{
                $("#operation li").removeClass('rotate').removeClass('rotating');
            }
        },
        replay:function(){
            var isReplay=this.model.get('isReplay');
            this.model.set({isReplay:!isReplay});
            !isReplay?$("#replay").removeClass('hover-fadeIn'):$("#replay").addClass('hover-fadeIn')
            this.port.postMessage({type:'toggleReplay'});
        },
        volume:function(o){
            this.port.postMessage({type:'changeVolume',value:o.target.value/100})
        },
        showChannels:function(){
            var left='-180px';
            if($("#search").attr('slided')=='true'){
                $(".container").animate({left: '0px'},500,function(){
                    $("#search").attr('slided','false')
                });
            }else{
                $('#channels').show();
                $(".container").animate({left: '-180px'},500,function(){
                    $("#search").attr('slided','true')
                });
            }

        }
    });
    module.exports = PopupView;
});

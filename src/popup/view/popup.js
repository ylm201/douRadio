var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var share=require('../share');
PopupView = Backbone.View.extend({
    el:'#main',
    template:_.template($('#t_songInfo').html()),
    events: {
        'click #J-toggle-play': 'togglePlay',
        'click #J-btn-skip':'skip',
        'click #J-btn-like':'like',
        'click #J-btn-delete':'delete',
        'click #J-btn-channel':'showChannels',
        'click #J-btn-history':'showHistory',
        'click #J-notify-close':'closeNotify',
        'click #J-replay':'replay',
        'click .J-social-share':'share',
        'mouseover .play-btn-wrapper':'fadeOutCD',
        'mouseout .play-btn-wrapper':'fadeInCD',
        'input #range':'volume'
    },
    initialize:function () {
        this.render();
        this.listenTo(this.model,'change:currentSong', this.changeSong);
        this.listenTo(this.model,'change:time',this.playing);
    },
    render: function () {
        var html = this.template(this.model.attributes);
        this.$el.html(html);
        this.playing();
    },
    realModel:function(){
        return this.model.attributes;
    },
    togglePlay:function() {
        this.model.set({playing:!this.model.get('playing')});
        this.port.postMessage({type:'togglePlay'});
        $('#cover').toggleClass('fn-rotating-paused');
        if(this.realModel().playing){
            $('#J-toggle-play').addClass('playing').removeClass('paused');
            $('#cover').removeClass('fadeout');   
        }else{
            $('#J-toggle-play').removeClass('playing').addClass('paused'); 
            $('#cover').addClass('fadeout');
        }
    },
    skip:function(e){
        if($(e.target.parentNode).hasClass('fn-rotating')) return;
        this.port.postMessage({type:'skip'})
        $(e.target.parentNode).addClass('fn-rotating');
        $('#cover').addClass('fadeout').addClass('fn-rotating-paused');
    },
    like:function(){
        this.port.postMessage({type:'toggleLike'})
        $('#J-btn-like').toggleClass('like').toggleClass('unlike');
    },
    delete:function(e){
        if($(e.target.parentNode).hasClass('fn-rotating')) return
        this.port.postMessage({type:'delete'});
        $(e.target.parentNode).addClass('fn-rotating');
        $('#cover').addClass('fadeout').addClass('fn-rotating-paused');
    },
    changeSong:function(){
        this.model.set({playing:true});
        var currentSong=this.model.get('currentSong');
        var url=currentSong.picture;
        var cover=$('#cover');
        var that=this;
        cover.fadeOut('150', function() {
            var img=new Image();
            img.src=url;
            $(img).load(function(){
                cover.removeClass('fadeout').removeClass('fn-rotating-paused');
                cover.css('background-image','url('+url+')');
                cover.fadeIn('350');
            })
        });
        this.realModel().playing&&$('#J-toggle-play').addClass('playing').removeClass('paused').hide();
        $('#J-song-title').html(currentSong.title).attr('title',currentSong.title);
        $('#J-song-artist').html(currentSong.artist+'--'+currentSong.albumtitle).attr('title',currentSong.artist+'--'+currentSong.albumtitle).attr('href','http://music.douban.com'+currentSong.album);
        $('#J-btn-like').attr('class', currentSong.like==1?'button like':'button unlike');
        $('#controller li').removeClass('fn-rotating');
    },
    playing:function(){
        var time=this.model.get('time');
        var remain=time.duration-time.currentTime;
        var m=parseInt(remain/60);
        var s=parseInt(remain%60);
        s=(s<10)?('0'+s):s;
        $('#timer').html(m+':'+s);
        $('#played').width((time.currentTime/time.duration*100)+'%');
    },
    fadeOutCD:function(){
        if(this.model.get('playing')){
            $('#cover').addClass('fadeout');
            $('#J-toggle-play').show();
        }
    },
    fadeInCD:function(){
        if(this.model.get('playing')){
            $('#cover').removeClass('fadeout');
            $('#J-toggle-play').hide();
        }
    },
    share:function(e){
        share[$(e.target).attr('share_target')](this.model.get('currentSong'));
    },
    replay:function(){
        this.model.set({isReplay:!this.model.get('isReplay')});
        $('#J-replay').toggleClass('fn-hover-fadein');
        this.port.postMessage({type:'toggleReplay'});
    },
    volume:function(e){
        this.port.postMessage({type:'changeVolume',value:e.target.value/100})
    },
    showChannels:function(){
        if($('#J-btn-channel').attr('slided')=='true'){
            $('.container').animate({left: '-180px'},500,function(){
                $('#J-btn-channel').attr('slided','false')
            });
        }else{
            $('.container').animate({left: '-360px'},500,function(){
                $('#J-btn-channel').attr('slided','true')
            });
        }
    },
    showHistory:function(){
        if($('#J-btn-history').attr('slided')=='true'){
            $('.container').animate({left: '-180px'},500,function(){
                $('#J-btn-history').attr('slided','false')
            });
        }else{
            $('.container').animate({left: '0px'},500,function(){
                $('#J-btn-history').attr('slided','true')
            });
        }
    }
});
module.exports = PopupView;
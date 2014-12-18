var Backbone, $ , _,share;
Backbone = require('backbone');
$ = require('jquery');
_ = require('underscore');
var ChannelsView=Backbone.View.extend({
    el:'#channels',
    template:_.template($('#t_channels').html()),
    templateFav:_.template($('#t_favchannels').html()),
    initialize:function(){
        _.bindAll(this,'renderPublic','renderPrivate');
        var Channels=Backbone.Model.extend({url:'https://api.douban.com/v2/fm/app_channels'});
        this.channels=new Channels;
        var FavChannels=Backbone.Model.extend({url:'http://douban.fm/j/fav_channels'});
        this.favChannels=new FavChannels;
        this.favChannels.fetch({success:this.renderPrivate});
        this.channels.fetch({success:this.renderPublic});
        $('#currentChannel').html(localStorage.channelName);
        if(localStorage.channelCollected=='true'||localStorage.channelCollected=='false'){
            $.get('http://douban.fm/j/explore/is_fav_channel?cid='+localStorage.channelId,function(data){    
                $('#J-fav-channel').attr('cid',localStorage.channelId).attr('collected',data.data.res.is_fav);
                data.data.res.is_fav?$('#J-fav-channel').addClass('star').removeClass('unstar'):$('#J-fav-channel').addClass('unstar').removeClass('star')
            })
        }else{
            $('#J-fav-channel').attr('cid',localStorage.channelId).hide();  
        }
    },
    events: {
        'click .J-channel-item':'changeChannel',
        'click #J-fav-channel':'favChannel',
        'click .J-btn-unfav-channel':'unfavChannel'
    },
    renderPublic:function(){
        $('#public-channel').html(this.template(this.channels.attributes));
    },
    renderPrivate:function(){
        $('#private-channel').html(this.templateFav(this.favChannels.attributes));
    },
    changeChannel:function(e){
        var s=$(e.target);
        $('#channels li').removeClass('item-selected');
        $(e.target.parentNode).addClass('item-selected');
        $('#currentChannel').html(s.attr('title')).attr('title',s.attr('title'));
        if(s.attr('collected')=='true'){
            $('#J-fav-channel').addClass('star').removeClass('unstar').show();   
        }else if(s.attr('collected')=='false'){
            $('#J-fav-channel').addClass('unstar').removeClass('star').show();   
        }else{
            $('#J-fav-channel').hide();    
        }
        $('#J-fav-channel').attr('cid',s.attr('cid')).attr('collected',s.attr('collected'));
        $('#J-btn-channel').attr('title',s.attr('title'));
        $('#cover').addClass('fadeout').addClass('fn-rotating-paused');
        this.port.postMessage({type:'changeChannel',
            channel:{
                channelId:s.attr('cid'),
                channelName:s.attr('title'),
                channelCollected:s.attr('collected')
            }
        });
    },
    favChannel:function(){
        var url;
        var currentChannel=$('#J-fav-channel');
        if(currentChannel.attr('collected')=='true'){
            url='http://douban.fm/j/explore/unfav_channel?cid='
        }else if(currentChannel.attr('collected')=='false'){
            url='http://douban.fm/j/explore/fav_channel?cid='
        }else{
            return;
        }
        $.get(url+currentChannel.attr('cid'),function(data){
            if(data.status==true) {
                currentChannel.attr('collected')=='true'?localStorage.channelCollected='false':localStorage.channelCollected='true'; 
                localStorage.channelCollected=='true'?currentChannel.addClass('star').removeClass('unstar'):$('#J-fav-channel').addClass('unstar').removeClass('star')
                currentChannel.attr('collected',localStorage.channelCollected)
            }
        })
    },
    unfavChannel:function(e){
        var ch=$(e.target);
        $.get('http://douban.fm/j/explore/unfav_channel?cid='+ch.attr('cid'),function(data){
            if(data.status==true) {
                ch.parent().fadeOut(500);
                if($('#J-fav-channel').attr('cid')==ch.attr('cid')){
                    $('#J-fav-channel').attr('collected','false');
                    localStorage.channelCollected='false';
                    $('#J-fav-channel').addClass('unstar').removeClass('star');  
                }
            }
        })
        return false;
    }
});
module.exports=ChannelsView;
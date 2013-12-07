define(function(require, exports, module){
    var Backbone, $ , _,share;
    Backbone = require('backbone');
    $ = require('$');
    _ = require('underscore');
    var ChannelsView=Backbone.View.extend({
        el:"#channels",
        template:_.template($("#t_channels").html()),
        templateFav:_.template($("#t_favchannels").html()),
        initialize:function(){
            _.bindAll(this,'render','renderFav');
            var Channels=Backbone.Model.extend({url:"https://api.douban.com/v2/fm/app_channels"});
            this.channels=new Channels;
            var FavChannels=Backbone.Model.extend({url:"http://douban.fm/j/fav_channels"});
            this.favChannels=new FavChannels;
            this.favChannels.fetch({success:this.renderFav});
            this.channels.fetch({success:this.render});
            $('#currentChannel').html('正在收听：'+localStorage.channelName+' Hz')
            $('#op-fav-channel').attr('cid',localStorage.channelId).attr('collected',localStorage.channelCollected);
        },
        events: {
            'click .channel_item':'changeChannel',
            'click #op-fav-channel':'favChannel'
        },
        render:function(){
            console.log(this.channels);
            $('#total').html(this.template(this.channels.attributes));
        },
        renderFav:function(){
            $('#myFav').html(this.templateFav(this.favChannels.attributes));
        },
        changeChannel:function(o){
            $('.channel_item').removeClass('channel_item_selected');
            var s=$(o.target);
            s.addClass('channel_item_selected');
            $('#currentChannel').html('正在收听：'+s.html()+' Hz')
            $('#op-fav-channel').attr('cid',s.attr('cid')).attr('collected',s.attr('collected'));
            $('#search').attr('title',s.attr('title'));
            this.player.set({playing:true});
            $("#control a").attr('class','button playing').hide();;
            $("#cover").removeClass('fadeout').addClass('rotating');
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
            var currentChannel=$('#op-fav-channel');
            if(currentChannel.attr("collected")=='true'){
                url='http://douban.fm/j/explore/unfav_channel?cid='
            }else if(currentChannel.attr("collected")=='false'){
                url='http://douban.fm/j/explore/fav_channel?cid='
            }else{
                return;
            }
            $.get(url+currentChannel.attr('cid'),function(data){
                if(data.status==true) {
                    var collected=currentChannel.attr('collected')=='true'?'false':'true';
                    localStorage.channelCollected=collected;
                    $('#op-fav-channel').attr('collected',currentChannel.attr('collected')=='true'?'false':'true')
                }
            })
        }
    });
    module.exports=ChannelsView;
});
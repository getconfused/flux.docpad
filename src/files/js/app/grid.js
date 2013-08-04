define(["jquery", "underscore", "tilesjs", "jquery.magnific-popup.min", "video", "media.youtube"], function($, _) {

    var grid = {
        
        init:function() {
            this.grid = new Tiles.Grid($("#grid")[0]),
            this.grid.createTile = $.proxy(this.createTile, this);

            this.updateGrid();

            var updateLayout = _.debounce($.proxy(this.resize, this), 500);
            window.addEventListener("resize", updateLayout, false);

            $(window).on('resize', $.proxy(this.resizeLive, this));

            window.addEventListener("resize", updateLayout, false);



            this.videoMarkup = '<video id="video_1" src="" class="ctvid video-js vjs-default-skin" controls preload="auto" width="<%- width %>" height="<%- height %>"></video>';
          	
            this.resize();
            var that = this;
            
            this.setEvents();
            
            
            setTimeout(function(){
                that.resizeLive();
            }, 1500)
            
            
            
            // var sc = new AnimOnScroll( document.getElementById( 'grid' ),{
            //  minDuration : 0.4,
            //  maxDuration : 0.7,
            //  viewportFactor : 0.2
            // });
            
        },
        setEvents:function() {
            $('#grid').on('grid.menuAction', $.proxy(this.menuAction, this));
            $('#grid').on('grid.menuOpen', $.proxy(this.resize, this));
            $('#grid article').on('mouseover', $.proxy(this.onHover, this));
            $('#grid article').on('mouseout', $.proxy(this.onOut, this));
            $('#grid article').on('click', $.proxy(this.onOpen, this));
            $('.avgrund-popup a.close, .avgrund-cover').on('click', $.proxy(this.onClose, this));

            
            
            
            $(".controls .icon_next").on('click', $.proxy(this.onNext, this));
            $(".controls .icon_previous").on('click', $.proxy(this.onPrevious, this));
            $(window).on('keyup',$.proxy(this.onKeyUp, this));
            
        },
        
        onKeyUp:function(e){

            console.log(e.type + ': ' +  e.which );
            if (e.which == 27 && this._isOpen) {
                return this.onClose();
            }
            // if (e.which == 39 && this._isOpen) {
            //     return this.onNext();
            // }
            // if (e.which == 37 && this._isOpen) {
            //     return this.onPrevious();
            // }

        },
        
        
        onPrevious:function(evt) {
            $(".avgrund-popup").css({
                marginLeft:'+5000px'
            });
            var that = this;
            setTimeout(function(){
                $('.avgrund-popup').addClass('paused');
                $(".avgrund-popup").css({
                    marginLeft:'-5000px'
                });
                $('.avgrund-popup').removeClass('paused');
                that.current.prev().trigger('click');
            
            }, 300)

        },
        onNext:function(evt) {
            $(".avgrund-popup").css({
                marginLeft:'-5000px'
            });
            var that = this;
            setTimeout(function(){
                $('.avgrund-popup').addClass('paused');
                $(".avgrund-popup").css({
                    marginLeft:'+5000px'
                });
                $('.avgrund-popup').removeClass('paused');
                that.current.next().trigger('click');
            
            }, 300)

        },
        
        
        onOpen:function(evt) {
            
            if ($(evt.currentTarget).data('action') == 'no') return;
            $(evt.currentTarget).find('.content').addClass('bgGrad');


            if ($(evt.currentTarget).data('action') == 'window') return window.open($(evt.currentTarget).data('link'));

            this._isOpen = true;
            this.destroyPlayer();
            
            this.resizeLive();

            var $tile = $(evt.currentTarget);
            this.current = $tile;
            var imgSrc = $tile.find('.image').data('src');
            var title = $tile.find('.title').text();
            
            var html ='<div>'+
                        '<h2>'+title+'</h2>'+
                        '<img src="'+imgSrc+'" class="img"/>'+
                        '</div>';
                        
            $('.avgrund-popup .ct').html(html)
            $('.avgrund-popup .ct').height($('.avgrund-popup').height()-60);
            
            $('html').addClass('avgrund-active');
            $('.avgrund-popup').addClass('avgrund-popup-animate');
            
            $('.avgrund-popup .ct .img').css({
                opacity:1
            });
            
            if ($tile.data('network') == 'youtube') {
                this.setUpVideo();
            }
            
            
        },
        
        setUpVideo:function() {
            
            var url = this.current.data('link');
            var w =             $('.avgrund-popup .ct .img').width();
            var h =             $('.avgrund-popup .ct .img').height();            
            var template = _.template(this.videoMarkup);
            $('.avgrund-popup .ct .img').before(template({
                url:url,
                width:w,
                height:h
            }));


            var player = videojs("video_1", { 
                "techOrder": ["youtube"], 
                "src": url ,
                "autoplay" : true
            }, function(){
                $('.ctvid').fadeIn();
                $('.ctvid').css({
                    top:$('.avgrund-popup .ct .img').position().top+'px',
                    left:$('.avgrund-popup .ct .img').position().left+'px'
                });
            });
            player.play();
        },
        onClose:function() {
                        this._isOpen = false;
            this.destroyPlayer();
            $('html').removeClass('avgrund-active');
            $('.avgrund-popup').removeClass('avgrund-popup-animate');            
        },
        
        
        onHover:function (evt) {
            if ($(evt.currentTarget).data('action') == 'no') return;
            $(evt.currentTarget).find('.content').addClass('bgGrad');
        },
        onOut:function (evt) {
            if ($(evt.currentTarget).data('action') == 'no') return;            
            $(evt.currentTarget).find('.content').removeClass('bgGrad');
        },
        
        
        menuAction:function(evt, type) {
//            $("#grid .tile").not('.'+type).hide();          

            if (this.type!=null) {
                this.updateGrid();
                this.resize();
                this.type = null;                

                return;
            } else {
                this.type = type;                
            }
            var l = [];
            for(var i = 0; i < $("#grid article").size(); i++) {
                l.push(i);
            }            
            this.grid.updateTiles(l);

            var r = [];
            for(var i = 0; i < $("#grid article").size(); i++) {
                if (!$("#grid article:eq("+i+")").hasClass(type)) r.push(i);
            }
            this.grid.removeTiles(r);
            this.grid.redraw(false, $.proxy(this.onComplete, this));
            
//            this.resize();
        },
        setGradient:function () {

            // var g = $("img").attr('src','img/gr.png');
            // $("#grid article").each(function(){
            //     $(this).append(g);
            // })
        },
        onComplete:function () {
            $("#grid article").each(function(index) {
                setTimeout( function(index){
                    $("#grid article:eq("+index+")").css('opacity',1); 
                },50*index, index);
            });
            
            setTimeout(function(){
                var h = $("#grid article:visible:last").position().top + $("#grid article:visible:last").height();
                $("#grid").height(h);
                $('#grid').trigger('grid.resize');
            },300)

        },
        updateGrid:function() {
            var l = [];
            for(var i = 0; i <= $("#grid article").size(); i++) {
                l.push(i);
            }            
            this.grid.updateTiles(l);
        },
        resize:function () {

            this.grid.resize();
            this.grid.redraw(false, $.proxy(this.onComplete, this));
            var h = $("#grid article:last-child").position().top + $("#grid article:last-child").height();
    		$("#grid").height(h);
        },
        resizeLive:function() {
            $('.avgrund-popup').addClass('paused')            
            $('.avgrund-popup').width($(window).width()*80/100)
            $('.avgrund-popup').height($(window).height()*80/100)
    		$('.avgrund-popup').css({
    		    marginLeft:-$('.avgrund-popup').width() / 2,
    		    marginTop:-$('.avgrund-popup').height() / 2    		    
    		})
            $('.avgrund-popup').removeClass('paused')            
    		
            
        },
        createTile:function(tileId) {
            console.log('createTile ' + tileId);
            var elt = $("#grid article:eq('"+(tileId)+"')");
            var tile = new Tiles.Tile(tileId, elt);
            return tile;
        },
        
        destroyPlayer:function() {
              if ($('#video_1').size() == 0) return;
              var player = videojs("video_1");      
              player.dispose();
              $('#video_1').remove()
        }
        
        
    }
    
    return grid;


});


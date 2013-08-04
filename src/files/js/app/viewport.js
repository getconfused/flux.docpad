define(['jquery', 'snap'], function($) {
    return {
        margin:20,
        $w : $(window),
        $c : $('.container.scrollable'),
    	s:this.settings,
        init: function() {
            $(window).resize($.proxy(this.updateDimensions, this));
            this.updateDimensions();
            this.initScroll();
            this.initSnap();
            $('body').on('click', '.action', $.proxy(this.do, this));
            
            $('#grid').on('grid.resize', $.proxy(this.updateScrollDimensions, this));
        },
        do:function(e) {
            this[$(e.currentTarget).data('action')](e);
        },
        openLeft:function (evt) {
            $(".drawers").show();
            if( this.snapper.state().state=="left" ){
                this.snapper.close();
            } else {
                this.snapper.open('left');  
            }
        },
        openRight:function (evt) {
            $(".drawers").show();            
            if( this.snapper.state().state=="right" ){
                this.snapper.close();
            } else {
                this.snapper.open('right');  
            }

        },
        initSnap:function(){            
            this.snapper = new Snap({
              bouncing:false,
              element: $('#content')[0],
              maxPosition: 180,
              minPosition: -260
              
            });
            this.snapper.on('animated', $.proxy(this.onSnap, this));
        },
        onSnap:function(e) {
            var w = null;
            switch(this.snapper.state().state) {
                case 'left':
                    $("#grid").width($(window).width()-180);
                    $("#grid").css({marginLeft:'10px'});
                    $('.menu-action .icon_more').removeClass("icon_more").addClass("icon_more-close");
                    $('.menu-action .icon_menu').removeClass("icon_menu").addClass("icon_menu-close");

                break;
                
                case 'right':
                    $("#grid").width($(window).width()-220);
                    $("#grid").css({marginLeft:'210px'});
                    $('.menu-action .icon_more').removeClass("icon_more").addClass("icon_more-close");
                    $('.menu-action .icon_menu').removeClass("icon_menu").addClass("icon_menu-close");

                break;
                case 'closed':
                    $("#grid").width('auto');
                    $("#grid").css({marginLeft:0});
                    $('.menu-action .icon_more-close').removeClass("icon_more-close").addClass("icon_more");
                    $('.menu-action .icon_menu-close').removeClass("icon_menu-close").addClass("icon_menu");

                break;
            }

            $("#grid").trigger('grid.menuOpen')            
        },
        initScroll:function() {
            this.scroller = new FTScroller($('.scrollable')[0], {
                bouncing:false,
             scrollingX: false,
             alwaysScroll:true,
             maxFlingDuration:100,
             updateOnWindowResize:true
            });                
        },
        updateDimensions:function(){
            this.$c.height(this.$w.height() - this.margin*2);
        },
        updateScrollDimensions:function(){
            this.scroller.updateDimensions(this.$w.width(), $("#grid").height())    		
        },
        menuAction:function(evt) {
            var type = $(evt.currentTarget).data('type');
            $('#grid').trigger('grid.menuAction', type);
        },
        showFacebook:function(elt) {
        },
        showYoutube:function(elt) {
        },
        showInstagram:function(elt) {
        },
        showSoundcloud:function(elt) {
        },
        showTumblr:function(elt) {
        }
                
    }
});

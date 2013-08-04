define(["jquery", "app/loader", "app/viewport", "app/grid", "ftscroller", 'imgLiquid-min', 'lazyload.min'], function($, Loader, Viewport, Grid) {
    var app = {
        settings:{
            clickEvent          : 'click',
            transitionEndOptions : {
                'WebkitTransition'  : 'webkitTransitionEnd',
                'MozTransition'     : 'transitionend',
                'OTransition'       : 'oTransitionEnd',
                'transition'        : 'transitionEnd'
            },
            transitionEnd       : '',
            transition          : Modernizr.prefixed('transition'),
            transform           : Modernizr.prefixed('transform'),
            hasTransitions       : Modernizr.csstransitions,
            isIpad              : (navigator.userAgent.match(/iPad/i) != null) ? true : false
        },
        init:function () {

            var s = this.settings;

            // Initialise core settings.
            s.clickEvent            = (Modernizr.touch) ? 'touchstart' : 'click';
            s.transitionEnd         = s.transitionEndOptions[s.transition];

            $(".imgLiquidFill").imgLiquid();
    
            var myLzld = lazyload({
              container: $('.container')[0],
              offset: 200,
              src: 'data-src' // or function(elt) { return customSrc }
            });

            // Initialize loader.
            Loader.init({isIpad : s.isIpad});
            Viewport.init();
            Grid.init();
            // iPad orientation.
            $(window).bind('orientationchange', function() {
                Viewport.updateDimensions();
            });

            
        }
    
    }
    app.init();
});

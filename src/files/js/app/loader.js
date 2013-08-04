define(["jquery"], function($) {
    
    console.log($);
	var loader =  {
    	    settings:{
    		isIpad				: false,
    		isLoading			: false,
    		queueOptions		: false,
    		isChrome			: false,
    		isIE9               : false,
    		allLoaded 			: [],
    		loading   			: [],
    		toLoad    			: 0,
    		loaded    			: 0,
            // $loading         : $.noop,
            // loadProgress         : {},
            // onComplete       : $.noop,
            // progressCallback     : $.noop
	    }, 
	    init:function(options) {

		    $.extend(this.settings, options);

    		// Yep, it's 2011 and we're browser sniffing. Why? Because Chrome
    		// doesn't support the media element's progress event properly.
    		if (navigator.userAgent.match(/Chrome/i) !== null) {
    			this.settings.isChrome = true;
    		}

    		if ($('html.ie9').length) {
    		    this.settings.isIE9 = true;
    		}
        }
	}
    
    return loader;

    
});

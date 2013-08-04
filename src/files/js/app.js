requirejs.config({
    "baseUrl": "js/vendor",
    "paths": {
        "app": "../app",
        underscore: 'underscore-min',
    },
    shim: {
        'imgLiquid-min': {
            deps: ['jquery']
        },
        'FTScroller': {
            deps: ['jquery']
        },
        'lazyload-min': {
            deps: ['jquery']
        },
        'tilesjs': {
            deps: ['jquery']
        },
        'media.youtube': {
            deps: ['video']
        },
        underscore: {
          exports: '_'
        }

    }
});

// Load the main app module to start the app
requirejs(["app/main"]);

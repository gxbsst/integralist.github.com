(function (window, document) {

    'use strict';

    var $, Imager;

    window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };


    $ = (function (dollar) {
        if (dollar) {
            return dollar;
        }

        return function (selector) {
            return Array.prototype.slice.call(document.querySelectorAll(selector));
        };
    }(window.$));


    /*
        Construct a new Imager instance, passing an optional configuration object.

        Example usage:

            {
                // Available widths for your images
                availableWidths: [Number]

                // Selector to be used to locate your div placeholders
                selector: '',

                // Class name to give your resizable images.
                className: '',

                // Regular expression to match against your image endpoint's naming conventions
                // e.g. http://yourserver.com/image/horse/400
                regex: RegExp

                // Toggle the lazy load functionality on or off
                lazyload: Boolean

                // Used alongside the lazyload feature (helps performance by setting a higher delay)
                scrollDelay: Number
            }

        @param {object} configuration settings
        @return {object} instance of Imager
     */
    window.Imager = Imager = function (opts) {
        var opts = opts || {};

        this.imagesOffScreen           = [];
        this.viewportHeight            = document.documentElement.clientHeight;
        this.availableWidths           = opts.availableWidths || [96, 130, 165, 200, 235, 270, 304, 340, 375, 410, 445, 485, 520, 555, 590, 625, 660, 695, 736];
        this.selector                  = opts.selector || '.delayed-image-load';
        this.className                 = '.' + (opts.className || 'image-replace').replace(/^\.+/, '.');
        this.regex                     = opts.regex || /^(.+\/)\d+$/i;
        this.gif                       = document.createElement('img');
        this.gif.src                   = 'data:image/gif;base64,R0lGODlhEAAJAIAAAP///wAAACH5BAEAAAAALAAAAAAQAAkAAAIKhI+py+0Po5yUFQA7';
        this.gif.className             = this.className.replace(/^[#.]/, '');
        this.divs                      = $(this.selector);
        this.cache                     = {};
        this.scrollDelay               = opts.scrollDelay || 250;
        this.lazyload                  = opts.lazyload || false;
        this.loadedImageCount          = 0;
        this.flowSolutionNotInProgress = true;

        this.changeDivsToEmptyImages();
        this.bindEvents();
    };

    Imager.prototype.bindEvents = function(){
        window.requestAnimationFrame(this.init.bind(this));
        window.addEventListener('resize', this.checkImagesNeedReplacing.bind(this), false);
    };

    Imager.prototype.setHashEvent = function(){
        window.addEventListener('hashchange', this.workAroundAnchorFlowIssue.bind(this), false);
    };

    Imager.prototype.setInterval = function(){
        this.interval = window.setInterval(this.scrollCheck.bind(this), this.scrollDelay);
    };

    Imager.prototype.workAroundAnchorFlowIssue = function(){
        this.flowSolutionNotInProgress = false;

        // When a page links to an anchor somewhere in the page
        // the browser scrolls down to the anchor, but this
        // causes all placeholders to trigger their lazy load
        // and ultimately changes the scroll position of the page
        // for us to work around this issue we'll need to reset
        // the hash in the location bar when the lazy loaded
        // images have finished loading

        if (this.isHashSet() && this.elementExistsForHash()) {
            window.clearInterval(this.interval);

            this.checkImagesLoaded();
        }

        this.flowSolutionNotInProgress = true;
    };

    Imager.prototype.reapplyHash = function(){
        var storedHash = window.location.hash.substring(1); // remove the # prefix

        window.removeEventListener('hashchange', this.workAroundAnchorFlowIssue.bind(this), false); // stops infinite loop
        window.location.hash = '';
        window.location.hash = storedHash;

        this.setHashEvent();

        this.setInterval(); // we start the scroll listener again (as the user might not be at the end of the page and have more placeholders still to encounter)
    };

    // We reuse our existing function for converting
    // the placeholders to images as it sets an
    // event listener for each image's load event
    // every time the image loads we incremement a
    // property count and then use that as a reference
    // to know when all images have been loaded.
    // We can then re-apply the hash which will place
    // the user at the correct anchor location
    Imager.prototype.checkImagesLoaded = function(){
        var placeholders = $(this.selector);

        this.changeDivsToEmptyImages(placeholders);

        window.setTimeout(function recursiveCheckForLoadedImages(){
            if (this.loadedImageCount < placeholders.length) {
                recursiveCheckForLoadedImages.bind(this)();
            } else {
                this.reapplyHash();
            }
        }.bind(this), 50);
    };

    Imager.prototype.isHashSet = function(){
        return (window.location.hash) ? true : false;
    };

    Imager.prototype.elementExistsForHash = function(){
        if (this.anchorElement) {
            return true;
        }

        var id = document.getElementById(window.location.hash.substring(1)), // remove the # prefix
            name = $('[name="' + window.location.hash + '"]');

        if (id || name) {
            this.anchorElement = (id) ? id : name;
            return true;
        }
    };

    Imager.prototype.scrollCheck = function(){
        if (this.scrolled) {
            if (!this.imagesOffScreen.length) {
                window.clearInterval(this.interval);
            }

            this.divs = this.imagesOffScreen.slice(0); // copy by value, don't copy by reference
            this.imagesOffScreen.length = 0;
            this.changeDivsToEmptyImages();

            if (this.flowSolutionNotInProgress) {
                this.workAroundAnchorFlowIssue();
            }

            this.scrolled = false;
        }
    };

    Imager.prototype.init = function(){
        this.initialized = true;
        this.scrolled = false;
        this.checkImagesNeedReplacing();

        if (this.lazyload) {
            this.setHashEvent();
            this.setInterval();

            window.addEventListener('scroll', function(){
                this.scrolled = true;
            }.bind(this), false);
        }
    };

    Imager.prototype.createGif = function (element) {
        var gif = this.gif.cloneNode(false);
            gif.width = element.getAttribute('data-width');
            gif.setAttribute('data-src', element.getAttribute('data-src'));

        element.parentNode.replaceChild(gif, element);
    }

    Imager.prototype.changeDivsToEmptyImages = function (elementsToCheck) {
        var divs = elementsToCheck || this.divs,
            i = divs.length,
            element;

        while (i--) {
            element = divs[i];

            if (this.lazyload) {
                if (this.isThisElementOnScreen(element)) {
                    this.createGif(element);
                } else {
                    this.imagesOffScreen.push(element);
                }
            } else {
                this.createGif(element);
            }
        }

        if (this.initialized) {
            this.checkImagesNeedReplacing();
        }
    };

    Imager.prototype.isThisElementOnScreen = function (element) {
        return (element.offsetTop < (this.viewportHeight + document.body.scrollTop)) ? true : false;
    };

    Imager.prototype.checkImagesNeedReplacing = function(){
        var self = this,
            images = $(this.className),
            i = images.length,
            currentImage;

        if (!this.isResizing) {
            this.isResizing = true;

            while (i--) {
                currentImage = images[i];
                this.replaceImagesBasedOnScreenDimensions(currentImage);
            }

            this.isResizing = false;
        }
    };

    Imager.prototype.replaceImagesBasedOnScreenDimensions = function (image) {
        var src = this.determineAppropriateResolution(image),
            parent = image.parentNode,
            replacedImage;

        if (this.cache[src]) {
            replacedImage = this.cache[src].cloneNode(false);
            replacedImage.width = image.getAttribute('width');
        } else {
            replacedImage = image.cloneNode(false);

            replacedImage.onload = function(){
                this.loadedImageCount++;
            }.bind(this);

            replacedImage.src = src;

            this.cache[src] = replacedImage;
        }

        parent.replaceChild(replacedImage, image);
    };

    Imager.prototype.determineAppropriateResolution = function (image) {
        var src           = image.getAttribute('data-src'),
            imagewidth    = image.clientWidth,
            selectedWidth = this.availableWidths[0],
            i             = this.availableWidths.length;

        while (i--) {
            if (imagewidth <= this.availableWidths[i]) {
                selectedWidth = this.availableWidths[i];
            }
        }

        return this.changeImageSrcToUseNewImageDimensions(src, selectedWidth);
    };

    Imager.prototype.changeImageSrcToUseNewImageDimensions = function (src, selectedWidth) {
        return src.replace(this.regex, function (match, path, file, extension) {
            file = file || '';
            extension = extension !== match ? extension : '';
            return path + file + selectedWidth + extension;
        });
    };

}(window, document));

var imager = new Imager({
    lazyload: true,
    scrollDelay: 100,
    availableWidths: [320, 480, 640, 760, 920, 1024],
    regex: /^(Assets\/Images\/src\/generated\/)(.+?)\d+(\.(?:jpg|png|gif))$/i
});

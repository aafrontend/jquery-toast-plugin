/*!
jQuery toast plugin v.1.4.0
Copyright (C) 2015-2017 Kamran Ahmed <http://kamranahmed.info>
License MIT
*/
/*
options and their default values:
 text: '', one, or array of, string(s), text or markup
 heading: '', string or html
 showHideTransition: 'fade', type of transition: 'fade', 'slide' or anything else
 allowToastClose: true, whether to support click-to-close
 hideAfter: 5000,  dialog lifetime (mS) or false for sticky
 loader: true, whether to display lifetime progress bar
 loaderBg: '#9EC600', color of lifetime bar
 stack: 5, maximum no. of contemporary dialogs
 position: 'bottom-left', dialog position relative to the refer
 bgColor: false, CSS property, or false
 textColor: false, CSS property, or false
 textAlign: 'left', CSS property, or false
 icon: false, status-indicator, one of 'success', 'error', 'info', 'warning' (used to suffix applied class "toast-icon-")
         or else any markup which represents an icon e.g. <img attrs ... />,
         may be nested e.g. inside <span attrs ...><img attrs ...  /></span> 
 closeicon: '&times;', string or markup which displays something clickable
         e.g. '&times;', 'CLOSE', <span attrs ...><img attrs ...  /></span>
 xclass: false, user-specified class to be applied to the div containing displayed elements
 drag: false, if sticky (i.e. hideAfter not applied), whether to create a draggable dialog
 refer: null, reference-element for the dialog, defaults to window
 beforeShow: null, optional callable, called before dialog is shown, argument is the dialog div object
 afterShown: null, optional callable, called after dialog is shown, argument is the dialog div object
 beforeHide: null, optional callable, called before dialog is hidden, argument is the dialog div object
 afterHidden: null, optional callable, called after dialog is hidden, argument is the dialog div object
 onClick: null optional callable to process any click anywhere in the dialog (i.e. not just close)

classes:
'toast-wrap' applied to div containing all created toasts
'toast-single' applied to each div containing a toast
settings.position, in 'bottom-left', 'bottom-right', 'top-right', 'top-left', 'bottom-center', 'top-center', 'mid-center'
settings.xclass applied to the div containing the toast to which this setting applies
'toast-has-icon' applied to each div containing a toast and which has a type-indicator icon
'toast-icon-' + 'success', 'error', 'info', 'warning' applied to the type-indicator icon
'toast-loader' loader-container span identifier
'toast-loaded' applied to loader-container if loader is true
'toast-heading' applied to div containing markup and closer (if any)
'toast-close' applied to settings.closeicon (whatever that is)
'toast-ul' applied to ul for multi-row message
'toast-li' applied to each li in multi-row message

ids:
'toast-item-' + i the li's
*/
if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function( $, window, document ) {
    "$:nomunge";
    "use strict";

    var Toast = {

        _positionClasses : ['bottom-left', 'bottom-right', 'top-right', 'top-left', 'bottom-center', 'top-center', 'mid-center'],
        _defaultIcons : ['success', 'error', 'info', 'warning'],

        init: function (options, elem) {
            this.prepareOptions(options, $.toast.options);
            this.process();
        },

        prepareOptions: function(options, options_to_extend) {
            var _options = {};
            if ( ( typeof options === 'string' ) || ( options instanceof Array ) ) {
                _options.text = options;
            } else {
                _options = options;
            }
            this.options = $.extend( {}, options_to_extend, _options );
        },

        process: function () {
            this.setup();
            this.addToDom();
            this.position();
            this.bindToast();
            this.animate();
        },

        setup: function () {

            this._toastEl = this._toastEl || $('<div/>', {
                "class" : "toast-single"
            });
            this._toastEl.data('Toastob', this);

            var _toastContent = '';

            if ( this.options.loader ) {
                _toastContent += '<span class="toast-loader"></span>';
            }

            if ( this.options.heading ) {
                _toastContent +='<div class="toast-heading">' + this.options.heading;
            }

            if ( this.options.allowToastClose ) {
                var icon;
                if ( this.options.closeicon ) {
                    icon = this.options.closeicon;
                } else {
                    icon = '&times;';
                }
                _toastContent += '<span class="toast-close">' + icon + '</span>';
            }

            if ( this.options.heading ) {
                _toastContent += '</div>';
            }

            if ( this.options.text instanceof Array ) {
                _toastContent += '<ul class="toast-ul">';
                for (var i = 0; i < this.options.text.length; i++) {
                    _toastContent += '<li class="toast-li" id="toast-item-' + i + '">' + this.options.text[i] + '</li>';
                }
                _toastContent += '</ul>';

            } else {
                _toastContent += this.options.text;
            }

            this._toastEl.html( _toastContent );

            if ( this.options.bgColor ) {
                this._toastEl.css('background-color', this.options.bgColor);
            }

            if ( this.options.textColor ) {
                this._toastEl.css('color', this.options.textColor);
            }

            if ( this.options.textAlign ) {
                this._toastEl.css('text-align', this.options.textAlign);
            }

            if ( this.options.icon ) {
                this._toastEl.addClass('toast-has-icon');

                if ( this._defaultIcons.indexOf(this.options.icon) !== -1 ) {
                    this._toastEl.addClass('toast-icon-' + this.options.icon);
                }
            }

            if ( this.options.xclass ) {
                this._toastEl.addClass(this.options.xclass);
            }
        },

        position: function () {

            var refer, left, top, bottom;

            if ( this.options.refer && this.options.refer instanceof Element ) {
                refer = this.options.refer;
            } else {
                refer = window;
            } 
            if ( ( typeof this.options.position === 'string' ) && ( this._positionClasses.indexOf(this.options.position) !== -1 ) ) {

                if ( this.options.position === 'bottom-center' ) {
                    left = Math.max (20, ($(refer).outerWidth() - this._container.outerWidth()) / 2);
                    top = Math.min (window.outerHeight() - 20, $(refer).bottom() + this._container.outerHeight());
                    this._container.css({
                        left: left,
                        top: top
                    });
                } else if ( this.options.position === 'top-center' ) {
                    left = Math.max (20, ($(refer).outerWidth() - this._container.outerWidth()) / 2);
                    top = Math.max (20, ($(refer).top() - this._container.outerHeight()));
                    this._container.css({
                        left: left,
                        top: top
                    });
                } else if ( this.options.position === 'mid-center' ) {
                    left = Math.max (20, ($(refer).outerWidth() - this._container.outerWidth()) / 2);
                    top = Math.max (20, ($(refer).outerHeight() - this._container.outerHeight()) / 2);
                    this._container.css({
                        left: left,
                        top: top
                    });
                } else {
                    this._container.addClass( this.options.position );
                }
            } else if ( typeof this.options.position === 'object' ) {
                this._container.css({
                    top : this.options.position.top ? this.options.position.top : 'auto',
                    bottom : this.options.position.bottom ? this.options.position.bottom : 'auto',
                    left : this.options.position.left ? this.options.position.left : 'auto',
                    right : this.options.position.right ? this.options.position.right : 'auto'
                });
            } else {
//                this._container.addClass( 'bottom-left' );
                this._container.css({
                   //bottom-left
                   left: 20,
                   bottom: 20
                });
            }
        },

        postHide: function () {

            var that = $(this).data('Toastob');
            
            if (typeof that.options.afterHidden === 'function') {
                that.options.afterHidden(this);
            }
        },

        bindToast: function () {

            var that = this;

            this._toastEl.find('.toast-close').on('click', function ( e ) {

                e.preventDefault();

                if ( typeof that.options.beforeHide === 'function' ) {
                    that.options.beforeHide(that._toastEl);
                }

                if( that.options.showHideTransition === 'fade') {
                    that._toastEl.fadeOut(that.postHide);
                } else if ( that.options.showHideTransition === 'slide' ) {
                    that._toastEl.slideUp(that.postHide);
                } else {
                    that._toastEl.hide(that.postHide);
                }
            });

            if ( typeof this.options.onClick === 'function' ) {
                this._toastEl.on('click', function () {
                    that.options.onClick(that._toastEl);
                });
            }
        },

        addToDom: function () {

             var _container = $('.toast-wrap');

             if ( _container.length === 0 ) {

                _container = $('<div/>', {
                    "class" : "toast-wrap",
                    role : "alert",
                    "aria-live" : "polite"
                });

                $('body').append( _container );

             } else if ( !this.options.stack || isNaN( parseInt(this.options.stack, 10) ) ) {
                _container.empty();
             }

             _container.find('.toast-single:hidden').remove();

             _container.append( this._toastEl );

            this._toastEl.hide();

            if ( this.options.stack && !isNaN( parseInt( this.options.stack ), 10 ) ) {

                var _prevToastCount = _container.find('.toast-single').length,
                    _extToastCount = _prevToastCount - this.options.stack;

                if ( _extToastCount > 0 ) {
                    $('.toast-wrap').find('.toast-single').slice(0, _extToastCount).remove();
                }

            }

            this._container = _container;
        },

        canAutoHide: function () {
            return ( this.options.hideAfter !== false ) && !isNaN( parseInt( this.options.hideAfter, 10 ) );
        },

        processLoader: function () {
            // Show the loader only, if auto-hide is on and loader is demanded
            if (!this.canAutoHide() || this.options.loader === false) {
                return false;
            }

            var loader = this._toastEl.find('.toast-loader'),
            // 400 mS is jquery's default duration for fade/slide
            // Divide by 1000 for mS to S conversion
                transitionTime = (this.options.hideAfter - 400) / 1000 + 's',
                loaderBg = this.options.loaderBg,
                style = loader.attr('style') || '';

            style = style.substring(0, style.indexOf('-webkit-transition')); // Remove the last transition definition

            style += '-webkit-transition:width ' + transitionTime + ' ease-in;' +
                     '-o-transition:width ' + transitionTime + ' ease-in;' +
                     'transition:width ' + transitionTime + ' ease-in;' +
                     'background-color:' + loaderBg + ';';

            loader.attr('style', style).addClass('toast-loaded');
        },

        postShow: function () {

            var that = $(this).data('Toastob');

            if (that.options.loader !== false) {
                that.processLoader();
            }
            if (typeof that.options.afterShown === 'function') {
               that.options.afterShown(this);
            }
        },

        animate: function () {

            if ( typeof this.options.beforeShow === 'function' ) {
               this.options.beforeShow(this._toastEl);
            }

            if ( this.options.showHideTransition.toLowerCase() === 'fade' ) {
                this._toastEl.fadeIn(this.postShow);
            } else if ( this.options.showHideTransition.toLowerCase() === 'slide' ) {
                this._toastEl.slideDown(this.postShow);
            } else {
                this._toastEl.show(this.postShow);
            }

            if (this.canAutoHide()) {

               var that = this;

                window.setTimeout(function(){

                    if ( typeof that.options.beforeHide === 'function' ) {
                       that.options.beforeHide(that._toastEl);
                    }

                    if ( that.options.showHideTransition.toLowerCase() === 'fade' ) {
                        that._toastEl.fadeOut(that.postHide);
                    } else if ( that.options.showHideTransition.toLowerCase() === 'slide' ) {
                        that._toastEl.slideUp(that.postHide);
                    } else {
                        that._toastEl.hide(that.postHide);
                    }

                }, this.options.hideAfter);
            }
        },

        reset: function ( resetWhat ) {

            if ( resetWhat === 'all' ) {
                $('.toast-wrap').remove();
            } else {
                this._toastEl.remove();
            }

        },

        update: function(options) {
            this.prepareOptions(options, this.options);
            this.setup();
            this.bindToast();
        },

        close: function() {
            this._toastEl.find('.toast-close').click();
        }
    };

    $.toast = function(options) {
        var toast = Object.create(Toast);
        toast.init(options, this);

        return {

            reset: function ( what ) {
                toast.reset( what );
            },

            update: function( options ) {
                toast.update( options );
            },

            close: function( ) {
                toast.close( );
            }
        };
    };

    $.toast.options = {
        text: '',
        heading: '',
        showHideTransition: 'fade',
        allowToastClose: true,
        hideAfter: 5000,
        loader: true,
        loaderBg: '#9EC600',
        stack: 5,
        position: 'bottom-left',
        bgColor: false,
        textColor: false,
        textAlign: 'left',
        icon: false,
        closeicon: '&times;',
        xclass: false,
        drag: false,
        refer: null,
        beforeShow: null,
        afterShown: null,
        beforeHide: null,
        afterHidden: null,
        onClick: null
    };

})( jQuery, window, document );

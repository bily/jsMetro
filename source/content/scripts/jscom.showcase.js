(function($){
    $(document).ready(function (event) {
        showcase_init();
        showcase_init_forms();
        showcase_init_popNotify();
        showcase_init_notify();
        showcase_init_dialog();
    });
    
    function showcase_init(){
        $.js.notify();
        $.js.dialog();
        
        // Show the version
        $('#MetroVersion').html($.js.version);
        
        // Hook the header links up
        $('#Page>header ul a').click(function (event) {
            var that = $(this);

            /* Linking to another page, or a hashtag? */
            if (that.attr('href')[0] != '#') {
                return;
            }

            // Stop the default!!
            event.preventDefault();

            // Get the scroll destination to scroll to
            var scrollDestination = $('a[name="' + that.attr('href').substr(1) + '"]');

            if (window.history && window.history.pushState) {
                window.history.pushState('', scrollDestination.html() + ' - jsMetro Demos', that.attr('href'))
            }

            scrollDestination.scrollTo();
        });

        // Collapse all the elements we can...
        $('.collapsible-wrapper').collapsible({
            toggleSelector: 'a.toggle',
            hidden: function (parent, toggle) {
                if (toggle.data('hidden-text')) {
                    toggle.html(toggle.data('hidden-text'));
                } else {
                    toggle.html('[+] View Demo');
                }
            },
            visible: function (parent, toggle) {
                if (toggle.data('visible-text')) {
                    toggle.html(toggle.data('visible-text'));
                } else {
                    toggle.html('[-] Hide Demo');
                }
            }
        });
        
        // Enable theme switching
        $('#ThemeButtons>a').click(function (event) {
            event.preventDefault();

            $.js.theme($(this).data('theme'));
        });
    }
    
    /* Initializes the popNotify sample */
    function showcase_init_popNotify(){
        $('#PopNotifySample').click(function (event) {
            event.preventDefault();

            $.js.popNotify('Ut leo velit, vestibulum et bibendum non, interdum hendrerit diam. Nam blandit interdum nulla vitae eleifend. Proin et justo vitae orci posuere malesuada non a sapien.');
        });
    }
    
    function showcase_init_forms(){
        // Enable CSS-columns replacement
        $('.columns').columnize({ gap: 20 });
    }
    
    function showcase_init_notify(){
        $('#TestNotify').click(function (event) {
            event.preventDefault();

            $.js.notify('hello, world!');
        });

        $('#TestNotifyTimeout').click(function (event) {
            event.preventDefault();

            $.js.notify(
                'hello, world!',
                { timeout: 1000 }
            );
        });

        $('#TestNotifyTimeoutColor').click(function (event) {
            event.preventDefault();

            $.js.notify(
                'hello, world!',
                { timeout: 1000, cssClass: 'red' }
            );
        });
    }
    
    function showcase_init_dialog(){
        $('#HelloWorldDialog').click(function (event) {
            event.preventDefault();

            $.js.dialog('<h3>The Dialog Title</h3><p>Hello, world!</p>');
        });

        $('#QueueDialog').click(function (event) {
            event.preventDefault();

            $.js.dialog('<h3>The Dialog Title</h3><p>Hello, world!</p>');
            $.js.dialog('<h3>The Dialog Title</h3><p>Hello, world! The sequel!</p>');
        });

        var cancelCallback = function (controller, button, event) {
            $.js.dialog('Cancel was clicked!');
        };

        var continueCallback = function (c, b, e) {
            $.js.dialog('Continue was clicked!');
        };

        $('#BasicDialog').click(function (event) {
            event.preventDefault();

            $.js.dialog(
				'<h3>Callbacks Sample</h3><p>Would you like to continue?</p>',
				{
				    buttons: ['Cancel', 'Continue'],
				    buttonClasses: ['previous icon button', 'next icon button'],
				    callbacks: [cancelCallback, continueCallback]
				}
			);
        });
    }
})(jQuery);
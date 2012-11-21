// @note: I'm going to have to come through here and sanitize the markup later on


var shell = {

    // specify the window padding
    padding: 10,

    // map elements to their jQuery selectors to facilitate loose-coupling
    // between the logic and layout
    elements: {
        inner_shell    : ('#inner_shell'),
        output         : ('#output'),
        password       : ('#password'),
        port           : ('#port'),
        prompt         : ('#prompt'),
        prompt_context : ('#prompt_context'),
        protocol       : ('#protocol'),
        shell          : ('#shell'),
        ssl            : ('#ssl'),
        status         : ('#status'),
        target         : ('#target'),
        terminal       : ('#terminal'),
        url            : ('#url'),
    },

    // draw the shell
    draw: function(){
        shell.debug.log('shell.draw');

        // calculate the appropriate terminal height
        var window_height = $(window).innerHeight();
        var target_height = ($(this.elements.target).is(':visible')) ? $(this.elements.target).height() + (this.padding / 2) : 0 ;
        var status_height = $(this.elements.status).height();
        var terminal_height = window_height - target_height - status_height - (this.padding * 6);

        $(this.elements.terminal)
            .css('height', terminal_height)
            .css('max-height', terminal_height);

        // draw (size) the command prompt
        this.command.prompt.draw();
    },

    // encapsulates command processing
    command: {

        // encapsulates the command prompt
        prompt: {

            // encapsulates the context before the prompt input
            context: {

                // clears the prompt context
                clear: function(){
                    shell.debug.log('shell.command.prompt.context.clear');
                    $(shell.elements.prompt_context).text('');
                },

                // gets the prompt context
                get: function(){
                    shell.debug.log('shell.command.prompt.context.get');
                    return $(shell.elements.prompt_context).text();
                },
                
                // sets the prompt context
                set: function(data){
                    shell.debug.log('shell.command.prompt.context.set');
                    $(shell.elements.prompt_context).text(data).text();
                },

            },

            // clears the command prompt
            clear: function(){
                shell.debug.log('shell.command.prompt.clear');
                $(shell.elements.prompt).val('');
                // @note @kludge: is this elegant?
                shell.command.prompt.draw();
            },

            // draws (mostly sizes) the command prompt
            draw: function(){
                shell.debug.log('shell.command.prompt.draw');
                var terminal_width       = $(shell.elements.terminal).width() - shell.padding;
                var prompt_context_width = $(shell.elements.prompt_context).width();
                var prompt_width         = terminal_width - prompt_context_width;
                $(shell.elements.prompt).css('width', prompt_width);
            },

            // enters a command
            enter: function(){
                // @todo: do some kind of "inspect" method here to scan for macros
                shell.debug.log('shell.command.prompt.enter');
                var command = shell.command.prompt.get();
                var context = shell.command.prompt.context.get();
                var out     = jQuery('<div/>').text(context + ' ' + command).html();
                shell.output.write(out);
                shell.command.history.add(command);
                shell.command.prompt.clear();
            },

            // puts focus on the prompt box
            focus: function(){
                $(shell.elements.prompt).focus();
            },

            // gets the command prompt value
            get: function(){
                shell.debug.log('shell.command.prompt.get');
                return $(shell.elements.prompt).val().trim();
            },

            // sets the command prompt value
            set: function(data){
                shell.debug.log('shell.command.prompt.set');
                $(shell.elements.prompt).val(data);
            },

        },

        // tracks command history
        history: {
            
            // an array of historic commands
            commands: [],

            // a buffer for a command in-progress
            current: '', 

            // current position in commands
            position: 0,

            // number of commands to track
            size: 1000,

            // adds a command to the history
            add: function(command){
                shell.debug.log('shell.command.history.add');
                shell.command.history.commands.push(command); 
                shell.command.history.position++;
            }, 

            // moves backward (older) in history
            backward: function(){
                shell.debug.log('shell.command.history.backward');
                if(shell.command.history.position >= 1){
                    // decrement the command history pointer
                    shell.command.history.position--;
                    shell.command.prompt.set(shell.command.history.commands[shell.command.history.position]);
                }
            },
            
            // moves forward (more recent) in history
            forward: function(){
                shell.debug.log('shell.command.history.forward');
                if(shell.command.history.position <= (shell.command.history.commands.length - 1)){
                    shell.command.history.position++;
                    shell.command.prompt.set(shell.command.history.commands[shell.command.history.position]);
                }
            },

        },

    },

    // encapsulates output processing
    output: {

        // clears the shell output
        clear: function(){
            shell.debug.log('shell.output.clear');
            // @todo: don't actually clear: just scroll
            $(shell.elements.output).text('');
        },

        // writes to the shell output
        write: function(data){
            shell.debug.log('shell.output.write');
            $(shell.elements.output).append('<div class="command">' + data + '</div>');
        },

    },

    // encapsulates the status bar
    status: {

        // appends to the status bar
        append: function(data){
            shell.debug.log('shell.status.append');
            $(shell.elements.status).append(data);
        },

        // clears the status bar
        clear: function(){
            shell.debug.log('shell.status.clear');
            $(shell.elements.status).text('');
        },

        // sets the status bar message
        set: function(data){
            shell.debug.log('shell.status.set');
            $(shell.elements.status).text(data).text();
        },

    },

    // encapsulates targeting functionality
    target: {

        // clears the target
        clear: function(){
            shell.debug.log('shell.target.clear');
            shell.target.url      = '',
            shell.target.password = '',
            $(shell.elements.url).val('');
            $(shell.elements.password).val('');
        },

        // hides the target bar
        hide: function(){
            shell.debug.log('shell.target.hide');
            $(shell.elements.target).fadeOut(function(){
                shell.status.set('Target bar hidden. Press Ctrl+h to unhide.');
                shell.draw();
            });
        },

        // clears the target
        set: function(){
            shell.debug.log('shell.target.set');
            shell.target.protocol = $(shell.elements.protocol).val();
            shell.target.url      = $(shell.elements.url).val();
            shell.target.port     = $(shell.elements.port).val();
            shell.target.password = $(shell.elements.password).val();
        },

        // un-hides the target bar
        show: function(){
            shell.debug.log('shell.target.show');
            $(shell.elements.target).fadeIn(function(){
                shell.status.set('Target bar revealed. Press Ctrl+h to hide.');
            });
        },

        // tests the connection to the target
        test: function(){
            shell.debug.log('shell.target.test');
            //@TODO: implement this
        },

        // toggles target bar visibility
        toggle: function(){
            shell.debug.log('shell.target.toggle');
            if($(shell.elements.target).is(':visible')){
                shell.target.hide();
                shell.draw();
            } else {
                shell.target.show();
                shell.draw();
            }
        }
    },

    // encapsulates some simple debugging functionality
    debug: {

        // switch debugging on or off
        enabled: true,

        // logs output if debugging is enabled
        log: function(data){
            if(shell.debug.enabled){ console.log(data); }
        }

    },
}

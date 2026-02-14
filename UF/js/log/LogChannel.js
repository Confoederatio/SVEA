//Initialise functions
{
	if (!global.log)
		/**
		 * The namespace for all UF/Log utility functions, typically for designating log channels.
		 * 
		 * @namespace log
		 */
		global.log = {};
		
	log.Channel = class {
		static instances = [];
		
		constructor (arg0_key, arg1_options) {
			//Convert from parameters
			let key = arg0_key;
			let options = (arg1_options) ? arg1_options : {};
			
			//Initialise options
			let bg_colour = (options.colour) ? 
				options.colour : ve.registry.settings.Channel.default_bg_colour;
			let text_colour = (options.text_colour) ? 
				options.text_colour : ve.registry.settings.Channel.default_text_colour
			
			let default_post_css = `background: transparent; color: inherit;`;
			let default_pre_css = `background: ${bg_colour}; color: ${text_colour}; padding: 2px 5px; border-radius: 3px; font-weight: bold;`;
			
			options.post_css = (options.post_css) ? `${default_post_css} ${options.post_css}` : default_post_css;
			options.pre_css = (options.pre_css) ? `${default_pre_css} ${options.pre_css}` : default_pre_css;
			
			//Declare local instance variables
			this.key = key;
			this.options = options;
			
			//Internal guard clause if duplicate
			if (!log[key]) {
				log[key] = this.log.bind(this);
			} else {
				console.warn(`log.${key} already exists as a custom logging channel. It cannot be overridden.`);
			}
			
			//Push to instances
			log.Channel.instances.push(this);
		}
		
		close () {
			
		}
		
		drawComponent () {
			
		}
		
		log (...args) {
			this.print("log", args);
		}
		
		open () {
			
		}
		
		/**
		 * Internal helper to execute the styled log
		 * @param {string} level - The console level (log, warn, error, info)
		 * @param {Array} args - The arguments passed to the log function
		 */
		print (level, args) {
			let template = `%c${this.key.toUpperCase()}%c `;
			
			//If the first argument is a string, we can merge it into the template; this allows the user to still use %s, %d, etc. in their own messages
			if (typeof args[0] === "string") {
				let message = args.shift();
				console[level](
					`${template}${message}`,
					this.options.pre_css,
					this.options.post_css,
					...args,
				);
			} else {
				console[level](template, this.options.pre_css, this.options.post_css, ...args);
			}
		}
		
		remove () {
			//Iterate over all channels and remove it
			for (let i = 0; i < log.Channel.instances.length; i++)
				if (log.Channel.instances[i] === this.key)
					log.Channel.instances.splice(i, 1);
			
			//Remove log[key]
			delete log[this.key];
		}
	};
}
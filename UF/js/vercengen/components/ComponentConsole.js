/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * - `arg1_options`: {@link Object}
 *   - `.view_only=false`: {@link boolean}
 * 
 * @type {ve.Log}
 */
ve.Log = class extends ve.Component { //[WIP] - Finish Component body
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-log");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		
		this.actions_bar_el = new ve.RawInterface({
			console_command: new ve.Text("", {
				attributes: { placeholder: loc("ve.registry.localisation.ScriptManager_enter_console_command") },
				name: " ",
				style: {
					display: "inline",
					'input[type="text"]': {
						maxWidth: "30rem"
					}
				}
			}),
			send_command: new ve.Button(() => {
				//Declare local instance variables
			}, { name: "Send" }),
			clear_console: new ve.Button(() => {
				let local_confirm_modal = new ve.Confirm("Are you sure you want to clear the present console?", {
					special_function: () => this.console_el.innerHTML = ""
				});
			}, { name: "Clear Console" }),
		}, {
			style: { whiteSpace: "nowrap" }
		});
		this.console_el = document.createElement("div");
		this.draw();
		
		if (log.Channel.instances > 0) {
			this.openChannel(log.Channel.instances[0].key);
		}
	}
	
	draw () {
		//Declare local instance variables
		let components_obj = {};
		let search_select_obj = {};
		
		//Iterate over all log.Channel.instances and append them to search_select_el as buttons
		for (let i = 0; i < log.Channel.instances.length; i++) {
			let local_log_channel = log.Channel.instances[i];
			
			let local_el = document.createElement("button");
				local_el.id = local_log_channel.key;
				local_el.setAttribute("data-log-key", local_log_channel.key);
				local_el.innerText = local_log_channel.key;
				local_el.onclick = () => this.openChannel(local_log_channel.key);
			let local_html_obj = new ve.HTML(local_el);
				local_html_obj._name = local_log_channel.key;
			
			search_select_obj[local_log_channel.key] = local_html_obj;
		}
		
		components_obj = {
			search_select: new ve.SearchSelect({
				...search_select_obj
			}, {
				search_keys: ["_name"],
			}),
			console_el: new ve.HTML(this.console_el, {
				style: { paddingLeft: "var(--padding)" }
			}),
			type: "horizontal"
		};
		
		if (!this.interface) {
			this.interface = new ve.FlexInterface(components_obj);
			this.interface.bind(this.element);
		} else {
			this.interface.v = components_obj;
		}
	}
	
	openChannel (arg0_log_key) {
		//Convert from parameters
		let log_key = (arg0_log_key) ? arg0_log_key : log.Channel.instances?.[0]?.key;
		
		if (!log_key) return; //Internal guard clause if log_key is undefined
		if (!log[log_key]) return; //Internal guard clause if no log object matches this channel
		
		//Declare local instance variables
		let log_obj;
			for (let i = 0; i < log.Channel.instances.length; i++)
				if (log.Channel.instances[i].key === log_key) {
					log_obj = log.Channel.instances[i];
					break;
				}
		this._open_key = log_key;
		
		//Populate this.console_el
		this.console_el.innerHTML = "";
		this.console_el.appendChild(log_obj.log_el);
		this.actions_bar_el.bind(this.console_el);
		
		//Update draw call
		this.draw();
	}
};

/**
 * @returns {ve.Log}
 */
veLog = function () {
	//Return statement
	return new ve.Log(...arguments);
};
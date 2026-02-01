global.UI_Mapmodes = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.mapmodes = UI_Mapmodes.getAllMapmodes();
		
		this.initialisation_logic_loop = setInterval(() => {
			try {
				this.draw();
				clearInterval(this.initialisation_logic_loop);
			} catch (e) {}
		}, 100);
	}
	
	draw () {
		//Draw current interface
		{
			try {
				super.close("instance");
			} catch (e) {}
			
			let mapmodes_components_obj = {};
			
			this.interface = new ve.Interface({
				mapmode_selection: new ve.SearchSelect({
					default: veButton(() => {
						this.setMapmode("none");
					}, {
						attributes: {
							"data-default": true
						},
						name: "<icon>landscape</icon><span style = 'display: none;'>Default</span>",
						tooltip: "Default"
					}),
					polities_Cliopatria_UI: veButton(() => {
						this.setMapmode("polities_Cliopatria_UI");
					}, {
						attributes: {
							"data-default": true
						},
						name: "<icon>flag</icon><span style = 'display: none;'>Default</span>",
						tooltip: "Cliopatria"
					}),
				}, {
					header_components_obj: {
						add_new_mapmode: veButton(() => {
							
						}, {
							name: "<icon>add_circle</icon>",
							tooltip: "Add New Mapmode",
							style: { marginLeft: "var(--cell-padding)" }
						}),
						mapmode_settings: veButton(() => {
							
						}, {
							name: "<icon>settings</icon>",
							tooltip: "Mapmode Settings",
							style: { marginLeft: "var(--cell-padding)" }
						})
					},
					filter_names: {
						"data-default": "Default"
					}
				})
			}, {
				is_folder: false,
				style: {
					padding: 0
				}
			});
			
			//Open window
			super.open("instance", {
				anchor: "bottom_right",
				mode: "static_window",
				name: "Mapmodes",
				width: "26rem",
				x: 8,
				y: 8
			});
		}
		
		//Refresh current mapmode_obj if possible
		if (this._selected_mapmode) {
			let mapmode_obj = this.mapmodes[this._selected_mapmode];
			
			mapmode_obj.draw(main.date);
		}
	}
	
	setMapmode (arg0_mapmode) {
		//Convert from parameters
		let mapmode = arg0_mapmode;
		
		//Declare local instance variables
		let current_mapmode = this.mapmodes[this._selected_mapmode];
		let new_mapmode = this.mapmodes[mapmode];
		
		//Clear current mapmode first before selecting a new one
		if (current_mapmode) current_mapmode.clear();
		
		//Set _selected_mapmode; clear currently _selected_mapmode if available, then draw it
		this._selected_mapmode = mapmode;
		if (new_mapmode) {
			new_mapmode.draw(main.date);
			this.draw();
		}
	}
	
	static getAllMapmodes () {
		//Return statement
		return {
			polities_Cliopatria_UI: new polities_Cliopatria_UI()
		};
	};
};
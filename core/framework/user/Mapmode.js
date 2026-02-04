if (!global.naissance) global.naissance = {};

/**
 * ##### Constructor:
 * - `arg0_mapmode_id`: {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.icon`: {@link string}
 *   - `.name`: {@link string}
 *   - `.layer="bottom"`: {@link string} - Either 'bottom'/'top', targets `main.layers.mapmode_<key>_layer`.
 *   - 
 *   - `.node_editor_file`: {@link string}
 *   - `.node_editor_value`: {@link Object}
 *   - `.special_function`: {@link function} | {@link maptalks.Geometry}[]
 * 
 * @type {naissance.Mapmode}
 */
naissance.Mapmode = class extends ve.Class { //[WIP] - Finish class body
	static instances = [];
	
	constructor (arg0_mapmode_id, arg1_options) {
		//Convert from parameters
		let mapmode_id = arg0_mapmode_id;
		let options = (arg1_options) ? arg1_options : {};
			super();
			
		//Initialise options
		if (!options.layer) options.layer = "bottom";
			
		//Declare local instance variables
		this.geometries = [];
		this.id = (mapmode_id) ? mapmode_id : Class.generateRandomID(naissance.Mapmode);
		this.options = options;
		
		naissance.Mapmode.instances.push(this);
	}
	
	drawHierarchyDatatype () {
		//Return statement
		return veButton(() => {
			this.show();
		}, {
			name: `<icon>${(this.options.icon) ? this.options.icon : "flag"}</icon>`,
			tooltip: `${(this.options.name) ? this.options.name : this.id}`
		});
	}
	
	hide () {
		//Iterate over all this.geometries and remove them from the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
		
		//Remove mapmode from main.user.mapmodes
		for (let i = 0; i < main.user.mapmodes.length; i++)
			if (main.user.mapmodes[i] === this.id) {
				main.user.mapmodes.splice(i, 1);
				break;
			}
	}
	
	show () {
		if (main.user.mapmodes.includes(this.id)) return; //Internal guard clause if mapmode is already included
		
		//Declare local instance variables
		let mapmode_layer = main.layers[`mapmode_${this.options.layer}_layer`];
		
		main.user.mapmodes.push(this.id);
		
		if (this.options.special_function) {
			//Remove all current geometries before resetting
			for (let i = 0; i < this.geometries.length; i++)
				this.geometries[i].remove();
			this.geometries = this.options.special_function(this);
			
			for (let i = 0; i < this.geometries.length; i++)
				this.geometries[i].addTo(mapmode_layer);
		}
	}
	
	/**
	 * Loads config mapmodes from `./common/mapmodes/`, mapmodes with conflicting IDs are replaced
	 */
	static loadConfig () {
		
	}
};
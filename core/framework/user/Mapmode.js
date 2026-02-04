if (!global.naissance) global.naissance = {};

/**
 * ##### Constructor:
 * - `arg0_mapmode_id`: {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.icon`: {@link string}
 *   - `.name`: {@link string}
 *   - 
 *   - `.node_editor_file`: {@link string}
 *   - `.node_editor_value`: {@link Object}
 *   - `.special_function`: {@link function}
 * 
 * @type {naissance.Mapmode}
 */
naissance.Mapmode = class extends ve.Class {
	static instances = [];
	
	constructor (arg0_mapmode_id, arg1_options) {
		//Convert from parameters
		let mapmode_id = arg0_mapmode_id;
		let options = (arg1_options) ? arg1_options : {};
			super();
			
		//Declare local instance variables
		this.id = (mapmode_id) ? mapmode_id : Class.generateRandomID(naissance.Mapmode);
		this.options = options;
	}
	
	drawHierarchyDatatype () {
		//Return statement
		return veButton(() => {
			
		}, {
			name: `<icon>${(this.options.icon) ? this.options.icon : "flag"}</icon>`,
			tooltip: `${(this.options.name) ? this.options.name : this.id}`
		});
	}
};
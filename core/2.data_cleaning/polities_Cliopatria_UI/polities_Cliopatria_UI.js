global.polities_Cliopatria_UI = class {
	/**
	 * @type {string}
	 */
	static input_path = "./core/1.data_scraping/polities_Cliopatria/cliopatria.geojson/cliopatria_polities_only.geojson";
	
	constructor (arg0_options) {
		//Declare local instance variables
		this.geojson_obj = JSON.parse(fs.readFileSync(polities_Cliopatria_UI.input_path, "utf8"));
		this.geometries = [];
		this.is_dataset = true;
	}
	
	clear () {
		//Iterate over all this.geometries and remove them from the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
	}
	
	draw (arg0_date) {
		//Convert from parameters
		let date_obj = (arg0_date) ? arg0_date : Date.getCurrentDate();
		
		//Clear map first
		this.clear();
		
		//Iterate over geojson_obj.features and if the date is between [.properties.FromYear, .properties.ToYear], append it to the map, inclusive
		for (let i = 0; i < this.geojson_obj.features.length; i++) {
			let local_feature = this.geojson_obj.features[i];
			let local_feature_properties = this.geojson_obj.features[i].properties;
			
			if (local_feature_properties)
				if (date_obj.year >= local_feature_properties.FromYear && date_obj.year <= local_feature_properties.ToYear) {
					let local_geometry = new maptalks.GeoJSON.toGeometry(local_feature);
					
					this.geometries.push(local_geometry);
				}
		}
		
		//Iterate over all this.geometries and render them on the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].addTo(main.layers.entity_layer);
	}
};
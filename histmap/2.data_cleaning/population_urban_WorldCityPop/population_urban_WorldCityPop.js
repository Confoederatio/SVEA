global.population_urban_WorldCityPop = class {
	static _cache_dom;
	static input_population_html = `${h1}/population_urban_WorldCityPop/_worldcitypop.htm`;
	
	static async A_getWorldCityPopObject () {
		//Declare local instance variables
		let jsdom_obj = (this._cache_dom) ? 
			this._cache_dom : new JSDOM(fs.readFileSync(this.input_population_html, "utf8"));
		let world_city_pop_dom = jsdom_obj.window.document;
		
		//Cache extracted DOM; select table_el
		if (!this._cache_dom) this._cache_dom = jsdom_obj;
		let pop_dataframe = HTML.getTableAsDataframe(
			world_city_pop_dom.querySelector(`table#tbl`), 
			{ property: "textContent" }
		);
		let pop_dataframe_header = pop_dataframe[0];
		let pop_obj = {};
		
		//Attempt parseInt on numeric headers
		for (let i = 0; i < pop_dataframe_header.length; i++)
			if (!isNaN(parseInt(pop_dataframe_header[i])))
				pop_dataframe_header[i] = parseInt(pop_dataframe_header[i]);
		
		//Iterate over all rows in pop_dataframe after header
		for (let i = 1; i < pop_dataframe.length; i++) {
			let local_key = `${pop_dataframe[i][0]}-${pop_dataframe[i][1]}`;
			let local_population_obj = {};
			
			//Iterate over all years
			for (let x = 2; x < pop_dataframe[i].length; x++) {
				let local_value = parseInt(pop_dataframe[i][x].replaceAll(",", ""));
				
				if (!isNaN(local_value))
					local_population_obj[pop_dataframe_header[x]] = local_value;
			}
			
			pop_obj[local_key] = {
				name: pop_dataframe[i][0],
				
				country: pop_dataframe[i][1],
				key: local_key,
				
				population: local_population_obj
			};
		}
		
		//Return statement
		return pop_obj;
	}
};
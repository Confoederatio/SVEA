//Initialise functions
{
	if (!global.population_KK10LUH2) global.population_KK10LUH2 = {};
	
	global.population_KK10LUH2 = class {
		static kk10_domain = [-6051, 1850];
		static luh2_domain = [900, 2018];
		static luh2_variables = ["c3ann", "c3nfx", "c3per", "c4ann", "c4per", "pasture", "urban"];
		
		static _cache_nelson_data_obj;
		static input_luh2_folder = `${h1}/population_KK10LUH2/LUH2/`;
		static input_kk10_folder = `${h1}/population_KK10LUH2/KK10/`;
		static input_nelson_json = `${h2}/population_KK10LUH2/config/nelson_data.json5`;
		static input_nelson_raster = `${h2}/population_KK10LUH2/config/nelson_regions.png`;
		static intermediate_luh2_rasters = `${h2}/population_KK10LUH2/rasters_LUH2_anthropogenic_mean/`;
		static intermediate_luh2kk10_greyscale_rasters = `${h2}/population_KK10LUH2/rasters_LUH2KK10_greyscale/`;
		
		static async A_getNelsonDataObject () {
			//Internal guard clause if _cache_nslon_data_obj is already defined
			if (this._cache_nelson_data_obj) return this._cache_nelson_data_obj;
			
			//Declare local instance variables
			let nelson_data_obj = JSON5.parse(fs.readFileSync(this.input_nelson_json, "utf8"));
			this._cache_nelson_data_obj = nelson_data_obj;
			
			//Return statement
			return nelson_data_obj;
		}
		
		static async A_averageLUH2Rasters () {
			//Declare local instance variables
			let hyde_years = landuse_HYDE.hyde_years;
			
			//Iterate over all hyde_years in this.luh2_domain
			for (let i = this.luh2_domain[0]; i <= this.luh2_domain[1]; i++)
				if (hyde_years.includes(i)) try {
					let luh2_images = {};
					let luh2_stocks = this.luh2_variables;
					
					for (let x = 0; x < luh2_stocks.length; x++) try {
						let local_input_path = `${this.input_luh2_folder}${luh2_stocks[x]}/output_folder/LUH2_${luh2_stocks[x]}_${i}.png`;
						
						luh2_images[luh2_stocks[x]] = GeoPNG.loadNumberRasterImage(local_input_path, { type: "greyscale" });
					} catch (e) { console.error(e); }
					
					console.log(`- Averaging LUH2 raster for ${i} ..`);
					GeoPNG.saveNumberRasterImage({
						file_path: `${this.intermediate_luh2_rasters}LUH2_${i}.png`,
						type: "greyscale",
						
						height: luh2_images[luh2_stocks[0]].height,
						width: luh2_images[luh2_stocks[1]].width,
						function: function (arg0_index) {
							//Convert from parameters
							let index = arg0_index;
							
							//Declare local instance variables
							let local_sum = 0;
							
							//Average all luh2_images
							for (let x = 0; x < luh2_stocks.length; x++) {
								let local_value = luh2_images[luh2_stocks[x]].data[index];
								
								local_sum += local_value;
							}
							
							//Return statement
							return local_sum/luh2_stocks.length;
						}
					});
				} catch (e) { console.error(e); }
		}
		
		static async B_generateKK10LUH2Rasters () {
			//Declare local instance variables
			let hyde_years = landuse_HYDE.hyde_years;
			
			//Iterate over all hyde_years
			for (let i = 0; i < hyde_years.length; i++) try {
				let in_luh2_domain = (hyde_years[i] >= this.luh2_domain[0] && hyde_years[i] <= this.luh2_domain[1]);
				let in_kk10_domain = (hyde_years[i] >= this.kk10_domain[0] && hyde_years[i] <= this.kk10_domain[1]);
				let output_file_path = `${this.intermediate_luh2kk10_greyscale_rasters}KK10LUH2_${hyde_years[i]}.png`;
				
				if (in_luh2_domain || in_kk10_domain) {
					//1. If this is an intersection of both the luh2_domain and kk10_domain; average rasters
					let luh2_file_path = `${this.intermediate_luh2_rasters}LUH2_${hyde_years[i]}.png`;
					let kk10_file_path = `${this.input_kk10_folder}KK10_${hyde_years[i]}.png`;
					
					if (in_luh2_domain && in_kk10_domain) {
						let luh2_image = GeoPNG.loadNumberRasterImage(luh2_file_path, { type: "greyscale" });
						let kk10_image = GeoPNG.loadNumberRasterImage(kk10_file_path, { type: "greyscale" });
						
						console.log(`- Averaging KK10 and LUH2 for ${hyde_years[i]} ..`);
						GeoPNG.saveNumberRasterImage({
							file_path: output_file_path,
							type: "greyscale",
							
							height: luh2_image.height,
							width: luh2_image.width,
							function: function (arg0_index) {
								//Convert from parameters
								let index = arg0_index;
								
								//Return statement
								return (kk10_image.data[index] + luh2_image.data[index])/2;
							}
						});
						
						console.log(`- File written to ${output_file_path}.`);
						continue;
					}
					
					//2. If this is of only the kk10_domain; merely copy the kk10 raster to its destination
					if (in_kk10_domain && !in_luh2_domain)
						fs.copyFileSync(kk10_file_path, output_file_path);
					
					//3. If this is of only the luh2_domain; merely copy the luh2 raster to its destination
					if (in_luh2_domain && !in_kk10_domain)
						fs.copyFileSync(luh2_file_path, output_file_path);
				}
			} catch (e) { console.error(e); }
		}
		
		static async C_convertKK10LUH2RastersToRGBA () {
			//Declare local instance variables
		}
		
		static async D_scaleKK10LUH2RastersToRegional () {
			
		}
		
		static async E_scaleKK10LUH2RastersToGlobal () {
			
		}
		
		static async processRasters () {
			//1. Average greyscales from KK10/LUH2 climate models
			await this.A_averageLUH2Rasters();
			//2. Convert greyscale images to GeoPNGs
			await this.B_generateKK10LUH2Rasters();
		}
	};
}
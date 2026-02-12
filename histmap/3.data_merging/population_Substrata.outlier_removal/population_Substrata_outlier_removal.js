//Initialise functions
{
	global.population_Substrata_outlier_removal = class {
		static bf = `${h3}/population_Substrata.outlier_removal/`;
		static input_outlier_rasters = `${this.bf}rasters_outliers/`;
		static intermediate_global_rasters = `${this.bf}rasters_1.scaled_to_global/`;
		static intermediate_outliers_removed_rasters = `${this.bf}rasters_outliers_removed/`;
		
		static async A_getHYDEOutlierMasksObject () {
			//Declare local instance variables
			let all_files = fs.readdirSync(this.input_outlier_rasters);
			let return_obj = {};
			
			//Iterate over all_files and fetch time domains per file_path
			for (let i = 0; i < all_files.length; i++) {
				let local_file_path = path.join(this.input_outlier_rasters, all_files[i]);
				
				if (!fs.statSync(local_file_path).isDirectory() && local_file_path.endsWith(".png")) {
					let split_file_name = local_file_path.replace(".png", "").split("_");
					
					if (split_file_name.length >= 2) {
						let end_year = parseInt(split_file_name[split_file_name.length - 1]);
						let start_year = parseInt(split_file_name[split_file_name.length - 2]);
						
						return_obj[local_file_path] = {
							file_path: local_file_path,
							end_year: end_year,
							start_year: start_year
						};
					} else {
						console.error(`${local_file_path} has less than 2 arguments. It must include a _<start_year>_<end_year> formatter as a suffix.`);
					}
				}
			}
			
			//Return statement
			return return_obj;
		}
		
		static async A_removeOutliersForHYDEYear (arg0_year) {
			//Convert from parameters
			let year = arg0_year;
			
			//Declare local instance variables
			let fallback_file_path = `${population_KK10LUH2.output_kk10_luh2_global_rasters}popc_${year}.png`;
			let fallback_raster = GeoPNG.loadNumberRasterImage(fallback_file_path);
			let hyde_input_file_path = `${landuse_HYDE.intermediate_rasters_scaled_to_global}popc_${year}.png`;
			let hyde_output_file_path = `${this.intermediate_outliers_removed_rasters}popc_${year}.png`;
			
			let hyde_outlier_masks = await this.A_getHYDEOutlierMasksObject();
			let hyde_outlier_rasters = {};
			let hyde_pixel_outliers = []; //Indices detected as being outliers
			let hyde_raster = GeoPNG.loadNumberRasterImage(hyde_input_file_path);
			
			//Iterate over all_hyde_outlier_masks; load hyde_outlier_rasters
			Object.iterate(hyde_outlier_masks, (local_key, local_value) => {
				if (year >= local_value?.start_year && year <= local_value?.end_year)
					hyde_outlier_rasters[local_key] = GeoPNG.loadImage(local_key);
			});
			
			//Operate over current image; check if number is an outlier compared to neighbouring pixels; iterate over all pixels in hyde_raster, excluding border pixels
			for (let i = 1; i < hyde_raster.height - 1; i++)
				for (let x = 1; x < hyde_raster.width - 1; x++) {
					let local_index = i*hyde_raster.width + x;
					let neighbour_average = GeoPNG.getRasterNeighbourAverage(hyde_raster.data, i, x, hyde_raster.height, hyde_raster.width);
					
					if (!isNaN(neighbour_average) && neighbour_average > 0 && hyde_raster.data[local_index] > 8*neighbour_average)
						hyde_pixel_outliers.push(local_index);
				}
			
			console.log(` - Outliers detected:`, hyde_pixel_outliers.length);
			
			//Save number raster image
			GeoPNG.saveNumberRasterImage({
				file_path: hyde_output_file_path,
				height: hyde_raster.height,
				width: hyde_raster.width,
				function: (local_index) => {
					//Declare local instance variables
					let byte_index = local_index*4;
					let is_outlier = (hyde_pixel_outliers.includes(local_index));
					
					//Check if any of hyde_outlier_rasters contains [0, 0, 0] masking for this pixel
					if (!is_outlier) {
						let all_hyde_outlier_rasters = Object.keys(hyde_outlier_rasters);
						
						for (let i = 0; i < all_hyde_outlier_rasters.length; i++) {
							let local_raster = hyde_outlier_rasters[all_hyde_outlier_rasters[i]];
							let local_raster_colour = [
								local_raster.data[byte_index],
								local_raster.data[byte_index + 1],
								local_raster.data[byte_index + 2],
								local_raster.data[byte_index + 3]
							].join(",");
							
							//Break if outlier is detected
							if (local_raster_colour === "0,0,0,255") {
								is_outlier = true;
								break;
							}
						}
					}
					
					//If this pixel is an outlier, overwrite it with the equivalent content in fallback_image
					//Return statement
					if (is_outlier) {
						return fallback_raster.data[local_index];
					} else {
						return hyde_raster.data[local_index];
					}
				}
			});
		}
		
		static async A_removeOutliersForHYDE () {
			//Declare local instance variables
			let hyde_years = landuse_HYDE.hyde_years;
			
			//Iterate over all hyde_years
			for (let i = 0; i < hyde_years.length; i++) try {
				console.log(`- Removing HYDE outliers for ${landuse_HYDE._getHYDEYearName(hyde_years[i])} ..`);
				await this.A_removeOutliersForHYDEYear(hyde_years[i]);
			} catch (e) { console.error(e); }
		}
		
		static async B_scaleProcessedHYDEToGlobal () {
			//Declare local instance variables
			let hyde_years = landuse_HYDE.hyde_years;
			let world_pop_obj = population_Global.A_getWorldPopulationObject();
			
			//Iterate over all hyde_years and scale the corresponding raster to the global mean
			for (let i = 0; i < hyde_years.length; i++) {
				let local_hyde_input_path = `${this.intermediate_outliers_removed_rasters}popc_${hyde_years[i]}.png`;
				let local_output_path = `${this.intermediate_global_rasters}popc_${hyde_years[i]}.png`;
				let local_world_pop = world_pop_obj[hyde_years[i]];
				
				if (fs.existsSync(local_hyde_input_path)) {
					//Fetch current image sum
					let local_hyde_sum = GeoPNG.getImageSum(local_hyde_input_path);
					let local_scalar = local_world_pop/local_hyde_sum;
					
					//Multiply raster by local scalar and output it
					console.log(`- Multiplying corrected HYDE Raster for ${hyde_years[i]} (x${local_scalar}) ..`);
					
					let local_hyde_image = GeoPNG.loadNumberRasterImage(local_hyde_input_path);
					GeoPNG.saveNumberRasterImage({
						file_path: local_output_path,
						height: 2160,
						width: 4320,
						function: (local_index) => Math.ceil(local_hyde_image.data[local_index]*local_scalar)
					});
				} else {
					console.warn(`- ${local_hyde_input_path} could not be found.`);
				}
			}
		}
		
		static async processRasters () {
			//1. Remove outliers for HYDE
			await this.A_removeOutliersForHYDE();
			//2. Scale processed outliers to global population
			await this.B_scaleProcessedHYDEToGlobal();
		}
	};
}
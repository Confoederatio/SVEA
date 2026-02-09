//Initialise functions
{
	if (!global.landuse_HYDE) global.landuse_HYDE = {};
	
	global.landuse_HYDE = class {
		static hyde_dictionary = {
			//LU (Land Use)
			"conv_rangeland": "Converted Rangeland (km^2/cell)",
			"cropland": "Cropland (km^2/cell)",
			"grazing": "Grazing Land (km^2/cell)",
			"ir_norice": "Irrigated Non-Rice Cropland (km^2/cell)",
			"ir_rice": "Irrigated Rice Cropland (km^2/cell)",
			"pasture": "Pasture Area (km^2/cell)",
			"rangeland": "Rangeland Area (km^2/cell)",
			"rf_norice": "Rainfed Non-Rice Cropland (km^2/cell)",
			"rf_rice": "Rice Cropland (km^2/cell)",
			"shifting": "Manual Weight Changes (Unknown)",
			"tot_irri": "Irrigated Area (km^2/cell)",
			"tot_rainfed": "Rainfed Non-Rice Cropland (km^2)",
			"tot_rice": "Rice Cropland (km^2)",
			
			//POP (Demographics)
			"popc_": "Total Population (pop/cell)",
			"popd_": "Population Density (pop/km^2)",
			"rurc_": "Rural Population (pop/cell)",
			"uopp_": "Built-Up Area (km^2/cell)",
			"urbc_": "Urban Population (pop/cell)"
		};
		static hyde_original_years = [
			//100-year intervals
			0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700,
			
			//10-year intervals
			1710, 1720, 1730, 1740, 1750, 1760, 1770, 1780, 1790, 1800, 1810, 1820, 1830, 1840, 1850, 1860, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950,
			
			//1-year intervals
			1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2019, 2020, 2021, 2022, 2023,
			
			//Post-addendum (1000-year intervals except 10000BC in base dataset)
			-1000, -3000, -4000, -5000, -6000, -7000, -8000, -9000
		];
		static hyde_years = [
			//100-year intervals
			0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700,
			
			//10-year intervals
			1710, 1720, 1730, 1740, 1750, 1760, 1770, 1780, 1790, 1800, 1810, 1820, 1830, 1840, 1850, 1860, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950,
			
			//1-year intervals
			1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
			
			//Post-addendum
			-1000, -2000, -3000, -4000, -5000, -6000, -7000, -8000, -9000, -10000
		];
		
		static input_rasters_equirectangular = `${h1}/landuse_HYDE/`;
		static intermediate_rasters_equirectangular = `${h2}/landuse_HYDE/rasters/`;
		
		/**
		 * @param {number|string} arg0_year
		 *
		 * @returns {string}
		 */
		static _getHYDEYearName = function (arg0_year) {
			//Convert from parameters
			let year = parseInt(arg0_year);
			
			//Return statement
			return `${Math.abs(year)}${(year >= 0) ? "AD" : "BC"}`;
		}
		
		static async A_convertToPNGs (arg0_input_folder, arg1_output_folder, arg2_options) {
			//Convert from parameters
			let input_folder = arg0_input_folder;
			let output_folder = arg1_output_folder;
			let options = arg2_options ? arg2_options : {};
			
			//Declare local instance variables
			let all_input_files = await File.getAllFiles(input_folder);
			
			//Iterate over all_input_files
			for (let i = 0; i < all_input_files.length; i++) {
				let current_path = all_input_files[i];
				
				//Use the promise-based lstat
				let stats = await fs.promises.lstat(current_path);
				
				if (stats.isDirectory()) {
					console.log(`Parsing HYDE folder: ${current_path}`);
					
					//Await the recursive call so the folders are processed in order
					await this.A_convertToPNGs(current_path, output_folder, options);
				} else if (current_path.endsWith(".asc")) {
					let local_suffix = (options.mode === "percentage") ? 
						"_percentage" : "_number";
					
					// Extract filename without extension and build output path
					let local_file_name = path.basename(current_path, ".asc");
					let output_path = path.join(
						output_folder,
						`${local_file_name}${local_suffix}.png`
					);
					console.log(`Converting: ${local_file_name}.asc`);
					
					//setImmediate wrapper
					await new Promise((resolve, reject) => {
						setImmediate(() => {
							try {
								GeoASC.convertToPNG(current_path, output_path, options);
								resolve();
							} catch (err) {
								reject(err);
							}
						});
					});
				}
			}
		}
		
		/**
		 * Fills in missing HYDE years by performing linear or polynomial interpolation.
		 * 
		 * @param {number|string} arg0_year - The year to generate the raster set for.
		 * @param {Object} [arg1_options]
		 *  @param {Array<String>} [arg1_options.hyde_keys] - The keys to generate the raster set for. All by default.
		 *  @param {String} [arg1_options.mode="linear"] - The mode to use for interpolation. Either 'linear' or 'polynomial'.
		 *  @param {boolean} [arg1_options.skip_file_if_it_exists=false] - Whether to skip the file if it already exists.
		 */
		static async B_interpolateHYDEYearRaster (arg0_year, arg1_options) {
			//Convert from parameters
			let year = parseInt(arg0_year);
			let options = (arg1_options) ? arg1_options : {};
			
			//Declare local instance variables
			let actual_hyde_years = this.hyde_original_years;
			let hyde_dictionary = this.hyde_dictionary;
			let hyde_domain = Array.findDomain(actual_hyde_years, year);
			
			//Iterate over all keys in hyde_dictionary and perform linear interpolation
			let all_hyde_keys = (options.hyde_keys) ?
				Array.toArray(options.hyde_keys) : Object.keys(hyde_dictionary);
			
			console.log(`Generating Rasters for year ${year} ..`);
			
			for (let i = 0; i < all_hyde_keys.length; i++) {
				let local_left_image_path = `${this.intermediate_rasters_equirectangular}${all_hyde_keys[i]}${this._getHYDEYearName(hyde_domain[0])}_number.png`;
				let local_right_image_path = `${this.intermediate_rasters_equirectangular}${all_hyde_keys[i]}${this._getHYDEYearName(hyde_domain[1])}_number.png`;
				
				let local_left_image = GeoPNG.loadNumberRasterImage(local_left_image_path);
				let local_right_image = GeoPNG.loadNumberRasterImage(local_right_image_path);
				
				let local_number_output_file_path = `${this.intermediate_rasters_equirectangular}${all_hyde_keys[i]}${this._getHYDEYearName(year)}_number.png`;
				let local_percentage_output_file_path = `${this.intermediate_rasters_equirectangular}${all_hyde_keys[i]}${this._getHYDEYearName(year)}_percentage.png`;
				let skip_file = false;
				if (options.skip_file_if_it_exists)
					skip_file = fs.existsSync(local_number_output_file_path);
				
				log.info(`- Saving ${all_hyde_keys[i]}`);
				
				if (!skip_file)
					GeoPNG.saveNumberRasterImage({
						file_path: local_number_output_file_path,
						width: local_left_image.width,
						height: local_left_image.height,
						function: function (arg0_index) {
							//Convert from parameters
							let local_index = arg0_index;
							
							//Interpolate growth rate between left and right images at pixel value
							let left_number = local_left_image.data[local_index];
							let right_number = local_right_image.data[local_index];
							
							let local_value = Math.round(Array.linearInterpolation([hyde_domain[0], hyde_domain[1]], [left_number, right_number], year));
							if (local_value < 0) local_value = 0;
							
							//Return statement
							return local_value;
						}
					});
				GeoPNG.savePercentageRasterImage(local_number_output_file_path, local_percentage_output_file_path);
			}
		};
		
		static async processRasters () {
			//1. Convert equirectangular rasters
			await this.A_convertToPNGs(this.input_rasters_equirectangular, this.intermediate_rasters_equirectangular, {
				mode: "number"
			});
		}
	};
}
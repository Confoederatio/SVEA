//Initialise functions
{
	if (!global.landuse_HYDE) global.landuse_HYDE = {};
	
	global.landuse_HYDE = class {
		static input_rasters_equirectangular = `${h1}/landuse_HYDE/`;
		static intermediate_rasters_equirectangular = `${h2}/landuse_HYDE/rasters/`;
		
		static async A_convertToPNGs(
			arg0_input_folder,
			arg1_output_folder,
			arg2_options
		) {
			// Convert from parameters
			let input_folder = arg0_input_folder;
			let output_folder = arg1_output_folder;
			let options = arg2_options ? arg2_options : {};
			
			// Get all files using your existing File utility
			// Ensure File.getAllFiles is also awaited correctly
			const all_input_files = await File.getAllFiles(input_folder);
			
			// Iterate over all_input_files
			for (let i = 0; i < all_input_files.length; i++) {
				let currentPath = all_input_files[i];
				
				//Use the promise-based lstat
				let stats = await fs.promises.lstat(currentPath);
				
				if (stats.isDirectory()) {
					console.log(`Parsing HYDE folder: ${currentPath}`);
					
					// Await the recursive call so the folders are processed in order
					await this.A_convertToPNGs(currentPath, output_folder, options);
				} else if (currentPath.endsWith(".asc")) {
					let local_suffix =
						options.mode === "percentage" ? "_percentage" : "_number";
					
					// Extract filename without extension and build output path
					let local_file_name = path.basename(currentPath, ".asc");
					let output_path = path.join(
						output_folder,
						`${local_file_name}${local_suffix}.png`
					);
					
					console.log(`Converting: ${local_file_name}.asc`);
					
					/**
					 * Because GeoASC.convertToPNG is synchronous, we wrap it in a Promise.
					 * We use setImmediate to push the execution to the next iteration of
					 * the event loop. This prevents the CPU from being "locked" by this
					 * loop if there are many files.
					 */
					await new Promise((resolve, reject) => {
						setImmediate(() => {
							try {
								GeoASC.convertToPNG(currentPath, output_path, options);
								resolve();
							} catch (err) {
								reject(err);
							}
						});
					});
				}
			}
		}
		
		static async processRasters () {
			//1. Convert equirectangular rasters
			await this.A_convertToPNGs(this.input_rasters_equirectangular, this.intermediate_rasters_equirectangular, {
				mode: "number"
			});
		}
	};
}
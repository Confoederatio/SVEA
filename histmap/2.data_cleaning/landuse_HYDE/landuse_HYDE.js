//Initialise functions
{
	if (!global.landuse_HYDE) global.landuse_HYDE = {};
	
	global.landuse_HYDE = class {
		static input_path_hyde
		
		static async A_convertToPNGs (arg0_input_folder, arg1_output_folder, arg2_options) {
			//Convert from parameters
			let input_folder = arg0_input_folder;
			let output_folder = arg1_output_folder;
			let options = (arg2_options) ? arg2_options : {};
			
			//Declare local instance variables
			let all_input_files = File.getAllFiles(input_folder);
			
			//Iterate over all_input_files. Remember that HYDE entries are contained in separate directories.
			for (let i = 0; i < all_input_files.length; i++)
				if (fs.lstatSync(all_input_files[i]).isDirectory()) {
					console.log(`Parsing HYDE folder: ${all_input_files[i]}`);
					
					this.A_convertToPNGs(all_input_files[i], output_folder, options);
				} else if (all_input_files[i].endsWith(".asc")) {
					let local_split_path = all_input_files[i].split("\\");
					let local_suffix = (options.mode === "percentage") ?
						`_percentage` : `_number`;
					
					let local_file_name = local_split_path[local_split_path.length - 1];
					
					//Convert ASC to PNG according to options
					GeoASC.convertToPNG(all_input_files[i], `${output_folder}/${local_file_name.replace(".asc", "")}${local_suffix}.png`, options);
				}
		}
	};
}
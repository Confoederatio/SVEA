//Initialise functions
{
	if (!global.GDP_PPP_SEDAC_Legacy) global.GDP_PPP_SEDAC_Legacy = {};
	
	global.GDP_PPP_SEDAC_Legacy = class {
		static async A_convertToASCs (arg0_input_file_path, arg1_output_folder, arg2_variable_key) {
			//Convert from parameters
			let input_file_path = arg0_input_file_path;
			let output_folder = arg1_output_folder;
			let variable_key = arg2_variable_key;
			
			//Declare local instance variables
			let file_buffer = fs.readFileSync(input_file_path);
			let reader = new netcdfjs.NetCDFReader(file_buffer);
			
			let time_domain = reader.getDataVariable("time").length;
			
			//Log SEDAC processing
			console.log(`Processing SEDAC (Legacy) iteratively into ${output_folder} with a time_domain of: ${time_domain}`);
			
			//Iterate over time_domain
			for (let i = 0; i < time_domain; i++) {
				console.log(`Processing ${i}/${time_domain} (${1990 + i}AD) ..`);
				await GeoNC.convertToASC(input_file_path, `${output_folder}SEDAC_${1990 + i}.asc`, {
					variable_key: variable_key, time_index: i
				});
			}
		}
		
		static async B_convertASCsToPNGs (arg0_input_folder, arg1_output_folder, arg2_options) {
			//Convert from parameters
			let input_folder = arg0_input_folder;
			let output_folder = arg1_output_folder;
			let options = (arg2_options) ? arg2_options : {};
				options.is_sedac = true; //IMPORTANT! Divides all values by /100 (i.e. GDP PPP) for options.mode = 'number'.
			if (options.is_sedac_convert_intl_dollars === undefined) options.is_sedac_convert_intl_dollars = true;
			
			//Declare local instance Variables
			let all_input_files = FileManager.getAllFiles(input_folder);
			
			//Iterate over all_input_files with SEDAC_ prefix
			for (let i = 0; i < all_input_files.length; i++) {
				let local_split_path = all_input_files[i].split("\\");
				
				let local_file_name = local_split_path[local_split_path.length - 1];
				
				if (local_file_name.startsWith("SEDAC") && local_file_name.endsWith(".asc")) {
					let local_suffix = (options.mode === "percentage") ?
						`_percentage` : `_number`;
					
					//Convert ASC to PNG accordidng to options
					GeoASC.convertToPNG(all_input_files[i], `${output_folder}/${local_file_name.replace(".asc", "")}${local_suffix}.png`, options);
				}
			}
		}
	};
}
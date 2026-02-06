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
	};
}
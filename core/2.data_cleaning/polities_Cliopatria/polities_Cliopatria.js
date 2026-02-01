global.polities_Cliopatria = class {
	static input_path_anaconda = "./core/2.data_cleaning/polities_Cliopatria/anaconda.bat";
	static input_path_equirectangular = "./core/2.data_cleaning/polities_Cliopatria/rasters_equirectangular/";
	static input_path_rasters = "./core/1.data_scraping/polities_Cliopatria/original_map_images/";
	
	//1. Normalise Robinson
	static getAllRasters () {
		//Declare local instance variables
		let all_files = File.getAllFilesSync(polities_Cliopatria.input_path_rasters);
		
		//Iterate over all_files in reverse and remove anything that does not start with a capital B/C and end in .PNG
		for (let i = all_files.length - 1; i >= 0; i--) {
			if (path.extname(all_files[i]) !== ".PNG") { //Internal guard clause if it doesn't end in .PNG
				all_files.splice(i, 1);
				continue;
			}
			
			let local_file = path.basename(all_files[i]); //B/C handler
			if (!(local_file.startsWith("B") || local_file.startsWith("C")))
				all_files.splice(i, 1);
		}
		
		//Return statement
		return all_files;
	}
	
	static async normaliseRobinson (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		options.concurrency_limit = Math.returnSafeNumber(options.concurrency_limit, 16);
		
		//Declare local instance variables
		let all_rasters = polities_Cliopatria.getAllRasters();
		
		let all_expanded_rasters = [];
		//let all_output_rasters = [];
		
		//Iterate over all_rasters and chunk them
		for (let i = 0; i < all_rasters.length; i += options.concurrency_limit) {
			let chunk = all_rasters.slice(i, i + options.concurrency_limit);
			
			let chunk_promises = chunk.map(async (local_raster) => {
				let output_raster = `${local_raster.replace(".PNG", "")}_expanded.png`;
				
				try {
					await exec(`magick "${local_raster}" -background none -splice 160x0 "${output_raster}"`);
					all_expanded_rasters.push(output_raster);
					
					console.log(`Finished expanding ${local_raster} to Standard Robinson.`);
				} catch (e) {
					console.error(e);
				}
			});
			await Promise.all(chunk_promises);
		}
		
		//Return statement
		return all_expanded_rasters;
	}
	
	//2. Convert Normalised Robinson > Equirectangular
	
	static async convertRobinsonToEquirectangular (arg0_options) { //[QUARANTINE]
		let options = arg0_options || {};
		let all_rasters = polities_Cliopatria.getAllExpandedRasters();
		let all_output_rasters = [];
		
		// Point directly to the source to bypass your /K wrapper
		const activateScript = 'C:\\Users\\htmlp\\anaconda3\\Scripts\\activate.bat';
		const condaHome = 'C:\\Users\\htmlp\\anaconda3';
		const tempBatDir = path.resolve(process.cwd(), 'temp_jobs');
		
		if (!fs.existsSync(tempBatDir)) {
			fs.mkdirSync(tempBatDir, { recursive: true });
		}
		
		console.log(`- Mutex-Locked Sequence started. Total files: ${all_rasters.length}`);
		
		for (let i = 0; i < all_rasters.length; i++) {
			const local_raster = path.resolve(all_rasters[i]);
			
			let prefix = path.basename(all_rasters[i]).startsWith('B') ? '-' : '';
			let base_name = all_rasters[i].replace('_expanded', '').split('-')[1] || i;
			let output_name = `${prefix}${base_name}`;
			let output_raster = path.resolve(polities_Cliopatria.input_path_equirectangular, output_name);
			
			let t1 = path.resolve(process.cwd(), `${output_name.replace('.png', '')}_t1.tif`);
			let t2 = path.resolve(process.cwd(), `${output_name}_t2.tif`);
			
			// The GDAL Chain
			const gdal_chain = [
				`gdal_translate -a_srs "ESRI:54030" -a_ullr -17035872.77 8542325 17035872.77 -7944003 "${local_raster}" "${t1}"`,
				`gdalwarp -t_srs "EPSG:4326" -te -180 -90 180 90 -tr 0.083333333333333 0.083333333333333 -r near -wo SOURCE_EXTRA=1000 -wo SAMPLE_STEPS=1000 "${t1}" "${t2}"`,
				`gdal_translate -of PNG "${t2}" "${output_raster}"`,
				`del "${t1}" "${t2}"`,
			].join(' && ');
			
			// The Batch File: We use the single-line cmd /C logic you confirmed works
			const batContent = [
				`@echo off`,
				`cmd /C "call "${activateScript}" "${condaHome}" && ${gdal_chain}"`,
			].join('\r\n');
			
			const batFilePath = path.join(tempBatDir, `job_${i}.bat`);
			fs.writeFileSync(batFilePath, batContent, 'utf8');
			
			console.log(`\n> EXECUTING [${i + 1}/${all_rasters.length}]: ${output_name}`);
			
			// --- MUTEX LOCK BEGIN ---
			// spawnSync blocks the entire Node.js thread until the process is GONE.
			const result = child_process.spawnSync('cmd.exe', ['/c', `"${batFilePath}"`], {
				shell: true,
				stdio: 'inherit',
			});
			
			if (result.status === 0) {
				all_output_rasters.push(output_raster);
				if (fs.existsSync(batFilePath)) fs.unlinkSync(batFilePath);
			} else {
				console.error(`\n[!] Job ${i} failed with status ${result.status}`);
			}
			
			// --- HARD WAIT ---
			// Even after the process exits, Anaconda sometimes holds file handles for 
			// a moment. We force a 1.5s wait before allowing the loop to continue.
			await new Promise((resolve) => setTimeout(resolve, 1500));
			// --- MUTEX LOCK END ---
		}
		
		console.log(`\n- Sequence finished. Total processed: ${all_output_rasters.length}`);
		return all_output_rasters;
	}
	
	static getAllExpandedRasters () {
		//Declare local instance variables
		let all_files = File.getAllFilesSync(polities_Cliopatria.input_path_rasters);
		
		//Iterate over all_files in reverse and remove anything that does not end with _expanded.png
		for (let i = all_files.length - 1; i >= 0; i--)
			if (!all_files[i].endsWith("_expanded.png"))
				all_files.splice(i, 1);
		
		//Return statement
		return all_files;
	}
};
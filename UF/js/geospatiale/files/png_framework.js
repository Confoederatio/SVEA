//Initialise functions
{
	if (!global.PNG) global.PNG = {};
	
	/**
	 * Fetches the total sum of all int values within an image.
	 * @param {String} [arg0_file_path] - The file path to the image to fetch the sum of.
	 *
	 * @returns {number}
	 */
	PNG.getImageSum = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Declare local instance variables
		let image = (typeof file_path == "string") ?
			PNG.loadNumberRasterImage(file_path) : file_path;
		let total_sum = 0;
		
		//Iterate over image
		for (let i = 0; i < image.data.length; i++)
			total_sum += image.data[i];
		
		//Return statement
		return total_sum;
	};
	
	/**
	 * loadNumberRasterImage() - Loads a number raster image into the assigned variable.
	 * @param {String} arg0_file_path
	 *
	 * @returns {width: number, height: number, data: number[]}
	 */
	PNG.loadNumberRasterImage = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Guard clause if file_path is already object
		if (typeof file_path == "object") return file_path;
		
		//Declare local instance variables
		let rawdata = fs.readFileSync(file_path);
		
		let pixel_values = [];
		let png = pngjs.PNG.sync.read(rawdata);
		
		//Iterate over all pixels
		for (let i = 0; i < png.width*png.height; i++) {
			let colour_index = i*4;
			let colour_value = Colour.decodeRGBAAsNumber([
				png.data[colour_index],
				png.data[colour_index + 1],
				png.data[colour_index + 2],
				png.data[colour_index + 3]
			]);
			
			pixel_values.push(colour_value);
		}
		
		//Return statement
		return { width: png.width, height: png.height, data: pixel_values };
	};
}
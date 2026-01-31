//Initialise functions
{
	if (!global.GDP_PPP_SEDAC) global.GDP_PPP_SEDAC = {};
	
	global.GDP_PPP_SEDAC = class {
		static folder_path = "./core/1.data_scraping/GDP_PPP_SEDAC/";
		static years = Array.getFilledDomain(1990, 2022);
		
		/**
		 * Returns a PNG array after converting GDP (PPP) 2017$100s from .geotiff to .png.
		 * 
		 * @returns {Array<Object>}
		 */
		static async convertToPNGs () {
			//Return statement
			return GeoTIFF.convertToPNGs(`${GDP_PPP_SEDAC.folder_path}/GDP_PPP_1990_2022.tif`, `${GDP_PPP_SEDAC.folder_path}/GDP_PPP`, {
				scalar: 0.01, //Make sure that GeoPNG is in $100s
				years: GDP_PPP_SEDAC.years
			});
		}
	};
}
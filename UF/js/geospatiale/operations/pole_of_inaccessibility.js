//Initialise functions
{
	if (!global.Geospatiale)
		global.Geospatiale = {};
	
	/**
	 * Finds the pole of inaccessibility for a GeoJSON feature.
	 * 
	 * @param {Object} arg0_feature
	 * @param {number} [arg1_precision=0.0001]
	 * 
	 * @returns {number[]|null} - [lng, lat]
	 */
	Geospatiale.getPoleOfInaccessibility = function (arg0_feature, arg1_precision) {
		//Convert from parameters
		let geometry = arg0_feature.geometry;
		let precision = Math.returnSafeNumber(arg1_precision, 0.0001);
		
		if (!geometry) return null; //Internal guard clause if geometry does not exist
		
		if (geometry.type === "Polygon") {
			//Return statement
			return polylabel(geometry.coordinates, precision);
		} else if (geometry.type === "MultiPolygon") {
			//For MultiPolygons, find the POI of the largest part by area
			let best_poi = null;
			let largest_area = -1;
			
			//Iterate over all shells
			geometry.coordinates.forEach((local_polygon_coords) => {
				//Create a temporary polygon to calculate area
				let poly_part = turf.polygon(local_polygon_coords);
				let poly_part_area = turf.area(poly_part);
				
				if (poly_part_area > largest_area) {
					largest_area = poly_part_area;
					best_poi = polylabel(local_polygon_coords, precision);
				}
			});
			
			//Return statement
			return best_poi;
		}
		
		//Return statement
		return null;
	};
}
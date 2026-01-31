//Initialise functions
{
	/**
	 * Returns the maximum value within an array.
	 * @alias Array.getMaximumInArray
	 * 
	 * @param {any[]} arg0_array
	 * @param {number} arg1_max_value
	 * 
	 * @returns {number}
	 */
	Array.getMaximumInArray = function (arg0_array, arg1_max_value) {
		//Convert from parameters
		let array = arg0_array;
		let max_value = arg1_max_value;
		
		//Iterate over array recursively
		for (let i = 0; i < array.length; i++)
			if (Array.isArray(array[i])) {
				max_value = Array.getMaximumInArray(array[i], max_value);
			} else {
				if (typeof array[i] == "number")
					if (max_value) {
						max_value = Math.max(array[i], max_value);
					} else {
						max_value = array[i];
					}
			}
		
		//Return statement
		return max_value;
	}
}
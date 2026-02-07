//Initialise functions
{
	/**
	 * Finds the closest number in an array to a given target value.
	 * @alias Array.getClosest
	 * 
	 * @param {number[]} arg0_array
	 * @param {number} arg1_value
	 * 
	 * @returns {number|null}
	 */
	//[QUARANTINE]
	Array.getClosest = function (arg0_array, arg1_value) {
		//Convert from parameters
		let array = arg0_array;
		let value = Math.returnSafeNumber(arg1_value);
		
		if (!array || array.length === 0)
			return null;
		
		return array.reduce((closest, current) => {
			let currentDiff = Math.abs(current - value);
			let closestDiff = Math.abs(closest - value);
			
			return (currentDiff < closestDiff) ? current : closest;
		});
	};
	
	/**
	 * Finds the closest point in a domain for a given value.
	 * @alias Array.getClosestInDomain
	 * 
	 * @param {number[]} arg0_domain_array - The array to search.
	 * @param {number} arg1_value - The value to find the closest point for.
	 *
	 * @returns {number}
	 */
	Array.getClosestInDomain = function (arg0_domain_array, arg1_value) {
		//Convert from parameters
		let input_array = arg0_domain_array.sort((a, b) => a - b);
		let value = Math.returnSafeNumber(arg1_value);
		
		//Ensure the target is within the domain
		if (value < input_array[0]) return input_array[0];
		if (value > input_array[input_array.length - 1]) return input_array[input_array.length - 1];
		
		//Return statement
		return value;
	};
	
	/**
	 * Returns the maximum value within an array.
	 * @alias Array.getMaximum
	 * 
	 * @param {any[]} arg0_array
	 * @param {number} arg1_max_value
	 * 
	 * @returns {number}
	 */
	Array.getMaximum = function (arg0_array, arg1_max_value) {
		//Convert from parameters
		let array = arg0_array;
		let max_value = arg1_max_value;
		
		//Iterate over array recursively
		for (let i = 0; i < array.length; i++)
			if (Array.isArray(array[i])) {
				max_value = Array.getMaximum(array[i], max_value);
			} else {
				if (typeof array[i] === "number")
					if (max_value) {
						max_value = Math.max(array[i], max_value);
					} else {
						max_value = array[i];
					}
			}
		
		//Return statement
		return max_value;
	};
	
	/**
	 * Returns the midpoint of an array.
	 * @alias Array.getMidpoint
	 * 
	 * @param {number[]} arg0_array
	 * 
	 * @returns {number}
	 */
	Array.getMidpoint = function (arg0_array) {
		//Convert from parameters
		let array = arg0_array;
		
		if (array.length === 0) return 0; //Internal guard clause if array has no elements
		if (array.length === 1) return array[0]; //Internal guard clause if array has only 1 element
		
		//Declare local instance variables
		let max_value = Array.getMaximum(array);
		let min_value = Array.getMinimum(array);
		
		//Return statement
		return (max_value + min_value)/2;
	};
	
	/**
	 * Returns the maximum value within an array.
	 * @alias Array.getMinimum
	 *
	 * @param {any[]} arg0_array
	 * @param {number} arg1_min_value
	 *
	 * @returns {number}
	 */
	Array.getMinimum = function (arg0_array, arg1_min_value) {
		//Convert from parameters
		let array = arg0_array;
		let min_value = arg1_min_value;
		
		//Iterate over array recursively
		for (let i = 0; i < array.length; i++)
			if (Array.isArray(array[i])) {
				min_value = Array.getMinimum(array[i], min_value);
			} else {
				if (typeof array[i] === "number")
					if (min_value) {
						min_value = Math.max(array[i], min_value);
					} else {
						min_value = array[i];
					}
			}
		
		//Return statement
		return min_value;
	};
	
	/**
	 * Applies a mathematical equation to every element of an array, recursively.
	 * 
	 * @param {any[]} arg0_array
	 * @param {string} arg1_equation - The string literal to use as an equation.<br>- 'n' represents the current array element.
	 * @returns {any[]}
	 */
	Array.operate = function (arg0_array, arg1_equation) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let equation = arg1_equation;
		
		//Guard clause if input is not array
		if (!Array.isArray(array)) return array;
		
		//Declare local instance variables
		let equation_expression = `return ${equation};`;
		let equation_function = new Function("n", equation_expression);
		
		//Return statement; recursively process each element of the array
		return array.map((element) => {
			if (Array.isArray(element)) {
				//Recursively call operateArray() if subarray is found
				return Array.operate(element, equation);
			} else {
				if (!isNaN(element)) {
					return equation_function(element);
				} else {
					//If element is not valid, return as is
					return element;
				}
			}
		});
	};
}
//Initialise functions
{
	if (!global.String) global.String = {};
	
	/**
	 * Strips markdown from a string.
	 * @alias String.prototype.stripMarkdown
	 * 
	 * @returns {string}
	 */
	String.prototype.stripMarkdown = function () {
		//Declare local instance variables
		let processed_string = this.toString();
		
		//Return statement
		return processed_string.replace(/(__)|(\*\*)/gm, "");
	};
	
	/**
	 * Strips all non-numeric characters (0-9) from a string.
	 * @alias String.prototype.stripNonNumerics
	 * 
	 * @returns {string}
	 */
	String.prototype.stripNonNumerics = function () {
		//Return statement
		return this.replace(/[^0-9]/g, "");
	};
}
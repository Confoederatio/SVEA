//Initialise functions
{
	if (!global.String) global.String = {};
	
	String.prototype.stripMarkdown = function (arg0_input_string) {
		//Convert from parameters
		let input_string = arg0_input_string;
		
		//Declare local instance variables
		let processed_string = input_string.toString();
		
		//Return statement
		return processed_string.replace(/(__)|(\*\*)/gm, "");
	};
	
	String.prototype.stripNonNumerics = function (arg0_input_string) {
		//Convert from parameters
		let input_string = arg0_input_string;
		
		//Return statement
		return input_string.replace(/[^0-9]/g, "");
	};
}
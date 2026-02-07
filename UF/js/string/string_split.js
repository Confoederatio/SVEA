//Initialise functions
{
	if (!global.String) global.String = {};
	
	String.prototype.split = function (arg0_index) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index, 200);
		
		//Return statement
		return [this.slice(0, index), this.slice(index)];
	};
	
	String.prototype.splitMarkdown = function (arg0_input_string, arg1_options) {
		//Convert from parameters
		let input_string = arg0_input_string;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let all_strings = [];
		let array_string = (!Array.isArray(input_string)) ? Array.toArray(input_string.split("\n")) : input_string;
		let local_array_string = [];
		
		//Error trapping
		let local_indices_to_remove;
		try {
			//Join all bullet point blocks together
			let new_array_string = [];
			
			if (!options.split_bullet_points) {
				let local_joined_string = [];
				let local_starting_element = -1;
				
				for (let i = 0; i < array_string.length; i++) {
					let next_element_length = 0;
					
					if (array_string[i + 1])
						next_element_length = array_string[i].length;
					
					if (array_string[i].startsWith("- ") ||
						(local_joined_string.join("\n").length + next_element_length > Math.ceil(options.maximum_characters / 1.5)) ||
						i === array_string.length - 1
					) {
						if (i === array_string.length - 1)
							local_joined_string.push(array_string[i]);
						
						//Set local_joined_string
						new_array_string.push(local_joined_string.join("\n"));
						local_indices_to_remove = [];
						
						//1st bullet point, mark as local_starting_element
						local_joined_string = [];
						local_starting_element = i;
					}
					
					local_joined_string.push(array_string[i]);
				}
			}
			
			array_string = new_array_string;
			
			if (!options.maximum_lines) {
				//Split text based on characters
				for (let i = 0; i < array_string.length; i++) {
					let added_line = false;
					let bullets = "";
					let hit_maximum = false;
					let nesting = array_string[i].getNesting();
					
					if (local_array_string.join("\n").length + array_string[i].length <= options.maximum_characters_per_array) {
						local_array_string.push(array_string[i]);
						added_line = true;
					} else {
						hit_maximum = true;
					}
					
					//Adjust bullet points if off
					if (nesting === 1)
						bullets = "- "
					if (nesting >= 1) {
						for (let x = 0; x < nesting; x++)
							bullets += " - ";
						
						array_string[i] = array_string[i].split(" - ");
						
						if (array_string[i].length > 1)
							array_string[i].shift();
						
						array_string[i] = `${bullets} ${array_string[i].join(" - ")}`;
					}
					
					if (i !== 0 || array_string.length === 1)
						if ((i === array_string.length - 1 &&
							//Check to see that string is not empty
							local_array_string.join("\n").length > 0
						) || hit_maximum) {
							//Push to all_strings
							all_strings.push(local_array_string.join("\n"));
							local_array_string = [];
							
							//Maximum safeguard to prevent max call stack size
							if (hit_maximum) i--; //Potentially leads to a fatal crash
						}
				}
			} else {
				//Split embeds based on lines
				for (let i = 0; i < array_string.length; i++) {
					local_array_string.push(array_string[i]);
					
					if (i !== 0 || array_string.length === 1)
						if (i % options.maximum_lines === 0 || i === array_string.length - 1) {
							//Push to all_strings
							all_strings.push(local_array_string.join("\n"));
							local_array_string = [];
						}
				}
			}
			
			//Return statement
			return all_strings;
		} catch (e) {}
	};
	
	String.prototype.split = function (arg0_length) {
		//Convert from parameters
		let length = Math.returnSafeNumber(arg0_length, 200);
		
		//Declare local instance variables
		let current_string = "";
		let string_array = [];
		
		//Process string
		for (let i = 0; i < this.length; i++) {
			current_string += this[i];
			
			if ((i % length === 0 || i === this.length - 1) && i !== 0) {
				string_array.push(current_string);
				current_string = "";
			}
		}
		
		//Return statement
		return string_array;
	};
	
	String.prototype.truncate = function (arg0_length, arg1_do_not_show_dots) {
		//Convert from parameters
		let number = (arg0_length) ? arg0_length : 80;
		let do_not_show_dots = arg1_do_not_show_dots;
		
		//Return statement
		if (this.length > number) {
			let substring = this.substring(0, number);
			
			return (!do_not_show_dots) ? substring + " ..." : substring;
		} else {
			return this;
		}
	};
}
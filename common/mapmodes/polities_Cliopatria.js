config.mapmodes.polities_Cliopatria = {
	name: "Cliopatria (Polities)",
	icon: "flag",
	
	special_function: function (arg0_mapmode_obj) {
		if (!main.user._mapmodes.polities_Cliopatria_UI) 
			main.user._mapmodes.polities_Cliopatria_UI = new polities_Cliopatria_UI();
		let class_obj = main.user._mapmodes.polities_Cliopatria_UI;
			class_obj.draw(main.date);
		
		//Return statement
		return class_obj.geometries;
	}
};
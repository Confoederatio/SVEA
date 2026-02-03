//Import modules
global.child_process = require("child_process");
global.electron = require("electron");
global.geotiff = require("geotiff")
global.fs = require("fs");
global.node_fs_promises = require("node:fs/promises");
global.path = require("path");
global.pngjs = require("pngjs")
global.polylabel = require("polylabel");
global.util = require("util");

global.exec = util.promisify(require("child_process").exec);

//File path constants
h1 = "./histmap/1.data_scraping/";
h2 = "./histmap/2.data_cleaning/";
h3 = "./histmap/3.data_merging/";
h4 = "./histmap/4.data_processing/";
h5 = "./histmap/5.data_post_processing/";
h6 = "./histmap/6.data_visualisation/";

//Initialise functions
{
  global.initialiseGlobal = function () {
    //KEEP AT TOP! Make sure file paths exist
    {
      if (!fs.existsSync("./saves/")) fs.mkdirSync("./saves/");
    }
    
    global.scene = new ve.Scene({
      map_component: new ve.Map(undefined, {
        base_layer_options: {
          urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          subdomains: ["a","b","c","d"],
          repeatWorld: false
        }
      })
    });
      global.map = global.scene.map_component.map;
    
    //Declare local instance variables
    global.main = {
      date: Date.getCurrentDate(),
      interfaces: {
        //Topbar
        date_ui: new UI_DateMenu(),
        
        //Scene Interfaces
        mapmodes: new UI_Mapmodes()
      },
      layers: {
        entity_layer: new maptalks.VectorLayer("entity_layer", [], {
          hitDetect: true,
          interactive: true,
          zIndex: 1
        })
      },
      map: map,
      user: {}
    };
    
    //1.1. Append all layers to map
    Object.iterate(main.layers, (local_key, local_value) => local_value.addTo(map));
    map.addLayer(new maptalks.TileLayer("gmaps", {
      opacity: 0.3,
      urlTemplate: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      subdomains: ["a","b","c","d"],
      repeatWorld: false
    }));
    
    //1.2. Add event handlers to map
    //mousedown
    let mousedown_dictionary = ["left_click", "middle_click", "right_click"];
    map.on("mousedown", (e) => {
      for (let i = 0; i < mousedown_dictionary.length; i++)
        delete HTML[mousedown_dictionary[i]];
      HTML[mousedown_dictionary[e.domEvent.which - 1]] = true;
    });
    
    //mouseup
    map.on("mouseup", (e) => {
      for (let i = 0; i < mousedown_dictionary.length; i++)
        delete HTML[mousedown_dictionary[i]];
    });
    
    //1.3. Initialise Mapmodes
    main.mapmodes = main.interfaces.mapmodes;
  };

  function trackPerformance () {
    //Declare local instance variables
    let { ipcRenderer } = require("electron");
		
		let frame_count = 0;
		let last_time = performance.now();

    function trackFPS() {
      frame_count++;
			let now = performance.now();

      //Report back to the main process once per second
      if (now - last_time >= 1000) {
        ipcRenderer.send('update-fps', frame_count);
        frame_count = 0;
        last_time = now;
      }

      //Keep the loop going
      requestAnimationFrame(trackFPS);
    }

    //Start the counter
    trackFPS();
  }
}

//Startup process
{
  ve.start({
    //Accepts wildcards (*), exclusionary patterns (!), and folders/file paths
    load_files: [
      "!core/startup.js",
      "core",
      "histmap",
      "livemap"
    ],
    special_function: function () {
      try {
        initialiseGlobal();
      } catch (e) {
        console.error(e);
      }
    }
  });
  
  trackPerformance();
}

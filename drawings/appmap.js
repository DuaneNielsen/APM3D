/**
  @author David Piegza

  Implements a simple graph drawing with force-directed placement in 2D and 3D.

  It uses the force-directed-layout implemented in:
  https://github.com/davidpiegza/Graph-Visualization/blob/master/layouts/force-directed-layout.js

  Drawing is done with Three.js: http://github.com/mrdoob/three.js

  To use this drawing, include the graph-min.js file and create a SimpleGraph object:

  <!DOCTYPE html>
  <html>
    <head>
      <title>Graph Visualization</title>
      <script type="text/javascript" src="path/to/graph-min.js"></script>
    </head>
    <body onload="new Drawing.SimpleGraph({layout: '3d', showStats: true, showInfo: true})">
    </bod>
  </html>

  Parameters:
  options = {
    layout: "2d" or "3d"

    showStats: <bool>, displays FPS box
    showInfo: <bool>, displays some info on the graph and layout
              The info box is created as <div id="graph-info">, it must be
              styled and positioned with CSS.


    selection: <bool>, enables selection of nodes on mouse over (it displays some info
               when the showInfo flag is set)


    limit: <int>, maximum number of nodes

    numNodes: <int> - sets the number of nodes to create.
    numEdges: <int> - sets the maximum number of edges for a node. A node will have
              1 to numEdges edges, this is set randomly.
  }


  Feel free to contribute a new drawing!

 */
 
 /* global TWEEN */
 /* global THREE */
 /* global Graph */
 /* global Stats */
 /* global Node */

var Drawing = Drawing || {};

Drawing.Appmap = function(options) {
  var options = options || {};

  this.layout = options.layout || "2d";
  this.layout_options = options.graphLayout || {};
  this.show_stats = options.showStats || false;
  this.show_info = options.showInfo || false;
  this.show_labels = options.showLabels || false;
  this.selection = options.selection || false;
  this.limit = options.limit || 10;
  this.nodes_count = options.numNodes || 20;
  this.edges_count = options.numEdges || 10;

  var camera, controls, scene, renderer, interaction, object_selection;
  var lookupTableOfNodeTypes;
  var particleSystem;
  var g1, g2;
  //var graphWalker, tweenChain, currentPosition, 
  var transactionPath = [ {node: 0, time: 1000, type: "BT"        }, 
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 2, time: 4000, type: "Database " },
                          {node: 2, time: 300,  type: "Database " }, 
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 3, time: 200,  type: "WebServiceClient"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},                          
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 3, time: 200,  type: "WebServiceClient"},
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 0, time: 200,  type: "BT"       }
                          ];
  
  var transactionPath2 = [ {node: 0, time: 1000, type: "BT"        }, 
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 2, time: 2000, type: "Database " },
                          {node: 2, time: 300,  type: "Database " }, 
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 6, time: 200,  type: "Database" },
                          {node: 6, time: 200,  type: "Database" },
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 3, time: 200,  type: "WebServiceClient"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 5, time: 200,  type: "Database"},                          
                          {node: 5, time: 200,  type: "Database"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 5, time: 200,  type: "Database"},
                          {node: 5, time: 200,  type: "Database"},                          
                          {node: 4, time: 200,  type: "WebServiceServer"},
                          {node: 3, time: 200,  type: "WebServiceClient"},
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 1, time: 200,  type: "AppServer" },
                          {node: 0, time: 200,  type: "BT"       }
                          ];
  
  
  var stats;
  var info_text = {};
  var graph = new Graph({limit: options.limit});

  var meshes = {};

  var geometries = [];

  var that=this;

  var pump;

  var dae, skin;

  load();
  //init();
  //createGraph();
  //animate();

  //loads COLLADA files
  function PinaCollada(modelname, scale, manager) {
    var loader = new THREE.ColladaLoader(manager);
    var localObject;
    loader.options.convertUpAxis = true;
    loader.load( './models/'+modelname+'.dae', function onLoad( collada ) {
        localObject = collada.scene;
        localObject.scale.x = localObject.scale.y = localObject.scale.z = scale;
        localObject.updateMatrix();
    }, function onProgress( collada ) {}, function onError(collada) { console.log("error loading") } );
    return localObject;
  }

  function load() {

    var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {

		  console.log( item, loaded, total );

		};

    // Static Loads
    meshes['cube'] = new THREE.CubeGeometry( 200, 200, 200 );
    meshes['cylinder'] = new THREE.CylinderGeometry( 25, 75, 100, 40, 5 )
    meshes['sphere'] = new THREE.SphereGeometry(50,12,32,32);
    pump = new PinaCollada('pump',1.0);
    meshes['pump'] = new PinaCollada('pump',1.0,manager);

    if (typeof (pump) == 'undefined') { console.log("pump load failed");}


			var loader = new THREE.ColladaLoader(manager);
			loader.options.convertUpAxis = true;
			loader.load( './models/db.dae', function ( collada ) {

				dae = collada.scene;
				skin = collada.skins[ 0 ];

				dae.scale.x = dae.scale.y = dae.scale.z = 50.0;
				dae.rotateOnAxis(new THREE.Vector3(1,0,0),1.5);
				dae.updateMatrix();


        buildLookupTableOfNodeTypes();
				init();
        createGraph();
        animate();

			} );
			
			// dae = new THREE.CubeGeometry( 200, 200, 200 );

    
  }

  function init() {
    // Three.js initialization
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 1000000);
    camera.position.z = 5000;

    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 5.2;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    controls.addEventListener('change', render);

    scene = new THREE.Scene();


    // Create node selection, if set
    if(that.selection) {
      object_selection = new THREE.ObjectSelection({
        domElement: renderer.domElement,
        selected: function(obj) {
          // display info
          if(obj != null) {
            info_text.select = "Object " + obj.id;
          } else {
            delete info_text.select;
          }
        },
        clicked: function(obj) {
        }
      });
    }

    document.body.appendChild( renderer.domElement );

    // Stats.js
    if(that.show_stats) {
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      document.body.appendChild( stats.domElement );
    }

    // Create info box
    if(that.show_info) {
      var info = document.createElement("div");
      var id_attr = document.createAttribute("id");
      id_attr.nodeValue = "graph-info";
      info.setAttributeNode(id_attr);
      document.body.appendChild( info );
    }
    
    
  }

  function putNode(node, title, options) {
    node.data.title = title;
    graph.addNode(node);
    drawNode(node, options);
  }
  
  function putEdge(from, to) {
    graph.addEdge(from,to);
    drawEdge(from,to);
  }

  function inNodeList(nodeID) {
    return graph.getNode(nodeID) != undefined;
  }
  
  function buildLookupTableOfNodeTypes() {
  
  var database = {'object3D':dae};
  
  lookupTableOfNodeTypes = {
    'Database':database
    //'Database':{'geometry': meshes['cube']}
  };
  
  }
  
  function lookupOptionsForType(type) {
    var options = lookupTableOfNodeTypes[type];
    if ( options != undefined )
      return options;
    else
     return {'geometry': meshes['cube']};
  }
  
  function parseTransactionPath(transactionPath) {
    
    // var nodelist = [];
    var edgelist = [];
    var prev_node_id = transactionPath[0].node;
    
    for ( var i = 0; i < transactionPath.length; i++ ) {
      
      var curr_node_id = transactionPath[i].node;
      
      if ( ! inNodeList(curr_node_id ) ) {
          var newNode = new Node(curr_node_id);
          if (curr_node_id == 0) {
            newNode.data['forceFunc'] = function (force) {return force * 5};
          }
          putNode(newNode, "title", lookupOptionsForType(transactionPath[i].type));
      }
    
      if ( curr_node_id != prev_node_id ) {

        if ( graph.addEdge(graph.getNode(prev_node_id), graph.getNode(curr_node_id)) ) {
          drawEdge(graph.getNode(prev_node_id), graph.getNode(curr_node_id));
        }
      }
      
      prev_node_id = curr_node_id;
      
    }
    
  }

  /**
   *  Creates a graph with random nodes and edges.
   *  Number of nodes and edges can be set with
   *  numNodes and numEdges.
   */
  function createGraph() {

    parseTransactionPath(transactionPath);
    parseTransactionPath(transactionPath2);

    that.layout_options.width = that.layout_options.width || 2000;
    that.layout_options.height = that.layout_options.height || 2000;
    that.layout_options.iterations = that.layout_options.iterations || 1000;
    //that.layout_options.iterations = 10;
    that.layout_options.layout = that.layout_options.layout || that.layout;
    graph.layout = new Layout.ForceDirected(graph, that.layout_options);
    graph.layout.init();
    info_text.nodes = "Nodes " + graph.nodes.length;
    info_text.edges = "Edges " + graph.edges.length;
    
    g1 = new GraphWalker({color:0xffff00});
    //g2 = new GraphWalker({color:0x00ff00});
    
  }


  function GraphWalker(options) {
    var that = this;
    this.color = options['color'] || 0x00ff00;
    this.geo = new THREE.SphereGeometry(50,12,32,32);
    this.material = new THREE.MeshBasicMaterial( {color: this.color} );
    this.graphWalker = new THREE.Mesh(this.geo,this.material);
    this.currentPosition;
    this.prev_pos;
    this.tweenChain;
    var node = graph.nodes[0];
    if ( node != undefined ) {
      this.graphWalker.position.set( node.data.draw_object.position.x, node.data.draw_object.position.y, node.data.draw_object.position.z);
    }
    
    this.num_particles = options['num_particles'] || 60;
    this.cur_particle = 0;
    this.particle_per_redraw = 4; // how many particles in a redraw
    var pMaterial = new THREE.ParticleBasicMaterial({
              color: this.color,
              opacity: 0.5,
              size: 500,
              map: THREE.ImageUtils.loadTexture("models/particle.png"),
              blending: THREE.AdditiveBlending,
              transparent: true,
              depthWrite: false
            });    
    this.particle_list = new THREE.Geometry();
    for ( var i = 0; i < this.num_particles; i++) {
      this.particle_list.vertices.push(new THREE.Vector3().set(10000,10000,10000));
    }
    var  particleSystem = new THREE.ParticleSystem(this.particle_list, pMaterial );
    particleSystem.sortParticles = true;
    scene.add(particleSystem);

    
    this.tweenUpdate = function () {
      
      function updateParticles() {
        
        if (that.prev_pos != undefined) {
          var trailVector = that.prev_pos.clone().sub(that.graphWalker.position);
          for (var p = 1; p <= that.particle_per_redraw; p++) {
            var scalar = p/that.particle_per_redraw;
            var particleVector = trailVector.clone().multiplyScalar(scalar);
            var trailPos1 = that.graphWalker.position.clone().add(particleVector);
            that.particle_list.vertices[that.cur_particle%that.num_particles].copy(trailPos1);
            that.cur_particle ++;
          }
        that.particle_list.verticesNeedUpdate = true;
        }
        that.prev_pos = that.graphWalker.position.clone();
      }
      
      that.graphWalker.position.set(that.currentPosition.x,that.currentPosition.y,that.currentPosition.z);
      updateParticles();
    }
    
  }
  
  GraphWalker.prototype = {
    buildTweenChain : function (transactionPath) {
        this.currentPosition = { x: graph.nodes[transactionPath[0].node].position.x, y: graph.nodes[transactionPath[0].node].position.y, z: graph.nodes[transactionPath[0].node].position.z };
        this.tweenChain = new TWEEN.Tween(this.currentPosition).to(graph.nodes[transactionPath[1].node].position, transactionPath[1].time);
        this.tweenChain.delay(transactionPath[0].time);
        this.tweenChain.onUpdate(this.tweenUpdate);
        var currentTween = this.tweenChain;
        var nextTween;
        
        for ( var i = 2; i < transactionPath.length; i++ ) {
          nextTween = new TWEEN.Tween(this.currentPosition).to(graph.nodes[transactionPath[i].node].position, transactionPath[i].time);  
          nextTween.onUpdate( this.tweenUpdate);
          currentTween.chain(nextTween);
          currentTween = nextTween;
        }
        
        // set to loop
        nextTween.chain(this.tweenChain);
      },
      



     renderGraphWalker: function (transactionPath) {
      var startNode = graph.nodes[transactionPath[0].node];
        if(graph.layout.finished) {
          if ( this.tweenChain == undefined ) {
            this.buildTweenChain(transactionPath);
            scene.add(this.graphWalker);
            this.tweenChain.start();
          }
        }
        else {
          this.graphWalker.position.set(startNode.position.x,startNode.position.y,startNode.position.z);
        }
      }

  }


  

  /**
   *  Create a node object and add it to the scene.
   */
  function drawNode(node, opts) {
    var opts = opts ||  {};
    var geometry = opts['geometry'] || meshes['cube'];
    var material = new THREE.MeshBasicMaterial( {  color: Math.random() * 0xffffff, opacity: 0.5 } );
    var draw_object;
    if ( opts['object3D'] != undefined )  draw_object =  opts['object3D'].clone(); else draw_object = new THREE.Mesh( geometry , material);

    if(that.show_labels) {
      if(node.data.title != undefined) {
        var label_object = new THREE.Label(node.data.title);
      } else {
        var label_object = new THREE.Label(node.id);
      }
      node.data.label_object = label_object;
      scene.add( node.data.label_object );
    }

    var area = 5000;
    draw_object.position.x = Math.floor(Math.random() * (area + area + 1) - area);
    draw_object.position.y = Math.floor(Math.random() * (area + area + 1) - area);

    if(that.layout === "3d") {
      draw_object.position.z = Math.floor(Math.random() * (area + area + 1) - area);
    }

    draw_object.id = node.id;
    node.data.draw_object = draw_object;
    node.position = draw_object.position;
    scene.add( node.data.draw_object );
  }


  /**
   *  Create an edge object (line) and add it to the scene.
   */
  function drawEdge(source, target) {
      material = new THREE.LineBasicMaterial({ color: 0x99ffcc, opacity: 0.9, linewidth: 1.0 });

      var tmp_geo = new THREE.Geometry();
      tmp_geo.vertices.push(source.data.draw_object.position);
      tmp_geo.vertices.push(target.data.draw_object.position);

      line = new THREE.Line( tmp_geo, material, THREE.LinePieces );
      line.scale.x = line.scale.y = line.scale.z = 1;
      line.originalScale = 1;

      geometries.push(tmp_geo);

      scene.add( line );
  }


  function animate() {
    requestAnimationFrame( animate );
    controls.update();
    TWEEN.update();
    render();
    if(that.show_info) {
      printInfo();
    }
  }


  function render() {
    // Generate layout if not finished
    if(!graph.layout.finished) {
      info_text.calc = "<span style='color: red'>Calculating layout...</span>";
      graph.layout.generate();
    } else {
      info_text.calc = "";
    }

    g1.renderGraphWalker(transactionPath);
    //g2.renderGraphWalker(transactionPath2);

    // Update position of lines (edges)
    for(var i=0; i<geometries.length; i++) {
      geometries[i].verticesNeedUpdate = true;
    }


    // Show labels if set
    // It creates the labels when this options is set during visualization
    if(that.show_labels) {
      var length = graph.nodes.length;
      for(var i=0; i<length; i++) {
        var node = graph.nodes[i];
        if(node.data.label_object != undefined) {
          node.data.label_object.position.x = node.data.draw_object.position.x;
          node.data.label_object.position.y = node.data.draw_object.position.y - 100;
          node.data.label_object.position.z = node.data.draw_object.position.z;
          node.data.label_object.lookAt(camera.position);
        } else {
          if(node.data.title != undefined) {
            var label_object = new THREE.Label(node.data.title + " " + node.data.draw_object.position.x, node.data.draw_object);
          } else {
            var label_object = new THREE.Label(node.id, node.data.draw_object);
          }
          //node.data.label_object = label_object;
          scene.add( node.data.label_object );
        }
      }
    } else {
      var length = graph.nodes.length;
      for(var i=0; i<length; i++) {
        var node = graph.nodes[i];
        if(node.data.label_object != undefined) {
          scene.remove( node.data.label_object );
          node.data.label_object = undefined;
        }
      }
    }

    // render selection
    if(that.selection) {
      object_selection.render(scene, camera);
    }

    // update stats
    if(that.show_stats) {
      stats.update();
    }

    // render scene
    renderer.render( scene, camera );
  }

  /**
   *  Prints info from the attribute info_text.
   */
  function printInfo(text) {
    var str = '';
    for(var index in info_text) {
      if(str != '' && info_text[index] != '') {
        str += " - ";
      }
      str += info_text[index];
    }
    document.getElementById("graph-info").innerHTML = str;
  }

  // Generate random number
  function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }

  // Stop layout calculation
  this.stop_calculating = function() {
    graph.layout.stop_calculating();
  }
  
}

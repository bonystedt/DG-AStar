
var renderer;
var camera;     // Main camera 
var path = new PathHandler();
var SCREEN_DIRTY = false;
var WIDTH = 0, HEIGHT = 0;
var FPS = 60; // Can only be changed at start of game 
var time_step = (1000/FPS)/1000;

// Beginning initialization 
function init(){
  // Window size 
  WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

  /** Setup renderer */
  // Create Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  // Set the background color of the scene.
  renderer.setClearColor(new THREE.Color(0x353539));
  renderer.autoClear = false; // Tell renderer not to auto clear

  document.body.appendChild(renderer.domElement);

  // Setup program 
  path.init();
  initIO();
  // Make the camera 
  camera = new THREE.OrthographicCamera( 0, WIDTH, 0, HEIGHT, 1, -1);  

  SCREEN_DIRTY = true;
}

/** Main Loop **/
function gameLoop(){
  // Update 
  path.update();
  updateButtons();

  // Draw 
  redraw();
}

/** Redraw the display **/ 
function redraw() 
{
  // Render
  if (SCREEN_DIRTY){
    renderer.clear();
    path.draw();

    SCREEN_DIRTY = false;
  }
}

// Setup 
init();

//enter game loop
setInterval(gameLoop, 1000 / FPS);



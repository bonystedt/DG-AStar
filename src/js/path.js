
/** Main Handler for all pathfinding **/
function PathHandler(){
	// Used to draw all UI to screen 
	this.ui = new UIHandler();
	// Used to draw grid 
	this.scene = new THREE.Scene();

	// Grid 
	this.gridDrawLoc = {x:190,y:40};
	this.gridSpacing = 1;
	this.gridWidth = 50;
	this.gridHeight = 50;
	this.grid = [];

	// Start & Goal 
	this.start = {i:0,j:0};
	this.goal = {i:0,j:0};

	// Brush settings 
	this.brushType = BrushType.Obsticle;
	this.bLocValid = false;
	this.bLoc = {i:0,j:0};

	// Pathfinding 
	this.pathMade = false;
}

/** Brush Types */
var BrushType = { 
  "Normal": 0,
  "Obsticle": 1, 
  "StartLoc": 2, 
  "GoalLoc": 3
};

/** Set up pathhandler **/
PathHandler.prototype.init = function(){
	this.ui.init();
	this.makeGrid();
}

/** Update Pathfinding state **/
PathHandler.prototype.update = function(){
	this.ui.update();

	// Get mouse grid location 
	this.getGridLocFromMouse();

	// Draw on grid 
	if (this.bLocValid && mouse.left_down){
		// Clear the path if it has been created 
		if (this.pathMade){
			this.resetGridPath();
			this.pathMade = false;
		}

		// Turn block into a normal block if not start or goal
		if (this.brushType == BrushType.Normal){
			if (!this.isStartOrGoal(this.bLoc.i, this.bLoc.j)){
				this.grid[this.bLoc.i][this.bLoc.j].setColor(COLOR_NORMAL_NODE);
				this.grid[this.bLoc.i][this.bLoc.j].isObsticle = false;
			}
		}
		// Turn block into obsticle if not start or goal
		else if (this.brushType == BrushType.Obsticle){
			if (!this.isStartOrGoal(this.bLoc.i, this.bLoc.j)){
				this.grid[this.bLoc.i][this.bLoc.j].setColor(COLOR_OBSTICLE);
				this.grid[this.bLoc.i][this.bLoc.j].isObsticle = true;
			}
		}
		// Move start location if not goal location 
		else if (this.brushType == BrushType.StartLoc){
			if (!(this.goal.i == this.bLoc.i && this.goal.j == this.bLoc.j)){
				this.start.i = this.bLoc.i;
				this.start.j = this.bLoc.j;
  			this.grid[this.start.i][this.start.j].setColor(COLOR_START_NODE);
			}
		}
		// Move goal location if not start location 
		else if (this.brushType == BrushType.GoalLoc){
			if (!(this.start.i == this.bLoc.i && this.start.j == this.bLoc.j)){
				this.goal.i = this.bLoc.i;
				this.goal.j = this.bLoc.j;
  			this.grid[this.goal.i][this.goal.j].setColor(COLOR_GOAL_NODE);
			}
		}

		SCREEN_DIRTY = true;
	}
}

/** Draw Pathfinding to screen **/
PathHandler.prototype.draw = function(){
	// Draw grid to screen 
	renderer.render(this.scene, camera);
	// Draw UI to screen 
	this.ui.draw();
}

/** ================================= **/
/**     Grid Management               **/
/** ================================= **/

/** Make a new grid **/
PathHandler.prototype.makeGrid = function(){
	// Make the grid array and set properties for each node 
  this.grid = [this.gridWidth];
  for (var i = 0; i < this.gridWidth; i++){
    this.grid[i] = [this.gridHeight];
    for (var j = 0; j < this.gridHeight; j++){
      this.grid[i][j] = new Node();
      this.grid[i][j].setColor(COLOR_NORMAL_NODE);
      this.grid[i][j].mesh.position.set(
      	this.gridDrawLoc.x + ((NODE_SIZE+ this.gridSpacing) * i),
      	this.gridDrawLoc.y + ((NODE_SIZE + this.gridSpacing) * j), 0);
      this.scene.add(this.grid[i][j].mesh);
    }
  }

  // Set start and goal location 
  this.start.i = 0;
  this.start.j = 0;
  this.goal.i = this.gridWidth - 1;
  this.goal.j = this.gridHeight - 1;

  // Set start and goal colors 
  this.grid[this.start.i][this.start.j].setColor(COLOR_START_NODE);
  this.grid[this.goal.i][this.goal.j].setColor(COLOR_GOAL_NODE);
}

/** Reset grid to blank **/ 
PathHandler.prototype.resetGridFully = function(){
  for (var i = 0; i < this.gridWidth; i++){
    for (var j = 0; j < this.gridHeight; j++){
      this.grid[i][j].setColor(COLOR_NORMAL_NODE);
      this.grid[i][j].isObsticle = false;
      this.grid[i][j].parent = -1;
    }
  }

  // Set start and goal location 
  this.start.i = 0;
  this.start.j = 0;
  this.goal.i = this.gridWidth - 1;
  this.goal.j = this.gridHeight - 1;

  // Set start and goal colors 
  this.grid[this.start.i][this.start.j].setColor(COLOR_START_NODE);
  this.grid[this.goal.i][this.goal.j].setColor(COLOR_GOAL_NODE);
}

/** Remove Pathfinding from grid **/ 
PathHandler.prototype.resetGridPath = function(){
  for (var i = 0; i < this.gridWidth; i++){
    for (var j = 0; j < this.gridHeight; j++){
			if (!this.isStartOrGoal(i,j) && !this.grid[i][j].isObsticle){
	      this.grid[i][j].setColor(COLOR_NORMAL_NODE);
			}
	    
	    this.grid[i][j].parent = -1;
    }
  }
}

/** Convert the mouse location into a grid location **/
PathHandler.prototype.getGridLocFromMouse = function(){
	// Setup variables 
	var x = mouse.x - this.gridDrawLoc.x;
	var y = mouse.y - this.gridDrawLoc.y;
	var spaceSize = NODE_SIZE + this.gridSpacing;

	// Convert mouse loc to grid locations 
	x = Math.floor(x/spaceSize);
	y = Math.floor(y/spaceSize);

	// Check if location is valid 
	if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight)
		this.bLocValid = false;
	else this.bLocValid = true;

	this.bLoc.i = x;
	this.bLoc.j = y;
}

/** Check if sent location is start loc or goal loc **/
PathHandler.prototype.isStartOrGoal = function(i,j){
	if ((i == this.goal.i && j == this.goal.j) ||
		(i == this.start.i && j == this.start.j))
		return true;
	return false;
}

/** Find the path through the grid **/
PathHandler.prototype.findPath = function(){
	// TODO 
}


/** ================================= **/
/**     Pathfinding                   **/
/** ================================= **/
var COLOR_START_NODE = 0xff0000;
var COLOR_GOAL_NODE = 0x00ff00;
var COLOR_NORMAL_NODE = 0x9c9c9c;
var COLOR_OBSTICLE = 0x6a6a6a;
var COLOR_CLOSED_NODE = 0x000000;
var COLOR_OPEN_NODE = 0xed34e2;

var NODE_SIZE = 5;

/** Node to be used in grid **/
function Node(){
	// Set true to make impassible 
	this.isObsticle = false;
	// Node mesh for drawing 
	this.mesh = makeSprite(NODE_SIZE,NODE_SIZE,'res/node.png');
	// Parent node to this one 
	this.parent = -1;
}

/** Shortcut to set nodes color easily **/
Node.prototype.setColor = function(color){
	this.mesh.material.color.setHex(color);
}
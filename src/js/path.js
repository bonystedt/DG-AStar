
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
	this.brushType = BrushType.Obstacle;
	this.bLocValid = false;
	this.bLoc = {i:0,j:0};

	// Pathfinding 
	this.pathMade = false;
}

/** Brush Types */
var BrushType = { 
  "Normal": 0,
  "Obstacle": 1, 
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

	// Update brush if mouse is pressed 
	if (mouse.left_down){
		// Get mouse grid location 
		this.getGridLocFromLoc(mouse);

		// Draw on grid if mouse location is valid 
		if (this.bLocValid){
			// Clear the path if it has been created 
			if (this.pathMade){
				this.resetGridPath();
				this.pathMade = false;
			}
	 
	 		// Set current block location
			this.setBlockAtBrushLoc();
	 		// Interpolate the brush to make smooth lines if brush is moving fast 
			this.interpolateBrush(mouse.oldx, mouse.oldy, mouse.x, mouse.y);

			SCREEN_DIRTY = true;
		}
	}
}

/** Draw Pathfinding to screen **/
PathHandler.prototype.draw = function(){
	// Draw grid to screen 
	renderer.render(this.scene, camera);
	// Draw UI to screen 
	this.ui.draw();
}

/** Interpolate brush between two points **/
PathHandler.prototype.interpolateBrush = function(x,y,x2,y2){

  if (distance(x, y, x2, y2) > NODE_SIZE)
  {
    // Get the angle and the sides of the triangle
    var angle = Math.atan2((y - y2), (x - x2));
    var dx = Math.cos(angle) * NODE_SIZE;
    var dy = Math.sin(angle) * NODE_SIZE;
    // Set location values to the starting point
    var nextx = x2;
    var nexty = y2;
    var cont = true;

    while (cont)
    {
      // Shift next location by slope
      nextx += dx;
      nexty += dy;

      // Check if next location has moved past target
      // and if it has, then end loop. 
      if ((x < x2 && nextx < x) || 
          (x > x2 && nextx > x) || 
          (y < y2 && nexty < y) ||
          (y > y2 && nexty > y)){
        cont = false;
        break;
      }

      // Get next location 
			this.getGridLocFromLoc({x:nextx, y:nexty});
			if (this.bLocValid){
				this.setBlockAtBrushLoc();
			}
    }
  }
}

/** Set the node at the current brush location **/
PathHandler.prototype.setBlockAtBrushLoc = function(){
	// Turn block into a normal block if not start or goal
	if (this.brushType == BrushType.Normal){
		if (!this.isStartOrGoal(this.bLoc.i, this.bLoc.j)){
			this.grid[this.bLoc.i][this.bLoc.j].setColor(COLOR_NORMAL_NODE);
			this.grid[this.bLoc.i][this.bLoc.j].isObstacle = false;
		}
	}
	// Turn block into Obstacle if not start or goal
	else if (this.brushType == BrushType.Obstacle){
		if (!this.isStartOrGoal(this.bLoc.i, this.bLoc.j)){
			this.grid[this.bLoc.i][this.bLoc.j].setColor(COLOR_OBSTACLE_NODE);
			this.grid[this.bLoc.i][this.bLoc.j].isObstacle = true;
		}
	}
	// Move start location if not goal location 
	else if (this.brushType == BrushType.StartLoc){
		if (!(this.goal.i == this.bLoc.i && this.goal.j == this.bLoc.j)){
			this.grid[this.start.i][this.start.j].setColor(COLOR_NORMAL_NODE);
			this.start.i = this.bLoc.i;
			this.start.j = this.bLoc.j;
			this.grid[this.start.i][this.start.j].setColor(COLOR_START_NODE);
			this.grid[this.start.i][this.start.j].isObstacle = false;
		}
	}
	// Move goal location if not start location 
	else if (this.brushType == BrushType.GoalLoc){
		if (!(this.start.i == this.bLoc.i && this.start.j == this.bLoc.j)){
			this.grid[this.goal.i][this.goal.j].setColor(COLOR_NORMAL_NODE);
			this.goal.i = this.bLoc.i;
			this.goal.j = this.bLoc.j;
			this.grid[this.goal.i][this.goal.j].setColor(COLOR_GOAL_NODE);
			this.grid[this.goal.i][this.goal.j].isObstacle = false;
		}
	}
}

/** Get the distance between the two points **/
function distance(x,y,x2,y2){
	var dx = x2 - x;
	var dy = y2 - y;
	return Math.sqrt((dx * dx) + (dy * dy))
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
      this.grid[i][j] = new Node(i,j); 
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
      this.grid[i][j].isObstacle = false;
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
			if (!this.isStartOrGoal(i,j) && !this.grid[i][j].isObstacle){
	      this.grid[i][j].setColor(COLOR_NORMAL_NODE);
			}
	    
	    this.grid[i][j].parent = -1;
    }
  }
}

/** Convert the location into a grid location **/
PathHandler.prototype.getGridLocFromLoc = function(loc){
	// Setup variables 
	var x = loc.x - this.gridDrawLoc.x;
	var y = loc.y - this.gridDrawLoc.y;
	var spaceSize = NODE_SIZE + this.gridSpacing;

	// Convert loc to grid locations 
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

/** Check if the sent location is on grid **/
PathHandler.prototype.isOnGrid = function(i,j){
	if (i < 0 || i > this.gridWidth - 1 || 
		j < 0 || j > this.gridHeight - 1)
		return false;
	return true;
}

/** ================================= **/
/**     Pathfinding                   **/
/** ================================= **/
var COLOR_START_NODE = 0xff0000;
var COLOR_GOAL_NODE = 0x00ff00;
var COLOR_NORMAL_NODE = 0x9c9c9c;
var COLOR_OBSTACLE_NODE = 0x6a6a6a;
var COLOR_CLOSED_NODE = 0x000000;
var COLOR_OPEN_NODE = 0xed34e2;
var COLOR_FOUNDPATH_NODE = 0x0000ff;

var NODE_SIZE = 5;

// A* Movement costs 
var MOVE_COST = 1;
var MOVE_COST_DIAG = 2;

/** Node to be used in grid **/
function Node(i,j){
  this.i = i;
  this.j = j;
  // Our G score value 
  this.G = 0;
  // Our heuristic value 
  this.H = 0;
  // Set true to make impassible 
  this.isObstacle = false;
  // Node mesh for drawing 
  this.mesh = makeSprite(NODE_SIZE,NODE_SIZE,'res/node.png');
  // Parent node to this one 
  this.parent = -1;
}

/** Shortcut to set nodes color easily **/
Node.prototype.setColor = function(color){
	this.mesh.material.color.setHex(color);
}

// Get node F score 
Node.prototype.F = function(){ 
  return this.G + this.H;
}

// Set Heuristic value 
Node.prototype.setHeuristic = function(goal){
  var dx = Math.abs(this.i - goal.i) * NODE_SIZE;
  var dy = Math.abs(this.j - goal.j) * NODE_SIZE;
  // Movement cost 
  var D = 1;
  this.H = D * Math.max(dx, dy);
}

/** Find the path through the grid **/
PathHandler.prototype.findPath = function(){
  // Blocks to look at
  var open = [];
  // Current Path Blocks 
  var closed = [];

  // Set up first node 
  var current = this.grid[this.start.i][this.start.j];
  current.setHeuristic(this.goal);
  open.push(current);

  // Search grid for correct path 
  while ((current.i == this.goal.i && current.j == this.goal.j) == false){
    // Take current out of open list and add it to closed
    var index = open.indexOf(current);
    if (index >= 0) open.splice(index, 1);
    closed.push(current);

    // Add neighbors to open list 
    this.addNeighbors(current.i, current.j,open,closed,current);

    // Find next closest path 
    if (open.length == 0)break;
    current = open[0];
    for (var i = 1; i < open.length; i++){
      if (open[i].F() < current.F())
        current = open[i];
    }
  }

  // Set block colors 
  for (var i = 0; i < closed.length; i++){
    closed[i].setColor(COLOR_CLOSED_NODE);
  }
  for (var i = 0; i < open.length; i++){
    open[i].setColor(COLOR_OPEN_NODE);
  }
  
  // Set correct path colors 
  var i = 0;
  console.clear();
  while (current.parent != -1){
    // Set node color
    current.setColor(COLOR_FOUNDPATH_NODE)

    // Move to next node 
    current = current.parent;

    console.log(current.i + ", " + current.j);

    i++;
    if (i>=2500)break;
  }

  // Set path made to true 
  this.pathMade = true;
  SCREEN_DIRTY = true;
}

/** Add Neighbors of this node to the open list **/
PathHandler.prototype.addNeighbors = function(i,j,open,closed,parent){
  // Check left 
  if (i-1 >= 0 && !this.grid[i-1][j].isObstacle){
    // Set up node variables 
    this.grid[i-1][j].G = parent.G + MOVE_COST;
    this.grid[i-1][j].parent = parent;
    this.grid[i-1][j].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i-1][j],open,closed);
  }

  // Check Top Left 
  if (i-1 >= 0 && j-1 >= 0 && !this.grid[i-1][j-1].isObstacle){
    // Set up node variables 
    this.grid[i-1][j-1].G = parent.G + MOVE_COST;
    this.grid[i-1][j-1].parent = parent;
    this.grid[i-1][j-1].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i-1][j-1],open,closed);
  }

  // Check top
  if (j-1 >= 0 && !this.grid[i][j-1].isObstacle){
    // Set up node variables 
    this.grid[i][j-1].G = parent.G + MOVE_COST;
    this.grid[i][j-1].parent = parent;
    this.grid[i][j-1].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i][j-1],open,closed);
  }

  // Check top right 
  if (i+1 < this.grid.length && j-1 >= 0 && !this.grid[i+1][j-1].isObstacle){
    // Set up node variables 
    this.grid[i+1][j-1].G = parent.G + MOVE_COST;
    this.grid[i+1][j-1].parent = parent;
    this.grid[i+1][j-1].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i+1][j-1],open,closed);
  }

  // Check right
  if (i+1 < this.grid.length && !this.grid[i+1][j].isObstacle){
    // Set up node variables 
    this.grid[i+1][j].G = parent.G + MOVE_COST;
    this.grid[i+1][j].parent = parent;
    this.grid[i+1][j].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i+1][j],open,closed);
  }

  // Check bottom right
  if (j+1 < this.grid[i].length && i+1 < this.grid.length && 
    !this.grid[i+1][j+1].isObstacle){
    // Set up node variables 
    this.grid[i+1][j+1].G = parent.G + MOVE_COST;
    this.grid[i+1][j+1].parent = parent;
    this.grid[i+1][j+1].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i+1][j+1],open,closed);
  }

  // Check bottom
  if (j+1 < this.grid[i].length && !this.grid[i][j+1].isObstacle){
    // Set up node variables 
    this.grid[i][j+1].G = parent.G + MOVE_COST;
    this.grid[i][j+1].parent = parent;
    this.grid[i][j+1].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i][j+1],open,closed);
  }

  // Check bottom left
  if (j+1 < this.grid[i].length && i-1 >= 0 && 
    !this.grid[i-1][j+1].isObstacle){
    // Set up node variables 
    this.grid[i-1][j+1].G = parent.G + MOVE_COST;
    this.grid[i-1][j+1].parent = parent;
    this.grid[i-1][j+1].setHeuristic(this.goal);

    // Add to open list
    this.addToOpenList(this.grid[i-1][j+1],open,closed);
  }
}

// Add to open
PathHandler.prototype.addToOpenList = function(node, open,closed){
  // Check if legal
  for (var i = 0; i < open.length; i++){
    if (open[i].i == node.i && open[i].j == node.j)
    {
      /*if (node.G < open[i].G){
        open[i].G = node.G;
        open[i].parent = node.parent;
      }*/
      return;
    }
  }
  for (var i = 0; i < closed.length; i++){
    if (closed[i].i == node.i && closed[i].j == node.j)
    {
      /*if (node.G < closed[i].G){
        closed[i].G = node.G;
        closed[i].parent = node.parent;
      }*/
      return;
    }
  }

  open.push(node);
}

/** ================================= **/
/**     Obstacle Generation           **/
/** ================================= **/

/** Generate the amount of Obstacles sent **/
PathHandler.prototype.generateObstacles = function(amount){
	for (var i = 0; i < amount; i++){
		this.genViralObs();
	}
}

/** Use to generate Obstacles **/
PathHandler.prototype.genViralObs = function(){
  // Get a staring location 
  var x = Math.round(Math.random() * (this.gridWidth - 1));
  var y = Math.round(Math.random() * (this.gridHeight - 1));

  // Lists 
  var open = [];   // List of nodes to go through
  var closed = []; // List of finished nodes 

  // Starting node 
  open.push(new ViralNode(x,y,1));

  // Spread Virus
  while (open.length != 0){
    open[0].addNeighbors(open, closed, .5);
    closed.push(open[0]);
    open.splice(0, 1);
  }

  // Set nodes in grid  
  for (var i = 0; i < closed.length; i++){
    this.grid[closed[i].i][closed[i].j].isObstacle = true;
    this.grid[closed[i].i][closed[i].j].setColor(COLOR_OBSTACLE_NODE);
  }
}

/** A viral noded used to generate other viral nodes **/
function ViralNode(i,j,percent){
  this.i = i;
  this.j = j;
  this.percent = percent;
}

/** Add neighbors of this node to open list.
 * open: neighbors to look at
 * closed: allready looked at nodes
 * frac: amount to divided percent by. **/
ViralNode.prototype.addNeighbors = function(open, closed, frac){
  var per = this.percent * frac;

  // Add left 
  if (Math.random() < per){
    var node = new ViralNode(this.i-1,this.j,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add top left
  if (Math.random() < per){
    var node = new ViralNode(this.i-1,this.j-1,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add top 
  if (Math.random() < per){
    var node = new ViralNode(this.i,this.j-1,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add top right
  if (Math.random() < per){
    var node = new ViralNode(this.i+1,this.j-1,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add right
  if (Math.random() < per){
    var node = new ViralNode(this.i+1,this.j,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add bottom right 
  if (Math.random() < per){
    var node = new ViralNode(this.i+1,this.j+1,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add bottom  
  if (Math.random() < per){
    var node = new ViralNode(this.i,this.j+1,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }

  // Add bottom  
  if (Math.random() < per){
    var node = new ViralNode(this.i+1,this.j-1,per);
    if (!path.isStartOrGoal(node.i, node.j) && path.isOnGrid(node.i, node.j)) 
    	addViralToList(node,open,closed);
  }
}

/** Try and add node to the open or closed list **/
function addViralToList(node, open, closed){
  for (var i = 0; i < open.length; i++)
    if (open[i].i == node.i && open[i].j == node.j) return;
  for (var i = 0; i < closed.length; i++)
    if (closed[i].i == node.i && closed[i].j == node.j) return;
  open.push(node);
}
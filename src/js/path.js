/** Main Handler for all pathfinding **/
function PathHandler(){
	// Used to draw all UI to screen 
	this.ui = new UIHandler();
}

/** Update Pathfinding state **/
PathHandler.prototype.update = function(){
	this.ui.update();
}

/** Draw Pathfinding to screen **/
PathHandler.prototype.Draw = function(){
	this.ui.draw();
}

/** ================================= **/
/**     Pathfinding                   **/
/** ================================= **/


/** ================================= **/
/**   Initialization Code             **/
/** ================================= **/

PathHandler.prototype.init = function(){
	this.ui.init();
}
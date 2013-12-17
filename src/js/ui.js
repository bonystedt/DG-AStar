/** UI Handler for the game **/
function UIHandler(){
	// Scene to hold all geometry 
	this.scene = new THREE.Scene();
}

/** Update UI State **/
UIHandler.prototype.update = function(){
	//this.scene.children[0].rotation.x += .01;
}

/** Draw UI **/
UIHandler.prototype.draw = function(){
	renderer.render(this.scene, camera);
}

/** ================================= **/
/** Button                            **/
/** ================================= **/

/** Basic button structure **/
function mButton(x,y,width,height,image){
	// Location
	this.x = x;
	this.y = y;
	// Size
	this.w = width;
	this.h = height;
	// Clicking functions 
	this.clicked = false;
	// Image 
	this.mesh = makeSprite(width,height,image);
	this.mesh.position.set(x,y,0);
}

/** Update Button state **/
mButton.prototype.update = function(){
	// Check if clicked 
	if (this.contains(mouse.x, mouse.y) && mouse.left_down){
		clicked = true;
	}
}

/** Check if a location is inside button */
mButton.prototype.contains = function(x,y){
	if (x > this.x && x < this.x + this.width &&
		y > this.y && y < this.y + this.height)
		return true;
	return false;
}

/** Check if button has been clicked **/
mButton.prototype.isClicked = function(){
	if (isClicked){
		isClicked = false;
		return true;
	}
	return false;
}

/** ================================= **/
/**   Initialization Code             **/
/** ================================= **/

UIHandler.prototype.init = function(){
	// Add Lables
	var sprite = makeSprite(128,32,'res/ui_label_controls.png');
	sprite.position.set(10,10,0);
	this.scene.add(sprite);
	sprite = makeSprite(128,32,'res/ui_label_legend.png');
	sprite.position.set(10,250,0);
	this.scene.add(sprite);
}

/** Make a sprite **/
function makeSprite(width, height, texPath){
	// Load the texture file 
	var texture = null;
	if (texPath != null) texture = THREE.ImageUtils.loadTexture(texPath);
	// Make a new basic material and give it the texture 
	var mat = new THREE.MeshBasicMaterial({map:texture});
	// Must set this to true or the texture will not draw correctly if there is alpha 
	mat.transparent = true;
	// Make a new blank geometry 
  var geom = new THREE.Geometry(); 
  
  // Add verticies to the geometry 
  geom.vertices.push(new THREE.Vector3(0,0,0));
  geom.vertices.push(new THREE.Vector3(0,height,0));
  geom.vertices.push(new THREE.Vector3(width,height,0));
  geom.vertices.push(new THREE.Vector3(width,0,0));
  
  // Set the geometry faces 
  geom.faces.push(new THREE.Face3(0,1,2));
  geom.faces.push(new THREE.Face3(2,3,0));

  // Set the UV's for the faces 
  if (texture != null){
	  geom.faceVertexUvs[0].push([
	  	new THREE.Vector2(0,1),
	  	new THREE.Vector2(0,0),
	  	new THREE.Vector2(1,0)]);
	  geom.faceVertexUvs[0].push([
	  	new THREE.Vector2(1,0),
	  	new THREE.Vector2(1,1),
	  	new THREE.Vector2(0,1)]);
	  geom.faces[0].normal.set(0,0,1); 
	}

  // Make the mesh 
  return new THREE.Mesh(geom, mat);
}
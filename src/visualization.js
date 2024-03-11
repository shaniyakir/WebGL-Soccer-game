import {OrbitControls} from './OrbitControls.js'
// Scene Declartion
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// This defines the initial distance of the camera, you may ignore this as the camera is expected to be dynamic
camera.applyMatrix4(new THREE.Matrix4().makeTranslation(-5, 3, 110));
camera.lookAt(0, -4, 1)


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// helper function for later on
function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}


// Here we load the cubemap and pitch images, you may change it

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'src/pitch/right.jpg',
  'src/pitch/left.jpg',
  'src/pitch/top.jpg',
  'src/pitch/bottom.jpg',
  'src/pitch/front.jpg',
  'src/pitch/back.jpg',
]);
scene.background = texture;


// TODO: Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time

const sphereTexture = new THREE.TextureLoader().load(
	'src/textures/soccer_ball.jpg'
);

const RedCardTexture = new THREE.TextureLoader().load(
	'src/textures/red_card.jpg'
);

const YellowCardTexture = new THREE.TextureLoader().load(
	'src/textures/yellow_card.jpg'
);

const VarTexture = new THREE.TextureLoader().load(
	'src/textures/var.png'
);

//GENERAL
const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const rotationMatrix90CCW = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
const POLE_LENGTH = 2;
const POLE_THICKNESS = 0.07;
const goalParts = [];

//CROSSBAR
const crossbarGeometry = new THREE.CylinderGeometry(POLE_THICKNESS, POLE_THICKNESS, POLE_LENGTH, 32);
const crossbar = new THREE.Mesh(crossbarGeometry, whiteMaterial);
crossbar.applyMatrix4(rotationMatrix90CCW);
goalParts.push(crossbar);

//GOALPOST

const goalPostGeometry = new THREE.CylinderGeometry(POLE_THICKNESS, POLE_THICKNESS, POLE_LENGTH, 32);
const hypotenuse = Math.sqrt(Math.pow(POLE_LENGTH,2) + Math.pow(2,2)); // REPLACE THIS WITH THETHA INSTEAD OF HARD CODING
const goalPostBackGeometry = new THREE.CylinderGeometry(POLE_THICKNESS, POLE_THICKNESS, hypotenuse , 32);

const goalPostLeft = new THREE.Mesh(goalPostGeometry, whiteMaterial);
const goalPostRight = new THREE.Mesh(goalPostGeometry, whiteMaterial);
const goalPostBackRight = new THREE.Mesh(goalPostBackGeometry, whiteMaterial);
const goalPostBackLeft = new THREE.Mesh(goalPostBackGeometry, whiteMaterial);
goalParts.push(goalPostLeft);
goalParts.push(goalPostRight);
goalParts.push(goalPostBackRight);
goalParts.push(goalPostBackLeft);

const backPostsRotationMatrix = new THREE.Matrix4().makeRotationX(- Math.PI / 4);

// Create a translation matrix to set the position of goalPostLeft
const translationMatrix = new THREE.Matrix4().makeTranslation(-3, 0, 0);
const backPolesTranslationMatrix = new THREE.Matrix4()
	.makeTranslation(0, 0, 1);
goalPostLeft.applyMatrix4(translationMatrix);
goalPostBackLeft.applyMatrix4(translationMatrix);
goalPostBackLeft.applyMatrix4(backPostsRotationMatrix);
goalPostBackLeft.applyMatrix4(backPolesTranslationMatrix)


// Create a translation matrix to set the position of goalPostRight
translationMatrix.makeTranslation(3, 0, 0);
goalPostRight.applyMatrix4(translationMatrix);
goalPostBackRight.applyMatrix4(translationMatrix);
goalPostBackRight.applyMatrix4(backPostsRotationMatrix);
goalPostBackRight.applyMatrix4(backPolesTranslationMatrix);


const torusRadius = 0.15;
const torusTubeRadius = 0.1;
const torusRadialSegments = 16;
const torusTubeSegments = 32;
// Create toruses for the goalpost edges
const torusFrontLeft = new THREE.Mesh(
	new THREE.TorusGeometry(torusRadius, torusTubeRadius, torusRadialSegments, torusTubeSegments),
	whiteMaterial
  );

const torusRotationMatrix = new THREE.Matrix4().makeRotationX(Math.PI/2);
const torusTranslationMatrix = new THREE.Matrix4().makeTranslation(-3,0,1);
const torusTransformationResult = torusRotationMatrix.multiply(torusTranslationMatrix);
torusFrontLeft.applyMatrix4(torusTransformationResult);

const torusFrontRight = torusFrontLeft.clone();
const torusRightTranslationMatrix = new THREE.Matrix4().makeTranslation(6,0,0);
torusFrontRight.applyMatrix4(torusRightTranslationMatrix);

  
// Create toruses for the back goalpost edges
const torusBackLeft = torusFrontLeft.clone();
const torusBackTranslationMatrix = new THREE.Matrix4().makeTranslation(0,0,2);
torusBackLeft.applyMatrix4(torusBackTranslationMatrix);


const torusBackRight = torusFrontRight.clone();
torusBackRight.applyMatrix4(torusBackTranslationMatrix);

goalParts.push(torusBackLeft);
goalParts.push(torusBackRight);
goalParts.push(torusFrontRight);
goalParts.push(torusFrontLeft);

//NET
const netWidth = 6;
const netHeight = hypotenuse;
// Define the base color for the net material
const baseColor = new THREE.Color(0xd3d3d3);
// Adjust the brightness to make it darker (e.g., reduce by 50%)
const darkenedColor = baseColor.clone().multiplyScalar(0.5);
const netMaterial = new THREE.MeshPhongMaterial({ color: darkenedColor, side: THREE.DoubleSide, transparent: true, opacity: 0.82 });


// Create the back net
const backNetGeometry = new THREE.PlaneGeometry(netWidth, netHeight);
const backNet = new THREE.Mesh(backNetGeometry, netMaterial);

// Apply transformations
const backNetTranslation = new THREE.Matrix4().makeTranslation(0, 0, 1);
backNet.geometry.applyMatrix4(backNetTranslation.multiply(backPostsRotationMatrix));

scene.add(backNet);

// Create the side nets
const triangleWidth = 2;
const triangleHeight = 2;

// Create a new shape for the triangle
const triangleShape = new THREE.Shape();
triangleShape.moveTo(0, 0); // Start at the origin
triangleShape.lineTo(triangleWidth, 0); // Draw the base of the triangle
triangleShape.lineTo(0, triangleHeight); // Draw the height of the triangle
triangleShape.lineTo(0, 0); // Close the shape

// Create the geometry using the shape
const triangleGeometry = new THREE.ShapeGeometry(triangleShape);

// Create a mesh with the geometry and a material
const triangleMeshLeft = new THREE.Mesh(triangleGeometry, netMaterial);

// Apply any transformations using Matrix4 operations
const triangleLeftTranslationMatrix = new THREE.Matrix4().makeTranslation(-3,-1,0);
const rotationMatrix90CW = new THREE.Matrix4().makeRotationY(-Math.PI/2);
triangleMeshLeft.applyMatrix4(triangleLeftTranslationMatrix.multiply(rotationMatrix90CW));

const triangleMeshRight = triangleMeshLeft.clone();
const triangleRightTranslationMatrix = new THREE.Matrix4().makeTranslation(6,0,0);
triangleMeshRight.applyMatrix4(triangleRightTranslationMatrix);


goalParts.push(backNet);
goalParts.push(triangleMeshRight);
goalParts.push(triangleMeshLeft);
const goalSize = createScaleMatrix(10,10,10);

for (let i=0 ; i < goalParts.length; i++){
	let part = goalParts[i]
	part.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
	part.applyMatrix4(goalSize);
}

scene.add(triangleMeshLeft);
scene.add(triangleMeshRight);
scene.add(crossbar);

scene.add(goalPostLeft);
scene.add(goalPostRight);
scene.add(goalPostBackLeft);
scene.add(goalPostBackRight);
scene.add(torusBackLeft);
scene.add(torusBackRight);
scene.add(torusFrontLeft);
scene.add(torusFrontRight);

const poleHeight = 1; // Height of the poles

const translationMatrixCrossbar = new THREE.Matrix4().makeTranslation(0, poleHeight, 0);
crossbar.applyMatrix4(translationMatrixCrossbar);

function createScaleMatrix(scaleX, scaleY, scaleZ) {
	const scaleMatrix = new THREE.Matrix4();
	scaleMatrix.set(
	  scaleX, 0, 0, 0,
	  0, scaleY, 0, 0,
	  0, 0, scaleZ, 0,
	  0, 0, 0, 1
	);
	return scaleMatrix;
  }

const scaleMatrix = createScaleMatrix(1,3,1);
// Apply scaling matrix to crossbar
crossbar.matrixAutoUpdate = false;
crossbar.matrix.multiply(scaleMatrix);
const crossbarTranslate = new THREE.Matrix4().makeTranslation(0,9,0);
crossbar.applyMatrix4(crossbarTranslate);
// This defines the initial distance of the camera
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,0,5);
camera.applyMatrix4(cameraTranslate)

renderer.render( scene, camera );

// ADD LIGHT - AMBIENT 

// ADD LIGHT - DISTANT SPOTLIGHTS

const spotlightColor = 0xffffff; // Color of the spotlights - white

// Spotlight 1 - Behind the goal
const spotlight1 = new THREE.SpotLight(spotlightColor, 1.0); 
spotlight1.position.set(0, 0, -100); // Adjust the position behind the goal
spotlight1.target.position.set(0, 0, 0); // Point the spotlight towards the scene
scene.add(spotlight1);
scene.add(spotlight1.target);

// Spotlight 2 - To the left of the goal
const spotlight2 = new THREE.SpotLight(spotlightColor, 1.0);
spotlight2.position.set(-100, 0, 0); // Adjust the position to the left of the goal
spotlight2.target.position.set(0, 0, 0); // Point the spotlight towards the scene
scene.add(spotlight2);
scene.add(spotlight2.target);

// Spotlight 3 - To the right of the goal
const spotlight3 = new THREE.SpotLight(spotlightColor, 1.0); 
spotlight3.position.set(100, 0, 0); // Adjust the position to the right of the goal
spotlight3.target.position.set(0, 0, 0); // Point the spotlight towards the scene
scene.add(spotlight3);
scene.add(spotlight3.target);

// Spotlight 4 - Behind the ball
const spotlight4 = new THREE.SpotLight(spotlightColor, 1.0); 
spotlight4.position.set(0, 0, 200); // Adjust the position behind the ball
spotlight4.target.position.set(0, 0, 100); // Point the spotlight towards the ball
scene.add(spotlight4);
scene.add(spotlight4.target);

// Create a yellow tinted ambient light
const ambientLight = new THREE.AmbientLight(0xffffcc, 0.8); // Yellow tinted color
scene.add(ambientLight);

// Create the directional light behind the goal
const directionalLight1 = new THREE.DirectionalLight(0xf2970d, 1.5); // Yellowish-Orange color.
directionalLight1.position.set(0, 10, -10);
scene.add(directionalLight1);

// Create the directional light behind the ball
const directionalLight2 = new THREE.DirectionalLight(0xf2970d, 1.5); // Yellowish-Orange color.
directionalLight2.position.set(0, 10, 10);
scene.add(directionalLight2);


//BALL

let radius = 10 / 8;
const material = new THREE.MeshPhongMaterial( {map: sphereTexture} );
const SphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
const sphere = new THREE.Mesh(SphereGeometry, material);
const sphereTranslationMatrix = new THREE.Matrix4().makeTranslation(0,0,100);
sphere.applyMatrix4(sphereTranslationMatrix);
scene.add(sphere);


//Bezier Curves
//chang eopacity to view line
const lineOpacity = 0;


// CURVE RIGHT
const curveOne = new THREE.QuadraticBezierCurve3(
	new THREE.Vector3( 0, 0, 100 ),
	new THREE.Vector3( 50, 0, 50 ),
	new THREE.Vector3( 0, 0, 0 )
);

const pointsOne = curveOne.getPoints( 200 );
const geometryOne = new THREE.BufferGeometry().setFromPoints( pointsOne );
const CurvesMaterialOne = new THREE.LineBasicMaterial( { color: 0x0000ff, transparent: true, opacity: lineOpacity } );
const curveOneObject = new THREE.Line( geometryOne, CurvesMaterialOne );
scene.add(curveOneObject);

// CURVE CENTER

const curveTwo = new THREE.QuadraticBezierCurve3(
	new THREE.Vector3( 0, 0, 100 ),
	new THREE.Vector3( 0, 50, 50 ),
	new THREE.Vector3( 0 , 0, 0 )
);

const pointsTwo = curveTwo.getPoints( 200 );
const geometryTwo = new THREE.BufferGeometry().setFromPoints( pointsTwo );
const CurvesMaterialTwo = new THREE.LineBasicMaterial( { color: 0x00ff00, transparent: true, opacity: lineOpacity } );
const curveTwoObject = new THREE.Line( geometryTwo, CurvesMaterialTwo );
scene.add(curveTwoObject);



// CURVE LEFT
const curveThree = new THREE.QuadraticBezierCurve3(
	new THREE.Vector3( 0 , 0, 100 ),
	new THREE.Vector3( -50 , 0, 50 ),
	new THREE.Vector3( 0, 0, 0 )
);

const pointsThree = curveThree.getPoints( 200 );
const geometryThree = new THREE.BufferGeometry().setFromPoints( pointsThree );
const CurvesMaterialThree = new THREE.LineBasicMaterial( { color: 0xff0000, transparent: true, opacity: lineOpacity } );
const curveThreeObject = new THREE.Line( geometryThree, CurvesMaterialThree );
scene.add(curveThreeObject);

const curves = [ curveOne, curveTwo, curveThree ]


// Set the camera following the ball here

// Create a camera
const cameraPerspective = new THREE.PerspectiveCamera(
	45, // field of view
	window.innerWidth / window.innerHeight, // aspect ratio
	0.1, // near clipping plane
	1000 // far clipping plane
  );
  
  // Set up camera tracking variables
  let cameraOffset = new THREE.Vector3(0, 20, 50); // The camera's offset from the ball

const updateCameraPerspective = () =>{
	// Calculate the new camera position
	const targetPosition = new THREE.Vector3(camera.position.x, camera.position.y, sphere.position.z);
	const cameraPosition = targetPosition.clone().add(cameraOffset);
	// Create a translation matrix to update the camera position along the Z-axis
	const translationMatrix = new THREE.Matrix4().makeTranslation(0, 0, cameraPosition.z - camera.position.z);

 	// Apply the translation matrix to the camera's position
 	camera.position.applyMatrix4(translationMatrix);

  
	// Update the camera's lookAt based on the ball's position
	camera.lookAt(sphere.position);
  }


//Add collectible cards with textures


// Define card dimensions
const cardWidth = 4;
const cardHeight = 7;
const cardDepth = 0.1;

// Create materials for yellow and red cards (based on textures)
const yellowCardMaterial = new THREE.MeshPhongMaterial({ map: YellowCardTexture });
const redCardMaterial = new THREE.MeshPhongMaterial({ map: RedCardTexture });
const varCardMaterial = new THREE.MeshPhongMaterial({ map: VarTexture });


// Create an array to hold all the cards
const cards = [];

// Function to add a card to the scene at a specific t value on a curve
const addCard = (curve, t, isYellowCard, isVar = false) => {
  // Create the card geometry
  const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);

  // Create the card material based on the card type
  const cardMaterial = isVar ? varCardMaterial : 
  	isYellowCard ? yellowCardMaterial : redCardMaterial;

  // Create the card mesh
  let card = new THREE.Mesh(cardGeometry, cardMaterial);

  // Set the position of the card on the curve
  const position = curve.getPoint(t);
  card.position.copy(position);

  // Add the card to the scene
  scene.add(card);

  // Store the card object in the cards array
  cards.push(card);
};


const yellowCardBool = true;
const redCardBool = false;

addCard(curves[0], 0.3, yellowCardBool);
addCard(curves[0], 0.7, yellowCardBool);

addCard(curves[1], 0.2, redCardBool);
addCard(curves[1], 0.4, yellowCardBool);
addCard(curves[1], 0.6, redCardBool);

addCard(curves[2], 0.25, yellowCardBool);
addCard(curves[2], 0.65, yellowCardBool);

//bonus card: var
addCard(curves[2], 0.9, false, true);


const min = 0.2;
const max = 0.9;

const randomizeCards = () => {
	cards.map(card => {
		const index = Math.floor(Math.random() * 3);
		const t = Math.random() * (max - min) + min;
		const position = curves[index].getPoint(t)
		card.position.copy(position);
	})
}


// Handle Collisions:
const collisionFactor = 0.9;
let numYellowCards = 0;
let numRedCards = 0;
let numVarCards = 0;

const checkCollision = (ball, card) => {
	const ballPos = ball.position.clone();
	const cardPos = card.position.clone();
	const distance = ballPos.distanceTo(cardPos);
  
	if (distance + collisionFactor < ball.geometry.parameters.radius) {
	  if(card.material.map === YellowCardTexture) numYellowCards += 1; 
	  else if(card.material.map === RedCardTexture) numRedCards += 1;
	  else if(card.material.map === VarTexture) numVarCards += 1;
	}
  };

let currentCurveIndex = 0;
let currentCurvePosition = 0;

const points = [
	pointsOne,    // Array of points for curveOne
	pointsTwo,    // Array of points for curveTwo
	pointsThree   // Array of points for curveThree
  ];


// TODO: Add keyboard event
// We wrote some of the function for you
const handle_keydown = (e) => {
	if(e.code == 'ArrowLeft'){
		// Delete both if's to enable laps of curves
		if ((currentCurveIndex + 1) < 3 || isCyclicCurvesEnabled)
			currentCurveIndex = (currentCurveIndex + 1) % 3; // Switch to the next curve
	} else if (e.code == 'ArrowRight'){
		if ((currentCurveIndex - 1) >= 0 || isCyclicCurvesEnabled)
			currentCurveIndex = (currentCurveIndex + 2) % 3; // Switch to the previous curve
	}

}

let isCyclicCurvesEnabled = false;

document.addEventListener("keydown", (e) => {
	if (e.key === "b" ) isCyclicCurvesEnabled = !isCyclicCurvesEnabled;
  });

document.addEventListener('keydown', handle_keydown);

const controls = new OrbitControls( camera, renderer.domElement );

let isOrbitEnabled = false;

const toggleOrbit = (e) => {
	if (e.key == "o"){
		isOrbitEnabled = !isOrbitEnabled;
	}
}

// Keyboard event listener
document.addEventListener('keydown',toggleOrbit);

controls.update();

const rotationSpeed = 0.04;

alert("Game Rules:\n" 
	+ "Use the right and left arrows to move between curves.\n"
	+ "Use the 'b' key to lock/unlock the boundaries of the curves.\n"
	+ "Use the 'o' key to enable OrbitControls.\n\n"
	+ "Objective: Evade the red and yellow penalties, collect the VAR bonus, and obtain the highest score possible - 100 points!");


function animate() {

	requestAnimationFrame( animate );

	//Animation for the ball's position

	// Calculate the new position on the curve
	currentCurvePosition = (currentCurvePosition + 1) % points[currentCurveIndex].length;

	// Get the current position on the curve
	const currentPosition = points[currentCurveIndex][currentCurvePosition];

	// Add rotation to the sphere
	sphere.position.copy(currentPosition)
	sphere.rotation.y += rotationSpeed;
	sphere.rotation.x += rotationSpeed/2;

	updateCameraPerspective()

	cards.forEach(card => checkCollision(sphere, card))
	let fairPlay = 0;

	//ENDGAME
	if (sphere.position.x == 0 && sphere.position.y == 0 && sphere.position.z == 0) {
		fairPlay = Math.min(100 * Math.pow(2, -(numYellowCards + 10 * numRedCards - numVarCards * 2) / 10.0), 100);
		if (numVarCards == 0)
			alert(`You collected ${numYellowCards} yellow cards, and ${numRedCards} red cards.\nYour score is: ${fairPlay.toFixed(2)}`);
		else
			alert(`You collected ${numYellowCards} yellow cards, ${numRedCards} red cards, and the VAR card!\nYour score is: ${fairPlay.toFixed(2)}`);
		fairPlay = 0;
		numRedCards = 0;
		numYellowCards = 0;
		numVarCards = 0;
		randomizeCards()
	}
	
	controls.enabled = isOrbitEnabled;
	renderer.render( scene, camera );

}
animate()
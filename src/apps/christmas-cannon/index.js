import { Stage } from "./stage";
import { Physics, PHYSICS_MATERIAL } from "./physics";
import * as CANNON from "cannon";
import { Group } from "three";
import gsap from "gsap";

console.clear();

const DIRECTION = {
	left: 'LEFT',
	right: 'RIGHT'
}

const GAME_STATE = {
	loading: 'loading',
	intro: 'intro',
	waiting: 'waiting',
	game: 'game'
}

let gameState = GAME_STATE.loading;

let physicsItems = [];
let stage;
let physics;

let showGuides = false;

let count = 0;
let cannonFlash;
let cannonRecoil;

// class ChristmasCannon
// {
// 	constructor()
// 	{
// 		this.showGuides = false;
// 		this.cannonFlash;
// 		this.cannonRecoil;
// 		this.editablePhysics = {};

// 		this.createWorld();
// 	}

// 	createWorld()
// 	{
// 		let worldScale = 1;

// 		let stageSize = {
// 			left: -20,
// 			width: 40,
// 			top: 0,
// 			height: 30
// 		}

// 		this.stage = new Stage(worldScale, stageSize, onReady);
// 		this.physics = new Physics(worldScale, stageSize);
// 	}

// 	createListeners()
// 	{
// 		window.addEventListener( 'resize', () => { stage.onResize() }, false );
// 		document.addEventListener( 'keypress', onDocumentKeyPress, false );
// 		document.addEventListener( 'click', onDocumentKeyPress, false );
// 	}
// }

const introSteps = [init, prepUI, loadComplete, dropIn, createClickListeners, introRoom, introCannon, introStart, startGame];

function next() 
{
	if(introSteps.length)
	{
		introSteps.shift()();
	}
	else
	{
		console.error(`Well this shouldn't have happened.`)
	}
}

function loadComplete()
{
	const loadingScreen = document.querySelector('#loading');
	loadingScreen.innerHTML = '';
	setState(GAME_STATE.intro);

	gsap.to(loadingScreen, {autoAlpha: 0, duration: 1.5});
	setTimeout(() => next(), 1000);
}

function prepUI()
{
	gsap.set('#steve', {y: '50%', scale: 0, rotation: 45});
	gsap.set('#bubble', {transformOrigin: '100% 50%', autoAlpha: 0, x:'+=50', rotation: 5, scale: 0.9})

	next();
}

function dropIn()
{
	createSofa();
	createTable();
	createStand();
	createTV();

	next();
}

function setState(newState)
{
	gameState = newState;
	document.body.setAttribute('class', gameState);
}

function createClickListeners()
{
	document.addEventListener( 'keypress', onClick, false );
	document.addEventListener( 'click', onClick, false );

	next();
}

function introRoom()
{
	setState(GAME_STATE.intro);
	let roomTL = gsap.timeline({onComplete: () => setState(GAME_STATE.waiting)});
	roomTL.to('#steve', {delay:1, y: 0, rotation: 0, scale: 1, ease: 'power4.out', duration: 0.6})
	roomTL.fromTo('#bubble', {autoAlpha: 0, y: 0,  x:'+=50', rotation: 5, scale: 0.9}, {autoAlpha: 1, rotation: 0, scale: 1, x:0, ease: 'elastic', duration: 1})
}

function introCannon()
{
	setState(GAME_STATE.intro);
	const steveEl = document.querySelector('#steve');
	const textEl = document.querySelector('#text');
	const textHighlightEl = document.querySelector('#text-highlight');

	let cannonTL = gsap.timeline({onComplete: () => setState(GAME_STATE.waiting), defaults: { ease: 'power4.easeInOut', duration: .8}});
	cannonTL.to(stage.camera.position, {x: 65, y: -20, z: 20})
	cannonTL.to(stage.cameraTarget, {x: 30, y: -25, z: 30}, 0)
	cannonTL.to('#bubble', {autoAlpha: 0, y:'-=30', scale: 0.5, duration: 0.3, ease: 'power2.in'}, 0);
	cannonTL.to(steveEl, {y: '-=20', duration: 0.1, onComplete: () => {
		steveEl.setAttribute('src', '/images/steves/happy.svg');
		textEl.textContent = "But wait, we have this ";
		textHighlightEl.textContent = "Christmas Cannon!!";
	}}, 0.5)
	cannonTL.to(steveEl, {y: 0, duration: .7, ease: 'bounce'}, 0.6);
	cannonTL.fromTo('#bubble', {autoAlpha: 0, y: 0,  x:'+=50', rotation: 5, scale: 0.9}, {autoAlpha: 1, rotation: 0, scale: 1, x:0, ease: 'elastic', duration: 1}, 1);
}

function introStart()
{
	setState(GAME_STATE.intro);
	const steveEl = document.querySelector('#steve');
	const textEl = document.querySelector('#text');
	const textHighlightEl = document.querySelector('#text-highlight');

	let cannonTL = gsap.timeline({onComplete: () => setState(GAME_STATE.game), defaults: { ease: 'power4.easeInOut', duration: .8}});
	cannonTL.to(stage.camera.position, {x: 55, y: 15, z: 55})
	cannonTL.to(stage.cameraTarget, {x: 0, y: -22, z: 0}, 0)
	cannonTL.to('#bubble', {autoAlpha: 0, y:'-=30', scale: 0.5, duration: 0.3, ease: 'power2.in'}, 0);
	cannonTL.to(steveEl, {y: '-=20', duration: 0.1, onComplete: () => {
		steveEl.setAttribute('src', '/images/steves/steve.svg');
		textEl.textContent = "Click or tap to fire the Christmas Cannon, let’s make this room more festive!!";
		textHighlightEl.textContent = "";
	}}, 0.5)
	cannonTL.to(steveEl, {y: 0, duration: .7, ease: 'bounce'}, 0.6);
	cannonTL.fromTo('#bubble', {autoAlpha: 0, y: 0,  x:'+=50', rotation: 5, scale: 0.9}, {autoAlpha: 1, rotation: 0, scale: 1, x:0, ease: 'elastic', duration: 1}, 1);
}

function startGame()
{
	setState(GAME_STATE.game);

	let gameStartTL = gsap.timeline({defaults: { ease: 'power4.easeInOut', duration: .5}});
	gameStartTL.to('#bubble', {autoAlpha: 0, y:'-=30', scale: 0.5, duration: 0.3, ease: 'power2.in'}, 0);
	gameStartTL.to('#steve', {y: '100%', scale: 0, rotation: 45}, 0)
}

function onClick(event)
{
	if(event) event.preventDefault();

	switch(gameState)
	{
		case GAME_STATE.waiting:
			next();
			break;
		case GAME_STATE.game:
			fire();
			break;
		default:
			return;
	}
	
}

function fire()
{
	if(count === 0) next();
	count++;
	if(count === 10) createTree();
	else addBall();
	cannonFlash.restart();
	cannonRecoil.restart();
}

function onReady()
{
	// createTree();

	setState(GAME_STATE.intro);

	cannonFlash = gsap.timeline();
	cannonFlash.fromTo(stage.cannonLight, {intensity: 2}, {intensity: 0, duration: .3});

	cannonRecoil = gsap.timeline();
	cannonRecoil.to(stage.models.cannon.position, {x: '+=3', z: '+=3', duration: 0.1, ease: 'Power2.out'}).to(stage.models.cannon.position, {x: '-=3', z: '-=3', duration: 0.4})
	// cannonFlash.stop();


	

	animate();

	next();
}




function addBall()
{		
	// gsap.to(stage.cameraTarget, {x: stageSize.left + (stageSize.width * 0.5), ease: 'Power4.inOut', duration: 1})

	
	
	var size = .5;
	let x = 35;
	let y = -15;
	let z = 35;
	
	let width = 1 + Math.random() * 4;
	let height = 1 + Math.random() * 4;
	let depth = 1 + Math.random() * 4;
		
	let isBall = Math.random() > 0.5;
	
	
	
	var physicsItem = { 
		mesh: isBall ? stage.createBall(size, Math.random() * 0xFFFFFF, Math.random() > 0.5) : stage.createBox(width, height, depth, 0xFFFFFF, true),
		physics: isBall ? physics.createBall(size, x, y, z) : physics.createBox(width, height, depth, x, y, z, 2),
		previousPosition: new CANNON.Vec3(x, y, z),
		rotation: 0,
		rotationVelocity: 0
	}
	
	// physicsItem.physics.velocity.set(-20 - (Math.random() * 50), 1 + (Math.random() * 10), -20 - (Math.random() * 50))


	// -60 => -20

	// 10 => 30

	// -20 => -60

	physicsItem.physics.velocity.set(-60, 10, -60)
	const angularRandomness = 10;
	physicsItem.physics.angularVelocity.set(
		((Math.random() * angularRandomness) - (angularRandomness/2)),
		((Math.random() * angularRandomness) - (angularRandomness/2)),
		((Math.random() * angularRandomness) - (angularRandomness/2)))
	physicsItem.physics.angularDamping = 0.8;
	
	physicsItems.push(physicsItem);

	// if(pauseTimer) clearTimeout(pauseTimer);
	// pauseTimer = setTimeout( _ => doPhysics = false, 7000);
}

function createStaticBox(settings)
{
	// const z = 1;
	var physicsItem = { 
		mesh: settings.show ? stage.createBox(settings.width, settings.height, settings.depth, settings.color) : null,
		physics: physics.createBox(settings.width, settings.height, settings.depth, settings.x, settings.y, settings.z, 0, settings.rotation, settings.trigger),
		previousPosition: new CANNON.Vec3(settings.x, settings.y, settings.z),
		rotation: settings.rotation,
		rotationVelocity: 0
	}
	physicsItems.push(physicsItem);

	return physicsItem
}

function animate() 
{
	physics.tick()

	for(var i in physicsItems)
	{
		if(physicsItems[i].mesh)
		{
			physicsItems[i].mesh.position.copy(physicsItems[i].physics.position);
			physicsItems[i].mesh.quaternion.copy(physicsItems[i].physics.quaternion);	
		}
		
	}

	stage.render();

	requestAnimationFrame( animate );
}

function init()
{
	console.log('init()');



	let worldScale = 1;

	let stageSize = {
		left: -20,
		width: 40,
		top: 0,
		height: 30
	}

	stage = new Stage(worldScale, stageSize, onReady);
	physics = new Physics(worldScale, stageSize);
	
	window.addEventListener( 'resize', () => { stage.onResize() }, false );




	let staticItems = [
		{
			show: true,
			x: stageSize.left,
			y: -18.5,
			z: 0,
			width: 25,
			height: 2,
			depth: 40,
			color: 0xcccccc,
			rotation: Math.PI * 0.5,
		},
		{
			show: true,
			x: stageSize.left + (stageSize.width / 2) - 0.5,
			y: -18.5,
			z: -20,
			width: 41,
			height: 25,
			depth: 2,
			color: 0xcccccc,
			rotation: 0
		},
		{
			show: true,
			x: stageSize.left + (stageSize.width / 2),
			y: -30,
			z: 0,
			width: 40,
			height: 2,
			depth: 40,
			color: 0xcccccc,
			rotation: 0
		},
		{
			show: showGuides,
			x: 5.5,
			y: -25,
			z: -18,
			width: 3,
			height: 14,
			depth: 3,
			color: 0xff0000,
			rotation: 0
		},
		{
			show: showGuides,
			x: -5,
			y: -25,
			z: -18,
			width: 3,
			height: 14,
			depth: 3,
			color: 0xff0000,
			rotation: 0
		},
		{
			show: showGuides,
			x: 0,
			y: -19,
			z: -18,
			width: 10,
			height: 2.5,
			depth: 3,
			color: 0xff0000,
			rotation: 0
		},
		{
			show: showGuides,
			x: 0,
			y: -17.7,
			z: -18,
			width: 15.2,
			height: 0.5,
			depth: 3.3,
			color: 0xff0000,
			rotation: 0
		}
		
	]

	staticItems.forEach(settings => {
		createStaticBox(settings);
	})

	

	

	
	// addBall();
}

function createSofa()
	{
		let body = physics.createBody(10, {x: 12, y: -10, z: 2}, {y: Math.PI * 1.023, x: Math.PI * 0.01}, PHYSICS_MATERIAL.lowBounce);

		let shapes = [{
			show: false,
			x: 0,
			y: -1.5,
			z: 0,
			width: 9,
			height: 2.6,
			depth: 23.5,
			rotation: 0
		},
		{
			show: false,
			x: -4,
			y: 0,
			z: 0,
			width: 2.3,
			height: 6,
			depth: 23,
			rotation: 0
		},
		{
			show: false,
			x: 0,
			y: 0,
			z: -10.3,
			width: 9,
			height: 2,
			depth: 2.5,
			rotation: 0
		},
		{
			show: false,
			x: 0,
			y: 0,
			z: 10.3,
			width: 9,
			height: 2,
			depth: 2.5,
			rotation: 0
		},
		{
			show: false,
			x: -2.2,
			y: 2.8,
			z: 0,
			width: 3.5,
			height: 1,
			depth: 18.5,
			rotation: -Math.PI * 0.4
		}];

		let sofaGroup = new Group();
		sofaGroup.add(stage.models.sofa)
		stage.scene.add(sofaGroup);

		shapes.forEach(box => {
			let shape = physics.createBoxShape(box.width, box.height, box.depth);
			
			if(showGuides)
			{
				let b = stage.createBox(box.width, box.height, box.depth, 0xff0000);
				b.position.set(box.x, box.y, box.z);
				b.rotation.set(0, 0, box.rotation);
				sofaGroup.add(b);
			}

			body.addShape(shape, new CANNON.Vec3(box.x, box.y, box.z), new CANNON.Quaternion(0, 0, box.rotation));
		})

		var physicsItem = { 
			mesh: sofaGroup,
			physics: body,
		}
		
		physicsItem.physics.velocity.set(0, -20, 0)
		// const angularRandomness = 10;
		// physicsItem.physics.angularVelocity.set(
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)))
		// physicsItem.physics.angularDamping = 0.8;
		
		physicsItems.push(physicsItem);
	}

	function createTable()
	{
		let body = physics.createBody(6, {x: 0, y: -13, z: 2}, {y: -Math.PI * 1.013, x: Math.PI * 0.01}, PHYSICS_MATERIAL.lowBounce);

		let shapes = [
			{
				x: 0.5,
				y: -1.2,
				z: 0,
				width: 7,
				height: 0.5,
				depth: 16,
				rotation: 0
			},
			{
				x: 4,
				y: -2.5,
				z: 7.8,
				width: 0.5,
				height: 2.5,
				depth: 0.5,
				rotation: 0
			},
			{
				x: 4,
				y: -2.5,
				z: -7.8,
				width: 0.5,
				height: 2.5,
				depth: 0.5,
				rotation: 0
			},
			{
				x: -2.8,
				y: -2.5,
				z: 7.8,
				width: 0.5,
				height: 2.5,
				depth: 0.5,
				rotation: 0
			},
			{
				x: -2.8,
				y: -2.5,
				z: -7.8,
				width: 0.5,
				height: 2.5,
				depth: 0.5,
				rotation: 0
			},
		];

		let tableGroup = new Group();
		tableGroup.add(stage.models.table)
		stage.scene.add(tableGroup);

		shapes.forEach(box => {
			let shape = physics.createBoxShape(box.width, box.height, box.depth);
			
			if(showGuides)
			{
				let b = stage.createBox(box.width, box.height, box.depth, 0xff0000);
				b.position.set(box.x, box.y, box.z);
				b.rotation.set(0, 0, box.rotation);
				tableGroup.add(b);
			}

			body.addShape(shape, new CANNON.Vec3(box.x, box.y, box.z), new CANNON.Quaternion(0, 0, box.rotation));
		})

		var physicsItem = { 
			mesh: tableGroup,
			physics: body,
		}
		
		physicsItem.physics.velocity.set(0, -20, 0)
		// const angularRandomness = 10;
		// physicsItem.physics.angularVelocity.set(
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)))
		// physicsItem.physics.angularDamping = 0.8;
		
		physicsItems.push(physicsItem);
	}
	
	function createStand()
	{
		let body = physics.createBody(6, {x: -16, y: -10, z: 0}, {y: -Math.PI * 0.001, x: Math.PI * 0.05}, PHYSICS_MATERIAL.lowBounce);

		let shapes = [
			{
				x: 0,
				y: 1.5,
				z: 0,
				width: 4.5,
				height: 4.8,
				depth: 18,
				rotation: 0
			}
			
		];

		let standGroup = new Group();
		standGroup.add(stage.models.stand)
		stage.scene.add(standGroup);

		shapes.forEach(box => {
			let shape = physics.createBoxShape(box.width, box.height, box.depth);
			
			if(showGuides)
			{
				let b = stage.createBox(box.width, box.height, box.depth, 0xff0000);
				b.position.set(box.x, box.y, box.z);
				b.rotation.set(0, 0, box.rotation);
				standGroup.add(b);
			}

			body.addShape(shape, new CANNON.Vec3(box.x, box.y, box.z), new CANNON.Quaternion(0, 0, box.rotation));
		})

		var physicsItem = { 
			mesh: standGroup,
			physics: body,
		}
		
		physicsItem.physics.velocity.set(0, -20, 0)
		// const angularRandomness = 10;
		// physicsItem.physics.angularVelocity.set(
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)))
		// physicsItem.physics.angularDamping = 0.8;
		
		physicsItems.push(physicsItem);
	}
	
	function createTV()
	{
		let body = physics.createBody(2, {x: -15.5, y: 0, z: 0}, {y: -Math.PI * 0.001, x: Math.PI * 0.001}, PHYSICS_MATERIAL.lowBounce);

		let shapes = [
			{
				x: 0,
				y: 4.5,
				z: 0.5,
				width: 1.5,
				height: 9.5,
				depth: 18,
				rotation: 0
			},
			{
				x: 0,
				y: -1.6,
				z: 0.5,
				width: 2.5,
				height: 0.5,
				depth: 6.8,
				rotation: 0
			}
			
		];

		let tvGroup = new Group();
		tvGroup.add(stage.models.tv)
		stage.scene.add(tvGroup);

		shapes.forEach(box => {
			let shape = physics.createBoxShape(box.width, box.height, box.depth);
			
			if(showGuides)
			{
				let b = stage.createBox(box.width, box.height, box.depth, 0xff0000);
				b.position.set(box.x, box.y, box.z);
				b.rotation.set(0, 0, box.rotation);
				tvGroup.add(b);
			}

			body.addShape(shape, new CANNON.Vec3(box.x, box.y, box.z), new CANNON.Quaternion(0, 0, box.rotation));
		})

		var physicsItem = { 
			mesh: tvGroup,
			physics: body,
		}
		
		physicsItem.physics.velocity.set(0, -20, 0)
		// const angularRandomness = 10;
		// physicsItem.physics.angularVelocity.set(
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)),
		// 	((Math.random() * angularRandomness) - (angularRandomness/2)))
		// physicsItem.physics.angularDamping = 0.8;
		
		physicsItems.push(physicsItem);
	}
	
	function createTree()
	{
		let body = physics.createBody(10, {x: 30, y: -10, z: 30}, {y: -Math.PI * 0.001, x: Math.PI * 0.001}, PHYSICS_MATERIAL.lowBounce);
		physics.setAngle(body, -Math.PI * 0.5, 'x');
		let shapes = [
			{
				x: 0,
				y: 0,
				z: -2.2,
				topRadius: 1,
				bottomRadius: 6,
				height: 16,
				segments: 10
			},
			{
				x: 0,
				y: 0,
				z: -13,
				topRadius: 0.5,
				bottomRadius: 1,
				height: 7,
				segments: 5
			},
			{
				x: 0,
				y: 0,
				z: -15,
				topRadius: 3,
				bottomRadius: 2,
				height: 5,
				segments: 7
			}
		];

		let treeGroup = new Group();
		treeGroup.add(stage.models.tree);
		treeGroup.add(stage.models.pot);
		stage.scene.add(treeGroup);

		shapes.forEach(cylinder => {
			let shape = physics.createCylinderShape(cylinder.topRadius, cylinder.bottomRadius, cylinder.height, cylinder.segments);
			
			if(showGuides)
			{
				let b = stage.createCylinder(cylinder.topRadius, cylinder.bottomRadius, cylinder.height, cylinder.segments, 0xff0000);
				b.position.set(cylinder.x, cylinder.y, cylinder.z);
				b.rotation.set(0,0,0);
				treeGroup.add(b);
			}

			body.addShape(shape, new CANNON.Vec3(cylinder.x, cylinder.y, cylinder.z), new CANNON.Quaternion(0, 0, cylinder.rotation));
		})

		var physicsItem = { 
			mesh: treeGroup,
			physics: body,
		}
		
		body.velocity.set(-40, 30, -40)
		const angularRandomness = 5;
		body.angularVelocity.set(
			((Math.random() * angularRandomness) - (angularRandomness/2)),
			((Math.random() * angularRandomness) - (angularRandomness/2)),
			((Math.random() * angularRandomness) - (angularRandomness/2)))
		body.angularDamping = 0.8;
		
		physicsItems.push(physicsItem);
	}

next();
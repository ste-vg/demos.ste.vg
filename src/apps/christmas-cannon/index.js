import { Stage } from "./stage";
import { Physics, PHYSICS_MATERIAL } from "./physics";
import * as CANNON from "cannon";
import { Group } from "three";

const DIRECTION = {
	left: 'LEFT',
	right: 'RIGHT'
}

function init()
{
	console.clear();
	console.log('init()');

	let showGuides = false;

	let worldScale = 1;

	let stageSize = {
		left: -20,
		width: 40,
		top: 0,
		height: 30
	}

	let stage = new Stage(worldScale, stageSize, onReady);
	let physics = new Physics(worldScale, stageSize);
	
	let editablePhysics = {};

	// const settings = {
	// 	area: {
	// 		y:[]
	// 	}
	// 	startY: 0,
	// 	endY: -100
	// }

	// stage.setPlane(physics.groundBody);

	window.addEventListener( 'resize', () => { stage.onResize() }, false );
	document.addEventListener( 'keypress', onDocumentKeyPress, false );

	let letters = [];
	let count = 0;
	let physicsItems = [];
	
	let pauseTimer = null;
	let doPhysics = false;

	// gsap.to('body', {
	// 	scrollTrigger: {
	// 		trigger: '#trigger1',
	// 		onToggle: () => addBall('A')
	// 	}
	// })

	

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
		let item = createStaticBox(settings);
		if(settings.name) editablePhysics[settings.name] = item;
	})

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
	
	// let test = createStaticBox(stageSize.left + 25, -10, (stageSize.width / 2), 2, Math.PI * 0.05);

	// gsap.to(test.physics.position, {delay: 1, x: stageSize.left + 15, ease: 'power3.inOut', repeat: -1, yoyo: true, duration: 2, onUpdate:() => updateVelocity(test)});
	// gsap.to(test, {delay: 1, rotationVelocity: -0.01, ease: 'power3.inOut', repeat: -1, yoyo: true, duration: 2, onUpdate:() => updateRotation(test)});

	function onReady()
	{
		// createTree();
		createSofa();
		createTable();

		doPhysics = true;

		animate();
	}

	function setDirection(direction)
	{
		updateStatus(1, direction);
		// gsap.to(stage.cameraTarget, {x: stageSize.left + ((direction == DIRECTION.left) ? stageSize.width * 0.3 : stageSize.width * 0.7) * worldScale, ease: 'Power4.inOut', duration: 1.3})
	}

	function updateStatus(id, copy)
	{
		let statusElement = document.getElementById('status-' + id);
		if(statusElement)
		{
			statusElement.innerHTML = copy;
		}
		else
		{
			console.error('No status element with id', id);
		}
	}

	function updateVelocity(item)
	{
		let velocities = [
			(item.physics.position.x - item.previousPosition.x) * 60,
			(item.physics.position.y - item.previousPosition.y) * 60,
			(item.physics.position.z - item.previousPosition.z) * 60
		]

		item.previousPosition.set(item.physics.position.x, item.physics.position.y, item.physics.position.z);
		item.physics.velocity.set(...velocities);
	}

	function updateRotation(item)
	{
		physics.setAngle(item.physics, item.rotationVelocity);
	}

	function addBall()
	{		
		// gsap.to(stage.cameraTarget, {x: stageSize.left + (stageSize.width * 0.5), ease: 'Power4.inOut', duration: 1})

		
		
		var size = .5;
		let x = 20;
		let y = -10;
		let z = 20;
		
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
		
		physicsItem.physics.velocity.set(-20 - (Math.random() * 50), 1 + (Math.random() * 10), -20 - (Math.random() * 50))
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

	function fire()
	{
		count++;
		if(count === 6) createTree();
		else addBall();
 	}
	
	function createTree()
	{
		let x = 30;
		let y = -10;
		let z = 30;
		let tr = 1;
		let br = 8;
		let h = 19;
		let seg = 10;
		
		var physicsItem = { 
			mesh: stage.models.tree,
			physics: physics.createCylinder(x, y, z, tr, br, h, seg),
			previousPosition: new CANNON.Vec3(x, y, z),
			rotation: 0,
			rotationVelocity: 0
		}
		const angularRandomness = 10;
		physicsItem.physics.angularVelocity.set(
			((Math.random() * angularRandomness) - (angularRandomness/2)),
			-10 + ((Math.random() * angularRandomness) - (angularRandomness/2)),
			((Math.random() * angularRandomness) - (angularRandomness/2))
		)
		physicsItem.physics.angularDamping = 0.8;
		physicsItem.physics.velocity.set(
			-30 - (Math.random() * 30), 
			20 + (Math.random() * 10), 
			-30 - (Math.random() * 30)
		)
		physicsItems.push(physicsItem);

		
	}

	function onDocumentKeyPress( event )
	{
		event.preventDefault();

		if(stage) fire()
	}
	
	function animate() 
	{
		if(doPhysics) physics.tick()

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

	
	// addBall();
}

init();
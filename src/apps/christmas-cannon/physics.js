import * as CANNON from "cannon";

class Physics
{
	constructor(scale = 1, stageSize)
	{
		this.scale = 1;
		this.stageSize;
		this.mainMaterial;
		
        this.scale = scale;
        this.stageSize = stageSize;

        this.mainMaterial = new CANNON.Material('main');
        this.mainMaterial.friction = 1;

		// WORLD

		this.world = new CANNON.World();
		this.world.gravity.set(0, -60 * this.scale, 0);
		this.world.broadphase = new CANNON.NaiveBroadphase();
		this.world.solver.iterations = 4;

		// GROUND
		
		this.groundBody = new CANNON.Body({mass: 0, material: this.mainMaterial});
		let groundShape = new CANNON.Plane();
		this.groundBody.addShape(groundShape);
		var rotate = new CANNON.Vec3(1,0,0)
        this.groundBody.quaternion.setFromAxisAngle(rotate, - (Math.PI/2))
        this.groundBody.position.set(0, (this.stageSize.top - this.stageSize.height) * scale, 0)
		this.world.addBody(this.groundBody);

		this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
		this.world.defaultContactMaterial.contactEquationRelaxation = 1;
		this.world.defaultContactMaterial.frictionEquationStiffness = 1e20;
    	this.world.defaultContactMaterial.frictionEquationRelaxation = 1;    
        
	}
	
	createBox(width, height, depth, x, y, z, mass = 0, rotation = 0, trigger)
	{
		let shape = new CANNON.Box(new CANNON.Vec3(width / 2 * this.scale, height / 2 * this.scale, depth / 2 * this.scale));
		let body = new CANNON.Body({
            type: mass == 0 ? CANNON.Body.KINEMATIC : CANNON.Body.DYNAMIC,
            material: this.mainMaterial,
            mass: mass * this.scale,
            position: new CANNON.Vec3(x * this.scale, y * this.scale, z * this.scale), // m
		});
        body.addShape(shape);
        body.collisionResponse = trigger ? false : true;

        if(trigger)
        {
            body.addEventListener('collide', () => trigger())
        }
        
        this.setAngle(body, rotation);
        
		this.world.addBody(body);
		
		return body;
    }
    
    setAngle(body, rotation, direction = 'z', )
    {
        let q = new CANNON.Quaternion();
		let x = direction === 'x' ? 1 : 0
		let y = direction === 'y' ? 1 : 0
		let z = direction === 'z' ? 1 : 0
        q.setFromAxisAngle(new CANNON.Vec3(x,y,z), rotation);
        body.quaternion = q.mult(body.quaternion);
    }

	createBall(size, x = 0, y = 0, z = 0)
	{
		let shape = new CANNON.Sphere(size);
		let body = new CANNON.Body({
            material: this.mainMaterial,
			mass: 1 * this.scale,
			position: new CANNON.Vec3(x * this.scale, y * this.scale, z * this.scale), // m
		});
		body.addShape(shape);
		
		this.world.addBody(body);
		
		return body;
	}
	
	createCylinder(x, y, z, radiusTop, radiusBottom,  height, numSegments)
	{
		let shape = new CANNON.Cylinder(radiusTop, radiusBottom,  height, numSegments);
            
		let body = new CANNON.Body({
			material: this.mainMaterial,
			mass: 15 * this.scale,
			position: new CANNON.Vec3(x * this.scale, y * this.scale, z * this.scale), // m
		});
		body.addShape(shape);
		this.setAngle(body, -Math.PI * 0.5, 'x');

		this.world.addBody(body);

		return body;
	}
	
	remove(body)
	{
		this.world.remove(body);
	}
	
	tick()
	{
		this.world.step(1/60);
	}
}

export { Physics }
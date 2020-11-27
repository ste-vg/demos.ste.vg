import { 
	Scene, 
	Cache, 
	PerspectiveCamera, 
	Vector3, 
	DirectionalLight, 
	Mesh,
	PlaneBufferGeometry,
	MeshLambertMaterial,
	WebGLRenderer,
	BoxGeometry,
	HemisphereLight,
	Color,
	IcosahedronGeometry,
	CameraHelper
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';

interface View 
{
	left: number;
	width: number;
	top: number;
	height: number;
	color: Color | null;
	camera: null | PerspectiveCamera
}

export class Stage 
{
	private container: HTMLElement;
	private scene: Scene;
	private plane: Mesh;
	private renderer: WebGLRenderer;
	private width: number = 0;
	private height: number = 0;
	private lookAtHelper: Mesh;
    
	private stats:Stats;
	private views:View[] = [
        { left: 0, width: 1, top: 0, height: 1, color: null, camera: null },
		{ left: .8, width: .2, top: 0, height: .3, color: new Color(0xf3f3f3), camera: null }
	];
    
    public cameraTarget: Vector3;
    public camera: PerspectiveCamera;

	constructor()
	{        
		Cache.enabled = true;
		
		// SCENE
		
		this.scene = new Scene();
		// this.scene.background = new Color( 0xf3f3f3 );
		
		// Stats

		this.stats = Stats();
		document.body.appendChild( this.stats.dom );
		
		// LIGHTS
		
		this.scene.add( new HemisphereLight() );
		this.scene.add( new DirectionalLight() );
		
		// FLOOR
		
		this.plane = new Mesh(
			new PlaneBufferGeometry( 10, 10  ),
			new MeshLambertMaterial( { color: 0xffffff} )
        );
        this.scene.add( this.plane );

		// RENDERER
		
		this.renderer = new WebGLRenderer( { antialias: true, alpha: true } );
		
		// this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

		// CONTAINER
		
		this.container = document.getElementById( 'canvas-container' );
		this.container.appendChild( this.renderer.domElement );

		// CAMERA

		this.camera = new PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 5, 100  );
		this.cameraTarget = new Vector3( 0, 0, 0 );
        this.views[0].camera = this.camera;
        
        let center = new Vector3(0, 0, 0)
        const previewCameraDistance = 70;
        
        this.views[1].camera = new PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000  );
		this.views[1].camera.position.set(center.x + previewCameraDistance, center.y + previewCameraDistance, center.z + previewCameraDistance);				
		this.views[1].camera.lookAt(center);

        let orbitControl = new OrbitControls( this.views[1].camera,  document.getElementById('orbit-controls'));
        orbitControl.target.set(center.x, center.y, center.z);
        orbitControl.update();
 
        //HELPERS
		
		// var axisHelper = new AxesHelper( 5 );
        // this.scene.add( axisHelper );
        
		const helper = new CameraHelper( this.camera );
		this.scene.add( helper );

        this.lookAtHelper = this.createBall(0.5, new Color(0xff0000));
        
        //
		
		this.onResize();
	}
	
	setPlane(physicsPlane:any)
	{
		this.plane.position.copy(physicsPlane.position);
		this.plane.quaternion.copy(physicsPlane.quaternion);
	}

	render() 
	{
        this.camera.lookAt( this.cameraTarget );
        this.lookAtHelper.position.set(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
		
		for ( var i = 0; i < this.views.length; ++ i ) 
		{	
			var view = this.views[ i ];
			var camera = view.camera;

			const left = Math.floor( this.width * view.left );
			const bottom = Math.floor( this.height * view.top );
			const width = Math.floor( this.width * view.width );
			const height = Math.floor( this.height * view.height );

			this.renderer.setViewport( left, bottom, width, height );
			this.renderer.setScissor( left, bottom, width, height );
			this.renderer.setScissorTest(true);
			this.renderer.setClearColor(view.color ? view.color : 0, view.color ? 1 : 0);
			
			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			this.renderer.render( this.scene, camera );
		}

		this.stats.update();
	}
	
	onResize() 
	{
		// this.camera.aspect = window.innerWidth / window.innerHeight;
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		
		// this.renderer.setViewport( 0, 0, this.width, this.height );
		
		// this.renderer.setScissorTest( true );

		// this.camera.updateProjectionMatrix();
	
		// var vFOV = this.camera.fov * Math.PI / 180;        // convert vertical fov to radians
		// var height = 2 * Math.tan( vFOV / 2 ) * this.camera.position.z; // visible height
		var aspect = window.innerWidth / window.innerHeight;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}
	
	createBox(width:number, height:number, depth:number, wireframe:boolean = false, alpha:number = 1)
	{
		let geometry = new BoxGeometry( width, height, depth );
		let material = new MeshLambertMaterial( { color: 0xdd4466, wireframe: wireframe, opacity: alpha } );
		let mesh = new Mesh( geometry, material );
		// mesh.castShadow = true;
		// mesh.receiveShadow = true;
		this.scene.add(mesh);
		return mesh;
	}

	createBall(size:number, color?: Color)
	{
		let geometry = new IcosahedronGeometry(size, 4);
		let material = new MeshLambertMaterial( { color: color ? color : Math.random() * 0xffffff, wireframe: false } );
		let mesh = new Mesh( geometry, material );
		this.scene.add(mesh);
		return mesh;
	}
}
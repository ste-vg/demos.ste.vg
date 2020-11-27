import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Stage } from "./stage";

gsap.registerPlugin(ScrollTrigger);

function init()
{
	console.log('init()');

	let stage = new Stage();
	window.addEventListener( 'resize', () => { stage.onResize() }, false );

	function animate() 
	{
		stage.render();
		requestAnimationFrame( animate );
	}

	animate();
}

init();

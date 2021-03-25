import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { BackgroundGradient } from "./backgroundGradient";

class Stage
{
    constructor(domCanvasElement, topColor, bottomColor)
    {
        this.canvas = domCanvasElement
        this.scene = new THREE.Scene()

        this.sizes = {
            width: 0,
            height: 0
        }

        /**
         * Background Gradient
         */

        this.background = BackgroundGradient(bottomColor, topColor)
        this.scene.add(this.background)

        /**
         * Camera
         */
        
        this.camera = new THREE.PerspectiveCamera(30, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.set(0, 0, 6)
        this.scene.add(this.camera)

        // Controls
        // this.controls = new OrbitControls(this.camera, this.canvas)
        // this.controls.enableDamping = true

        /**
         * Camera Group
         */
        
        this.cameraGroup = new THREE.Group();
 
        this.scene.add(this.cameraGroup);

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: window.devicePixelRatio === 1 ? true : false
        })

        renderer.physicallyCorrectLights = true
        renderer.outputEncoding = THREE.sRGBEncoding
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1
        // renderer.sortObjects = false

        this.renderer = renderer

        window.addEventListener('resize', () => { this.onResize() })

        this.onResize()
        
    }

    onResize()
    {
        // Update sizes
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        if(this.sizes.width < 800) this.camera.position.z = 12
        else this.camera.position.z = 6

        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    add(item)
    {
        this.scene.add(item)
    }

    cameraAdd(item)
    {
        this.cameraGroup.add(item)
    }

    render(elapsedTime)
    {
        // this.controls.update()
        this.cameraGroup.position.copy(this.camera.position)
        this.cameraGroup.rotation.copy(this.camera.rotation)
        this.renderer.render(this.scene, this.camera)
    }
}

export { Stage };
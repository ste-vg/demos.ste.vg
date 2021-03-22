import * as THREE from 'three'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Stage } from "./stage";
import { Loader } from "./loader";
import { gsap } from "gsap"


// Debug
const gui = new dat.GUI()
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

/**
 * Stage
 */

const canvas = document.querySelector('canvas.webgl')
const stage = new Stage(canvas, '#ffffff', '#ffffff')
stage.controls.target = new THREE.Vector3(0, .5, 0)

/**
 * Loaders
 */

const loaderScreen = new Loader('black');
stage.add(loaderScreen.mesh);

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        const tl = gsap.timeline();
        tl.to(loaderScreen, {progress: 1, alpha: 0, duration: .5, ease: 'power4.inOut'}, 0)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // console.log('progress', itemUrl, itemsLoaded, itemsTotal)
    },

    // ERROR
    (err) =>
    {
        // console.log('err', err)
    }
)

const textureLoader = new THREE.TextureLoader(loadingManager)    

/**
 * Materials
 */

const textureLight = textureLoader.load('/textures/matcaps/1.png')

const materials = {
    'light': new THREE.MeshStandardMaterial({ material: textureLight }),
}


/**
 * Tick
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    stage.render(elapsedTime)
    // Call tick again on the next frame
    stats.end()
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Stage } from "./stage";
import { Photo } from "./photo";
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
const stage = new Stage(canvas, '#F1EBE4', '#D5C3AE')
// stage.controls.target = new THREE.Vector3(0, 0, 0)

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

        init();
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
 * Lights
 */

let envLight = new THREE.AmbientLight({color: 'white', intensity: 6})
stage.add(envLight)

let pointLight = new THREE.PointLight({color: 'white', intensity: 20})
pointLight.position.z = -1;
stage.add(pointLight)


/**
 * Materials
 */

 const images = [
     textureLoader.load('/images/photos/photo-1.jpg'),
     textureLoader.load('/images/photos/photo-2.jpg')
 ]
 let currentImage = -1;
 const textureRip = textureLoader.load('/images/rip.jpg')
 const textureBorder = textureLoader.load('/images/border.png')


/**
 * Paper
 */


const photos = [];
const mouseStart = new THREE.Vector2()
let mouseDown = false;
const extraImages = [
    '/images/photos/photo-3.jpg'
]
const postInitTextureLoader = new THREE.TextureLoader()    

const getMousePos = (x, y) =>
{
    return {
        x: (x / stage.sizes.width) * 2 - 1,
        y: - (y / stage.sizes.height) * 2 + 1
    }
}

const down = (x, y) => 
{
    if(photos.length && photos[0].interactive)
    {
        let pos = getMousePos(x, y);
        mouseStart.x = pos.x
        mouseStart.y = pos.y
        mouseDown = true;
    }
}

const move = (x, y) =>
{
    if(mouseDown && photos.length && photos[0].interactive)
    {
        let pos = getMousePos(x, y);
        let distanceY = mouseStart.y - pos.y

        photos[0].sheetSettings.tearAmount = 2 * distanceY
        photos[0].updateUniforms();
    }
}

const up = () => 
{
    if(mouseDown && photos.length && photos[0].interactive)
    {
        mouseDown = false;
        photos[0].completeRip();
        //gsap.to(sheetSettings, {tearAmount: 0, onUpdate: updateUniforms})
    }

}

const addNewPhoto = () => 
{
    currentImage++;
    if(currentImage >= images.length) currentImage = 0

    if(images.length - currentImage < 2 && extraImages.length) images.push(postInitTextureLoader.load(extraImages.pop()))

    mouseDown = false;

    let photo = new Photo(
        {
            photo: images[currentImage], 
            rip: textureRip, 
            border: textureBorder
        },
        () => addNewPhoto()
    );
    photos.unshift(photo);
    stage.add(photo.group);
}

const init = () => 
{
    addNewPhoto();

    window.addEventListener('mousedown', (event) => down(event.clientX, event.clientY))
    window.addEventListener('touchstart', (event) => down(event.touches[0].clientX, event.touches[0].clientY))
    window.addEventListener('mousemove', (event) => move(event.clientX, event.clientY))
    window.addEventListener('touchmove', (event) => move(event.touches[0].clientX, event.touches[0].clientY))
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
}



/**
 * Tick
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // rightSheet.rotation.x += 0.005

    stage.render(elapsedTime)
    // Call tick again on the next frame
    stats.end()
    window.requestAnimationFrame(tick)
}

tick()







/**
 * Mouse interaction
 */




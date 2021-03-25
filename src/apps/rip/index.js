import * as THREE from 'three'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Stage } from "./stage";
import { Photo } from "./photo";
import { Loader } from "./loader";
import { gsap } from "gsap"


// Debug
// const gui = new dat.GUI()
// const stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom)

let interacted = false;

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
     { 
        texture: textureLoader.load('/images/photos/photo-4.jpg'),
        colors: [[192,208,220], [217,190,174]]
     },
     {
        texture: textureLoader.load('/images/photos/photo-3.jpg'),
        colors: [[168,163,150], [218,180,141]]
     }
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
    { file: '/images/photos/photo-1.jpg', colors: [[208,229,224], [209,209,220]] },
    { file: '/images/photos/photo-2.jpg', colors: [[191,192,184], [217,200,170]] },
    { file: '/images/photos/photo-6.jpg', colors: [[217,226,233], [216,220,203]] },
    { file: '/images/photos/photo-7.jpg', colors: [[206,221,226], [219,213,222]] },
    { file: '/images/photos/photo-5.jpg', colors: [[199,199,210], [218,203,195]] },
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
        interacted = true;
        hideHand()
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

        photos[0].sheetSettings.tearAmount = Math.max(2 * distanceY, 0)
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

const loadExtraPhoto = () => 
{
    const nextImage = extraImages.shift()
    images.push({
        texture: postInitTextureLoader.load(nextImage.file),
        colors: nextImage.colors
    })
}

const addNewPhoto = () => 
{
    currentImage++;
    if(currentImage >= images.length) currentImage = 0

    if(images.length - currentImage < 2 && extraImages.length) loadExtraPhoto()

    mouseDown = false;

    const nextImage = images[currentImage]

    let photo = new Photo(
        {
            photo: nextImage.texture, 
            rip: textureRip, 
            border: textureBorder
        },
        () => addNewPhoto()
    );
    photos.unshift(photo);
    stage.add(photo.group);

    gsap.to(stage.background.material.uniforms.uColorB.value, {
        r: nextImage.colors[0][0] / 255,
        g: nextImage.colors[0][1] / 255,
        b: nextImage.colors[0][2] / 255,
        ease:'power4.inOut',
        duration: 1
    })
    gsap.to(stage.background.material.uniforms.uColorA.value, {
        r: nextImage.colors[1][0] / 255,
        g: nextImage.colors[1][1] / 255,
        b: nextImage.colors[1][2] / 255,
        ease:'power4.inOut',
        duration: 1
    })
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
    // stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // rightSheet.rotation.x += 0.005

    stage.render(elapsedTime)
    // Call tick again on the next frame
    // stats.end()
    window.requestAnimationFrame(tick)
}

tick()


const hand = document.getElementById('hand');
const downDuration = 2;
const upDuration = 0.7;

const hintAnimation = gsap.timeline({repeat: -1, defaults: {duration: downDuration, ease: 'power4.inOut'}});
hintAnimation.fromTo(hand, {y: '-100%'}, {y: '100%'})
hintAnimation.to(hand, {y: '-100%', duration: upDuration, motionPath: [{rotate: '-10'}, {rotate: '0'}]}, downDuration)
hintAnimation.to(hand, {rotate: '-25', scale: 1.1, duration: upDuration * 0.5, ease: 'power4.in'}, downDuration)
hintAnimation.to(hand, {rotate: '0', scale: 1, duration: upDuration * 0.5, ease: 'power4.out'}, downDuration + upDuration * 0.5)

hintAnimation.pause();


const showHand = () => 
{
    if(!interacted)
    {
        hintAnimation.play();
        gsap.to(hand, {opacity: 1})
    }
}

const hideHand = () => 
{
    gsap.to(hand, {opacity: 0, onComplete: () => hintAnimation.pause()})
}

setTimeout(() => showHand(), 5000)



/**
 * Mouse interaction
 */




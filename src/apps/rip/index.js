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
const stage = new Stage(canvas, 'pink', 'hotpink')
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

import ripVertexShader from './shaders/rip/vertex.glsl'
import ripFragmentShader from './shaders/rip/fragment.glsl'

/**
 * Materials
 */

 const textureLight = textureLoader.load('/images/photos/photo-1.jpg')
 const textureRip = textureLoader.load('/images/rip.jpg')


/**
 * Paper
 */

const width = 3;
const tearWidth = 0.3;

 const sheetSettings = {
    widthSegments: 30,
    heightSegments: 50,
    width: width,
    height: 2,
    tearAmount: 0.5,
    tearWidth: tearWidth,
    ripWhiteThreshold: 0.6,
    left: {
        uvOffset: 0,
        ripSide: 0,
        tearXAngle: -0.3,
        tearZAngle: 0.1,
        tearXOffset: -0.05,
        direction: -1,
        shadeColor: new THREE.Color('white'),
        shadeAmount: 0.6
    },
    right: {
        uvOffset: ((width - tearWidth) / width) * 0.5,
        ripSide: 1,
        tearXAngle: 0.5,
        tearZAngle: -0.1,
        tearXOffset: 0.05,
        direction: 1,
        shadeColor: new THREE.Color('black'),
        shadeAmount: 0.4
    }
}

console.log('offset', sheetSettings.right.uvOffset)

const sides = [
    {
        id: 'left',
        mesh: null
    },
    {
        id: 'right',
        mesh: null
    } 
]

// const ripShape = new Float32Array(sheetSettings.heightSegments)
// let ripShape = [];

// for(let i = 0; i < sheetSettings.heightSegments; i++)
// {
//     ripShape.push(Math.random() * 2 - 1)
// }

// console.log(ripShape)

const getRipMaterial = (side, seed) => {
    const material =  new THREE.ShaderMaterial({ 
        defines: {
            HEIGHT: sheetSettings.height,
            WIDTH: sheetSettings.width / 2,
            FULL_WIDTH: sheetSettings.width,
            HEIGHT_SEGMENTS: sheetSettings.heightSegments,
            WIDTH_SEGMENTS: sheetSettings.widthSegments,
        },
        uniforms: {
           uMap :           { value: textureLight },
           uRip :           { value: textureRip },
        //    uRipShape :      { value: ripShape },
           uRipSide :       { value: sheetSettings[side].ripSide},
           uRipSeed :       { value: seed},
           uTearWidth :     { value: sheetSettings.tearWidth},
           uWhiteThreshold: { value: sheetSettings.ripWhiteThreshold},
           uTearAmount:     { value: sheetSettings.tearAmount },
           uUvOffset:       { value: sheetSettings[side].uvOffset },
           uTearXAngle:     { value: sheetSettings[side].tearXAngle },
           uTearZAngle:     { value: sheetSettings[side].tearZAngle },
           uTearXOffset:    { value: sheetSettings[side].tearXOffset },
           uXDirection:     { value: sheetSettings[side].direction },
           uShadeColor:     { value: sheetSettings[side].shadeColor },
           uShadeAmount:    { value: sheetSettings[side].shadeAmount },
       },
    //    wireframe: true,
       transparent: true,
       
       vertexShader: ripVertexShader,
       fragmentShader: ripFragmentShader
    })

    // material.transparent = true

    return material;
}
const sheetPlane = new THREE.PlaneBufferGeometry(sheetSettings.width / 2 + sheetSettings.tearWidth / 2, sheetSettings.height, sheetSettings.widthSegments, sheetSettings.heightSegments);


const updateUniforms = () => 
{
    sides.forEach(side => 
    {
        const uniforms = side.mesh.material.uniforms
        uniforms.uTearAmount.value = sheetSettings.tearAmount
        uniforms.uUvOffset.value = sheetSettings[side.id].uvOffset;
        uniforms.uTearXAngle.value = sheetSettings[side.id].tearXAngle;
        uniforms.uTearZAngle.value = sheetSettings[side.id].tearZAngle;
        uniforms.uTearXOffset.value = sheetSettings[side.id].tearXOffset;
        uniforms.uXDirection.value = sheetSettings[side.id].direction;
        uniforms.uShadeColor.value = sheetSettings[side.id].shadeColor;
        uniforms.uShadeAmount.value = sheetSettings[side.id].shadeAmount;
        uniforms.uWhiteThreshold.value = sheetSettings.ripWhiteThreshold;
    })
}

gui.add(sheetSettings, 'tearAmount', 0, 2, 0.001).onChange(updateUniforms)
gui.add(sheetSettings, 'ripWhiteThreshold', 0, 1, 0.001).onChange(updateUniforms)

const ripSeed = Math.random();
sides.forEach(side => 
{
    side.mesh = new THREE.Mesh( sheetPlane, getRipMaterial(side.id, ripSeed))
    if(sheetSettings[side.id].tearXAngle > 0)
    {
        side.mesh.position.z += 0.0001
        // side.mesh.position.y += 0.1
    }
    stage.add(side.mesh);

    const sideGui = gui.addFolder(side.id);
    sideGui.add(sheetSettings[side.id], 'tearXAngle', -Math.PI, Math.PI, 0.001).onChange(updateUniforms)
    sideGui.add(sheetSettings[side.id], 'tearZAngle', -1, 1, 0.001).onChange(updateUniforms)
    sideGui.add(sheetSettings[side.id], 'tearXOffset', -1, 1, 0.001).onChange(updateUniforms)
    sideGui.add(sheetSettings[side.id], 'direction', -1, 1, 0.001).onChange(updateUniforms)
    sideGui.add(sheetSettings[side.id], 'shadeAmount', 0, 1, 0.001).onChange(updateUniforms)
   
})




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
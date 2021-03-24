import * as THREE from 'three'
import ripVertexShader from './shaders/rip/vertex.glsl'
import ripFragmentShader from './shaders/rip/fragment.glsl'
import { gsap } from "gsap"

class Photo
{
    constructor(textures, destoryCallback)
    {
        this.destroyCallback = destoryCallback
        this.photoTexture = textures.photo;
        this.borderTexture = textures.border;
        this.ripTexture = textures.rip;
        this.interactive = false;

        this.group = new THREE.Group();
        this.group.rotation.z = (Math.random() * 2 - 1) * Math.PI
        this.group.position.y = 10

        setTimeout(() => {
            this.interactive = true
        }, 400)

        const introAnimation = gsap.timeline({
            delay: 0.3, 
            defaults: {
                duration: 0.8,
                ease: 'power3.out'
            }
        })
        introAnimation.to(this.group.rotation, {z: 0}, 0)
        introAnimation.to(this.group.position, {y: 0}, 0)

        const width = 3;
        const tearWidth = 0.3;

        this.sheetSettings = {
            widthSegments: 30,
            heightSegments: 50,
            tearOffset: Math.random(),
            width: width,
            height: 2,
            tearAmount: 0,
            tearWidth: tearWidth,
            ripWhiteThreshold: 0.6,
            left: {
                uvOffset: 0,
                ripSide: 0,
                tearXAngle: -0.01,
                tearYAngle: -0.1,
                tearZAngle: 0.05,
                tearXOffset: 0,
                direction: -1,
                shadeColor: new THREE.Color('white'),
                shadeAmount: 0.2
            },
            right: {
                uvOffset: ((width - tearWidth) / width) * 0.5,
                ripSide: 1,
                tearXAngle: 0.2,
                tearYAngle: 0.1,
                tearZAngle: -0.1,
                tearXOffset: 0,
                direction: 1,
                shadeColor: new THREE.Color('black'),
                shadeAmount: 0.4
            }
        }

        this.sides = [
            {
                id: 'left',
                mesh: null,
                material: null
            },
            {
                id: 'right',
                mesh: null,
                material: null
            } 
        ]

        this.sheetPlane = new THREE.PlaneBufferGeometry(this.sheetSettings.width / 2 + this.sheetSettings.tearWidth / 2, this.sheetSettings.height, this.sheetSettings.widthSegments, this.sheetSettings.heightSegments);

        this.sides.forEach(side => 
        {
            side.material = this.getRipMaterial(side.id)
            side.mesh = new THREE.Mesh( this.sheetPlane, side.material)
            
            if(this.sheetSettings[side.id].tearXAngle > 0)
            {
                side.mesh.position.z += 0.0001
            }
            this.group.add(side.mesh);
        })

        
    }

    getRipMaterial(side) 
    {
        const material =  new THREE.ShaderMaterial({ 
            defines: {
                HEIGHT:             this.sheetSettings.height,
                WIDTH:              this.sheetSettings.width / 2,
                FULL_WIDTH:         this.sheetSettings.width,
                HEIGHT_SEGMENTS:    this.sheetSettings.heightSegments,
                WIDTH_SEGMENTS:     this.sheetSettings.widthSegments,
            },
            uniforms: {
               uMap :               { value: this.photoTexture },
               uRip :               { value: this.ripTexture },
               uBorder :            { value: this.borderTexture },
               uRipSide :           { value: this.sheetSettings[side].ripSide },
               uTearWidth :         { value: this.sheetSettings.tearWidth },
               uWhiteThreshold:     { value: this.sheetSettings.ripWhiteThreshold },
               uTearAmount:         { value: this.sheetSettings.tearAmount },
               uTearOffset:         { value: this.sheetSettings.tearOffset },
               uUvOffset:           { value: this.sheetSettings[side].uvOffset },
               uTearXAngle:         { value: this.sheetSettings[side].tearXAngle },
               uTearYAngle:         { value: this.sheetSettings[side].tearYAngle },
               uTearZAngle:         { value: this.sheetSettings[side].tearZAngle },
               uTearXOffset:        { value: this.sheetSettings[side].tearXOffset },
               uXDirection:         { value: this.sheetSettings[side].direction },
               uShadeColor:         { value: this.sheetSettings[side].shadeColor },
               uShadeAmount:        { value: this.sheetSettings[side].shadeAmount },
           },
           transparent: true,
           vertexShader: ripVertexShader,
           fragmentShader: ripFragmentShader
        })
    
        return material;
    }

    shouldCompleteRip()
    {
        return this.sheetSettings.tearAmount >= 1.5;
    }

    updateUniforms()
    {
        if(this.interactive && this.shouldCompleteRip())
        {
            this.remove();
        }
        else
        {
            if(this.sheetSettings.tearAmount === 0) this.sheetSettings.tearOffset = Math.random();
            this.sides.forEach(side => 
            {
                const uniforms = side.mesh.material.uniforms

                uniforms.uTearAmount.value =        this.sheetSettings.tearAmount
                uniforms.uTearOffset.value =        this.sheetSettings.tearOffset
                uniforms.uUvOffset.value =          this.sheetSettings[side.id].uvOffset;
                uniforms.uTearXAngle.value =        this.sheetSettings[side.id].tearXAngle;
                uniforms.uTearYAngle.value =        this.sheetSettings[side.id].tearYAngle;
                uniforms.uTearZAngle.value =        this.sheetSettings[side.id].tearZAngle;
                uniforms.uTearXOffset.value =       this.sheetSettings[side.id].tearXOffset;
                uniforms.uXDirection.value =        this.sheetSettings[side.id].direction;
                uniforms.uShadeColor.value =        this.sheetSettings[side.id].shadeColor;
                uniforms.uShadeAmount.value =       this.sheetSettings[side.id].shadeAmount;
                uniforms.uWhiteThreshold.value =    this.sheetSettings.ripWhiteThreshold;
            })
        }
        
    }

    completeRip()
    {
        if(this.sheetSettings.tearAmount >= 1) this.remove()
        else this.reset()
    }

    reset()
    {
        gsap.to(this.sheetSettings, {tearAmount: 0, onUpdate: () => this.updateUniforms()})
    }

    remove()
    {
        this.interactive = false
        this.destroyCallback()
        const removeAnimation = gsap.timeline({ defaults: {duration: 1, ease: 'power2.in'}, onComplete: () => this.destroyMe() });
        removeAnimation.to(this.sheetSettings, {tearAmount: 1.5 + Math.random() * 1.5, ease: 'power2.out', onUpdate: () => this.updateUniforms()})
        removeAnimation.to(this.group.position, {z: 1}, 0)

        this.sides.forEach(side => 
        {
            removeAnimation.to(side.mesh.position, {y: -3 + (Math.random() * -3), x: (2 + (Math.random() * 3)) * (this.sheetSettings[side.id].ripSide - 0.5) }, 0)
            removeAnimation.to(side.mesh.rotation, {z: (-2 + Math.random() * -3) * (this.sheetSettings[side.id].ripSide - 0.5) }, 0)
        })
    }

    destroyMe()
    {
        this.sheetPlane.dispose()
        this.sides.forEach(side => 
        {
            side.material.dispose()
            this.group.remove(side.mesh)
        })
    }
}

export { Photo };
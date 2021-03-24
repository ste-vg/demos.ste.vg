import * as THREE from 'three'

class Loader
{
    constructor (color = 'black', shadow = "white", size = 1)
    {
        this.mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2,2,1,1),
            new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(color) },
                uColorShadow: { value: new THREE.Color(shadow) },
                uProgress: { value: 0 },
                uAlpha: { value: 1 },
                uNoiseSize: { value: size }
            },
            vertexShader: `
        
                
                void main(){
             
                    gl_Position = vec4(position.xy, 0.5, 1.);
                }
                `,
            fragmentShader: `

                uniform vec3 uColor;
                uniform float uAlpha;
            
                void main () {
                    gl_FragColor = vec4(uColor, uAlpha);
                }
            `,
            transparent: true,
            depthTest: false
            })
        )    
    }

    get progress()
    {
        return this.mesh.material.uniforms.uProgress.value;
    }

    set progress(newValue)
    {
        this.mesh.material.uniforms.uProgress.value = newValue;
    }

    get alpha()
    {
        return this.mesh.material.uniforms.uAlpha.value;
    }

    set alpha(newValue)
    {
        this.mesh.material.uniforms.uAlpha.value = newValue;
    }
    
    get noiseSize()
    {
        return this.mesh.material.uniforms.uNoiseSize.value;
    }

    set noiseSize(newValue)
    {
        this.mesh.material.uniforms.uNoiseSize.value = newValue;
    }
}

export { Loader }
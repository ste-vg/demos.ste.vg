uniform sampler2D uMap;
uniform vec3 uShadeColor;
uniform float uUvOffset;
uniform float uShadeAmount;
// uniform float[HEIGHT_SEGMENTS] rip;

varying vec2 vUv;
varying float vAmount;

void main () {

    vec2 uvOffset = vec2(vUv.x * 0.5 + uUvOffset, vUv.y);
    vec4 textureColor = texture2D(uMap, uvOffset);
    
    // gl_FragColor = mix(vec4(uvOffset, 1.0, 1.0), vec4(uShadeColor, 1.0), vAmount);
    gl_FragColor = mix(textureColor, vec4(uShadeColor, 1.0), vAmount * uShadeAmount);
}
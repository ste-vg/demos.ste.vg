uniform sampler2D uMap;
uniform vec3 uShadeColor;
uniform float uUvOffset;
uniform float uShadeAmount;
uniform float uTearWidth;

varying vec2 vUv;
varying float vAmount;

void main () {

    float xScale = (float(WIDTH) - (uTearWidth * 0.5)) / float(FULL_WIDTH);
    vec2 uvOffset = vec2(vUv.x * xScale + uUvOffset, vUv.y);
    vec4 textureColor = texture2D(uMap, uvOffset);
    
    // gl_FragColor = mix(vec4(uvOffset, 1.0, 1.0), vec4(uShadeColor, 1.0), vAmount);
    gl_FragColor = mix(textureColor, vec4(uShadeColor, 1.0), vAmount * uShadeAmount);
}
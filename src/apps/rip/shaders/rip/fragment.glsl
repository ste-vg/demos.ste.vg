uniform sampler2D uMap;
uniform sampler2D uRip;
uniform vec3 uShadeColor;
uniform float uUvOffset;
uniform float uRipSide;
uniform float uShadeAmount;
uniform float uTearWidth;
uniform float uWhiteThreshold;

varying vec2 vUv;
varying float vAmount;

void main () {

    float ripAmount = -1.0;
    float width = float(WIDTH);
    float widthOverlap = uTearWidth * 0.5 + width;

    float xScale = widthOverlap / float(FULL_WIDTH);
    vec2 uvOffset = vec2(vUv.x * xScale + uUvOffset, vUv.y);
    vec4 textureColor = texture2D(uMap, uvOffset);

    float ripRange = uTearWidth / widthOverlap;
    float ripStart = uRipSide == 1.0 ? 0.0 : 1.0 - ripRange;//width / widthOverlap * (1.0 - uRipSide);
    float alpha = vUv.x < 0.001 || vUv.x > 0.999 ? 0.0 : 1.0;
    // float alpha = 1.0;
    if(vUv.x >= ripStart && vUv.x <= (ripStart + ripRange)) 
    {
        float ripX = (vUv.x - ripStart) / ripRange;
        vec4 ripCut = texture2D(uRip, vec2(ripX, vUv.y * 0.5));
        vec4 ripColor = texture2D(uRip, vec2(ripX * 0.9, vUv.y * 0.5 - 0.02));

        float whiteness = dot(vec4(1.0, 1.0, 1.0, 0.0), ripCut) / 3.0;
        
        if (uRipSide == 0.0 && whiteness < uWhiteThreshold)
        {
            whiteness = dot(vec4(1.0, 1.0, 1.0, 0.0), ripColor) / 3.0;
            if(whiteness >= uWhiteThreshold) textureColor = ripColor;
            else alpha = 0.0;
        } 
        if (uRipSide == 1.0 && whiteness >= uWhiteThreshold) alpha = 0.0;
        
    }

    gl_FragColor = mix(vec4(textureColor.rgb, alpha), vec4(uShadeColor, alpha), vAmount * uShadeAmount);
}
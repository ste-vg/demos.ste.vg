uniform sampler2D uMap;
uniform sampler2D uRip;
uniform sampler2D uBorder;

uniform vec3 uShadeColor;
uniform float uUvOffset;
uniform float uRipSide;
uniform float uTearXAngle;
uniform float uShadeAmount;
uniform float uTearWidth;
uniform float uWhiteThreshold;
uniform float uTearOffset;

varying vec2 vUv;
varying float vAmount;

void main () {

    bool rightSide = uRipSide == 1.0;
    float ripAmount = -1.0;
    float width = float(WIDTH);
    float widthOverlap = (uTearWidth * 0.5) + width;

    bool frontSheet = uTearXAngle > 0.0;

    float xScale = widthOverlap / float(FULL_WIDTH);
    vec2 uvOffset = vec2(vUv.x * xScale + uUvOffset, vUv.y);
    vec4 textureColor = texture2D(uMap, uvOffset);
    vec4 borderColor = texture2D(uBorder, uvOffset);
    if(borderColor.r > 0.0) textureColor = vec4(vec3(0.95), 1.0);

    float ripRange = uTearWidth / widthOverlap;
    float ripStart = rightSide ? 0.0 : 1.0 - ripRange;

    float alpha = 1.0;
   
    float ripX = (vUv.x - ripStart) / ripRange;
    float ripY = vUv.y * 0.5 + (0.5 * uTearOffset);
    vec4 ripCut = texture2D(uRip, vec2(ripX, ripY));
    vec4 ripColor = texture2D(uRip, vec2(ripX * 0.9, ripY - 0.02));

    float whiteness = dot(vec4(1.0), ripCut) / 4.0;
    
    if (!rightSide && whiteness <= uWhiteThreshold)
    {
        whiteness = dot(vec4(1.0), ripColor) / 4.0;
        if(whiteness >= uWhiteThreshold) textureColor = ripColor;
        else alpha = 0.0;
    } 
    if (rightSide && whiteness >= uWhiteThreshold) alpha = 0.0;
    
    gl_FragColor = mix(vec4(textureColor.rgb, alpha), vec4(uShadeColor, alpha), vAmount * uShadeAmount);
}
 #pragma glslify: noise = require('glsl-noise/simplex/2d')

uniform float uTearAmount;
uniform float uTearXAngle;
uniform float uTearZAngle;
uniform float uTearXOffset;
uniform float uXDirection;
uniform float uRipSide;
uniform float uRipSeed;

varying vec2 vUv;
varying float vAmount;

mat4 rotationX( in float angle ) {
	return mat4(	1.0,		0,			0,			0,
			 		0, 	cos(angle),	-sin(angle),		0,
					0, 	sin(angle),	 cos(angle),		0,
					0, 			0,			  0, 		1);
}

mat4 rotationY( in float angle ) {
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}

mat4 rotationZ( in float angle ) {
	return mat4(	cos(angle),		-sin(angle),	0,	0,
			 		sin(angle),		cos(angle),		0,	0,
							0,				0,		1,	0,
							0,				0,		0,	1);
}

void main(){
    
    float rip = noise(vec2(position.y * 10.0, uRipSeed));
    float ripAmount = (0.02 * rip) * ((uRipSide - uv.x) * uXDirection);
    float yAmount = max(0.0, (uTearAmount - (1.0 - uv.y)));
    float zRotate = uTearZAngle * yAmount;
    float xRotate = uTearXAngle * yAmount;
    vec3 rotation = vec3(xRotate, 0.0, zRotate);


    float halfHeight = float(HEIGHT) * 0.5;
    float halfWidth = float(WIDTH) * 0.5;
    vec4 vertex = vec4(position.x + (halfWidth * uXDirection), position.y + halfHeight, position.z, 1.0);
    
    vertex = vertex * rotationX(rotation.x * yAmount )  * rotationZ(rotation.z * yAmount );
    vertex.x += uTearXOffset * yAmount + ripAmount ;
    vertex.y -= halfHeight;
    vec4 modelPosition = modelMatrix * vertex;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;

    vUv = uv;
    vAmount = yAmount;
}
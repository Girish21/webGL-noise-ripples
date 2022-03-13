uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;

varying vec2 vUv;

#define PI 3.141592653589793238;

void main() {
  vec4 displacement = texture2D(uDisplacement, vUv);
  float theta = displacement.r * 2. * PI;
  vec2 dir = vec2(sin(theta), cos(theta));

  vec2 uv = vUv + dir * displacement.r * .05;

  vec4 color = texture2D(uTexture, uv);

  gl_FragColor = color;
}

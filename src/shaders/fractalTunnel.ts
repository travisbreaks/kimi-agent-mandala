export const tunnelVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const tunnelFragmentShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uResolution;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uPulse;
  uniform vec2 uPointer;

  varying vec2 vUv;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  // Complex number operations
  vec2 cmul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }

  vec2 cpow(vec2 z, float n) {
    float r = length(z);
    float theta = atan(z.y, z.x);
    return pow(r, n) * vec2(cos(n * theta), sin(n * theta));
  }

  // Kaleidoscope effect
  vec2 kaleidoscope(vec2 uv, float segments) {
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float segmentAngle = TAU / segments;
    angle = mod(angle, segmentAngle);
    angle = abs(angle - segmentAngle * 0.5);
    return vec2(cos(angle), sin(angle)) * radius;
  }

  // Fractal pattern
  float fractalPattern(vec2 uv, float time) {
    vec2 z = uv * 2.0;
    vec2 c = vec2(cos(time * 0.3) * 0.5, sin(time * 0.2) * 0.5);

    float iter = 0.0;
    const float maxIter = 30.0;

    for (float i = 0.0; i < maxIter; i++) {
      if (dot(z, z) > 4.0) break;
      z = cmul(z, z) + c;
      iter++;
    }

    return iter / maxIter;
  }

  // Tunnel depth effect
  float tunnelDepth(vec2 uv, float time) {
    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x);

    float depth = 0.0;
    float scale = 1.0;

    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float t = time * (0.5 + fi * 0.1);

      float ring = sin(r * 10.0 * scale - t * 3.0) * 0.5 + 0.5;
      float spiral = sin(a * 6.0 + r * 5.0 - t * 2.0) * 0.5 + 0.5;

      depth += ring * spiral * scale;
      scale *= 0.7;
    }

    return depth / 3.0;
  }

  // Color palette
  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.8, 0.3, 0.9);

    return a + b * cos(TAU * (c * t + d));
  }

  void main() {
    // Only show tunnel after 50% scroll
    float tunnelAlpha = smoothstep(0.5, 0.6, uScrollProgress);

    vec2 uv = vUv;
    vec2 center = uv - 0.5 + uPointer * uHover * 0.06;

    // Aspect ratio correction
    center.x *= uResolution.x / uResolution.y;

    // Tunnel zoom effect based on scroll (accelerates during tunnel phase)
    float tunnelBoost = smoothstep(0.85, 0.95, uScrollProgress);
    float zoom = 1.0 + (uScrollProgress - 0.5) * 4.0 + uVelocity * 0.5 + tunnelBoost * 3.0;
    center *= zoom;

    // Apply kaleidoscope
    vec2 kUV = kaleidoscope(center, 8.0);

    // Create tunnel layers
    float time = uTime * (0.5 + uVelocity * 0.3);

    // Layer 1: Base tunnel
    float tunnel1 = tunnelDepth(kUV * 0.5 + 0.5, time);

    // Layer 2: Fractal pattern
    float fractal = fractalPattern(kUV, time * 0.5);

    // Layer 3: Rotating rings
    float r = length(center);
    float a = atan(center.y, center.x);
    float rings = sin(r * 15.0 - time * 4.0) * 0.5 + 0.5;
    float spirals = sin(a * 12.0 + r * 8.0 - time * 3.0) * 0.5 + 0.5;

    // Combine layers
    float pattern = tunnel1 * 0.4 + fractal * 0.3 + rings * spirals * 0.3;

    // Color based on pattern and angle
    vec3 color1 = palette(pattern + time * 0.1);
    vec3 color2 = palette(fract(a / TAU * 3.0) + time * 0.15);

    vec3 finalColor = mix(color1, color2, rings);

    // Add glow at center
    float centerGlow = exp(-r * 3.0) * (0.5 + 0.5 * sin(time * 5.0));
    finalColor += vec3(1.0, 0.8, 0.9) * centerGlow * 0.5;

    // Add outer rim light
    float rim = smoothstep(0.0, 0.5, r) * 0.3;
    finalColor += palette(time * 0.2) * rim;

    // Vignette
    float vignette = 1.0 - smoothstep(0.3, 1.2, r);
    finalColor *= vignette;

    // Interaction burst
    float pulse = uPulse * exp(-r * 3.0);
    finalColor += vec3(0.2, 0.9, 0.8) * pulse;

    // Brightness boost (intensifies during tunnel phase)
    finalColor *= 1.4 + uVelocity * 0.6 + tunnelBoost * 1.0;

    gl_FragColor = vec4(finalColor, tunnelAlpha);
  }
`

export const sandVertexShader = `
  attribute float aScale;
  attribute vec3 aColor;
  attribute vec3 aTargetPosition;
  attribute vec3 aStartPosition;
  attribute float aPhase;

  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uExplosion;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uPulse;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vNoise;
  varying float vBuildAlpha;
  varying float vTunnelPhase;
  varying float vWorldZ;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Compute cylindrical tunnel position for a particle
  vec3 getTunnelPosition(float phase, float scale, float zOff) {
    float angle = phase * 6.28318;
    float radius = 1.8 + fract(scale * 7.0) * 1.2;
    float baseZ = fract(phase * 13.37) * 26.0;
    float zPos = mod(baseZ + zOff, 26.0) - 20.0;
    float twist = zPos * 0.08 + uTime * 0.3;
    return vec3(cos(angle + twist) * radius, sin(angle + twist) * radius, zPos);
  }

  void main() {
    vUv = uv;
    vColor = aColor;

    // Calculate noise for grain variation
    float noise = snoise(position * 50.0 + uTime * 0.1);
    vNoise = noise;

    vec3 finalPosition;
    vTunnelPhase = 0.0;
    vBuildAlpha = 1.0;

    if (uScrollProgress < 0.5) {
      // ===== BUILD PHASE (0-50%) — fly-in from off-screen to mandala =====
      float t = uScrollProgress * 2.0;
      float easedT = 1.0 - pow(1.0 - t, 3.0);

      float staggerWindow = 0.3;
      float pStart = aPhase * staggerWindow;
      float pEnd = pStart + (1.0 - staggerWindow);
      float pT = clamp((t - pStart) / (pEnd - pStart), 0.0, 1.0);
      float easedPT = 1.0 - pow(1.0 - pT, 3.0);

      finalPosition = mix(aStartPosition, aTargetPosition, easedPT);
      vBuildAlpha = smoothstep(0.0, 0.15, pT);

    } else if (uScrollProgress < 0.75) {
      // ===== EXPLOSION PHASE (50-75%) — blast outward with spiral =====
      float t = (uScrollProgress - 0.5) / 0.25;
      float easedT = pow(t, 2.0);

      vec3 explosionDir = normalize(aTargetPosition + vec3(0.0001));
      float explosionDist = 15.0 * easedT * (1.0 + aPhase * 2.0);
      finalPosition = aTargetPosition + explosionDir * explosionDist;

      // Spiral rotation
      float spiralAngle = easedT * 3.14159 * 2.0;
      float cosS = cos(spiralAngle);
      float sinS = sin(spiralAngle);
      mat2 rot = mat2(cosS, -sinS, sinS, cosS);
      finalPosition.xz = rot * finalPosition.xz;

    } else if (uScrollProgress < 0.85) {
      // ===== CONVERGENCE PHASE (75-85%) — sucked into tunnel cylinder =====
      float t = (uScrollProgress - 0.75) / 0.10;
      float easedT = t * t * (3.0 - 2.0 * t); // smoothstep ease

      // Explosion end position (explosion at t=1, spiral = full 2π = identity)
      vec3 explosionDir = normalize(aTargetPosition + vec3(0.0001));
      float explosionDist = 15.0 * (1.0 + aPhase * 2.0);
      vec3 explosionEnd = aTargetPosition + explosionDir * explosionDist;

      // Tunnel target position (cylindrical)
      vec3 tunnelPos = getTunnelPosition(aPhase, aScale, 0.0);

      // Smooth blend: explosion end → tunnel cylinder
      finalPosition = mix(explosionEnd, tunnelPos, easedT);
      vTunnelPhase = easedT;

    } else {
      // ===== TUNNEL PHASE (85-100%) — infinite rush via Z-modulo recycling =====
      float tunnelT = (uScrollProgress - 0.85) / 0.15;
      finalPosition = getTunnelPosition(aPhase, aScale, tunnelT * 40.0);
      vTunnelPhase = 1.0;
    }

    // World Z for distance fog in fragment shader
    vWorldZ = finalPosition.z;

    // Interaction effects (dampened during tunnel phase)
    float interactionMix = 1.0 - vTunnelPhase;
    float velocityBoost = uVelocity * 0.4;
    float pulseBoost = uPulse * 0.6;
    finalPosition.xy += uPointer * uHover * (0.06 + noise * 0.02) * interactionMix;
    finalPosition *= (1.0 + pulseBoost * 0.05 * interactionMix);

    // Subtle floating (dampened during tunnel)
    finalPosition.y += sin(uTime * 0.3 + aPhase * 10.0) * (0.015 + velocityBoost * 0.03) * interactionMix;

    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation — tiny grains for sand resolution
    float sizeVar = 1.0 + noise * 0.15;
    float distance = max(1.0, -mvPosition.z);
    gl_PointSize = aScale * sizeVar * (1.0 + pulseBoost * 0.5) * (25.0 / distance);
  }
`

export const sandFragmentShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uPulse;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vNoise;
  varying float vBuildAlpha;
  varying float vTunnelPhase;
  varying float vWorldZ;

  // Hash noise for grain shape distortion
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Grain noise function
  float grain(vec2 uv, float intensity) {
    vec2 coord = uv * 300.0;
    float g = fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
    return (g - 0.5) * intensity;
  }

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // Irregular grain shape — noise-distorted edge
    float edgeNoise = hash(gl_PointCoord * 7.0 + vNoise) * 0.12
                    + hash(gl_PointCoord * 13.0) * 0.06;
    float edgeThreshold = 0.38 + edgeNoise;

    if (dist > edgeThreshold) discard;

    // Crisp edge with slight softness
    float alpha = 0.9 * (1.0 - smoothstep(edgeThreshold - 0.06, edgeThreshold, dist));

    // --- 3D SPHERE LIGHTING ---
    // Treat each grain as a tiny hemisphere
    // Map gl_PointCoord to sphere surface normal
    vec2 uv = (gl_PointCoord - 0.5) * 2.0; // -1 to 1
    float r2 = dot(uv, uv);
    // Clamp inside sphere radius (accounting for irregular edge)
    float sphereR = edgeThreshold * 2.0;
    float normR2 = r2 / (sphereR * sphereR);
    float sz = sqrt(max(0.0, 1.0 - normR2));
    vec3 normal = normalize(vec3(uv, sz));

    // Perturb normal with grain texture for roughness
    float grain1 = grain(gl_PointCoord * 8.0 + uTime * 0.005, 0.3);
    float grain2 = grain(gl_PointCoord * 20.0, 0.2);
    normal.xy += vec2(grain1, grain2) * 0.15;
    normal = normalize(normal);

    // Warm top-right key light
    vec3 lightDir = normalize(vec3(0.4, 0.7, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);

    // Soft fill light from bottom-left (prevents pure black shadows)
    vec3 fillDir = normalize(vec3(-0.3, -0.5, 0.6));
    float fill = max(dot(normal, fillDir), 0.0) * 0.3;

    // Specular highlight — sharp glint like light catching a sand grain
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 24.0);

    // Combine lighting
    float ambient = 0.25;
    float lighting = ambient + diffuse * 0.6 + fill;

    // Base color from palette with subtle per-grain hue shift
    float hueShift = (hash(vec2(vNoise, vNoise * 0.7)) - 0.5) * 0.08;
    vec3 baseColor = vColor + vec3(hueShift, -hueShift * 0.5, hueShift * 0.3);

    // Apply lighting to color
    vec3 finalColor = baseColor * lighting;

    // Add specular as white highlight
    finalColor += vec3(0.9, 0.85, 0.7) * spec * 0.5;

    // Occasional bright sparkle — rare sand grain catching direct light
    float sparkle = step(0.975, hash(gl_PointCoord * 50.0 + vNoise));
    finalColor += vec3(0.4, 0.35, 0.25) * sparkle;

    // Interaction effects (dampened during tunnel)
    float interactionMix = 1.0 - vTunnelPhase;
    finalColor += vec3(0.6, 0.45, 0.15) * uVelocity * 0.15 * interactionMix;
    finalColor += vec3(0.15, 0.6, 0.5) * uPulse * 0.25 * interactionMix;
    finalColor = mix(finalColor, finalColor * vec3(1.08, 1.08, 1.2), uHover * 0.1 * interactionMix);

    // Cosmic tint during tunnel phase (cool blue shift)
    finalColor = mix(finalColor, finalColor * vec3(0.8, 0.95, 1.2), vTunnelPhase * 0.4);

    // Phase-aware alpha (replaces old explosionFade)
    float phaseFade = 1.0;
    if (uScrollProgress >= 0.5 && uScrollProgress < 0.75) {
      // Explosion: slight dim but don't kill
      float t = (uScrollProgress - 0.5) / 0.25;
      phaseFade = 1.0 - t * 0.3;
    } else if (uScrollProgress >= 0.75 && uScrollProgress < 0.85) {
      // Convergence: fade back up
      float t = (uScrollProgress - 0.75) / 0.10;
      phaseFade = 0.7 + t * 0.3;
    } else if (uScrollProgress >= 0.85) {
      // Tunnel: distance fog hides recycling seam
      float farFade = smoothstep(-20.0, -8.0, vWorldZ);
      float nearFade = 1.0 - smoothstep(2.0, 5.0, vWorldZ);
      phaseFade = farFade * nearFade;
    }

    gl_FragColor = vec4(finalColor, alpha * phaseFade * vBuildAlpha);
  }
`

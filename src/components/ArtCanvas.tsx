import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, OrbitControlsChangeEvent } from '@react-three/drei'
import { useRelativityStore } from '@/store/relativityStore'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { calculateGamma, calculateDopplerFactor } from '@/lib/physics'
import { PhysicsExplanationPopup } from './PhysicsExplanationPopup'

const ArtPlane = () => {
  const { currentArt, velocityX, velocityY } = useRelativityStore()
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { camera } = useThree()
  const [highResTexture, setHighResTexture] = useState<THREE.Texture | null>(null)
  
  // Create a custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: null },
        velocityX: { value: 0 },
        velocityY: { value: 0 },
        gamma: { value: 1 },
        doppler: { value: 1 },
        directionX: { value: 0 },
        directionY: { value: 0 },
        zoomLevel: { value: 1 },
        highResMap: { value: null },
        useHighRes: { value: false }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform sampler2D highResMap;
        uniform float velocityX;
        uniform float velocityY;
        uniform float gamma;
        uniform float doppler;
        uniform float directionX;
        uniform float directionY;
        uniform float zoomLevel;
        uniform bool useHighRes;
        varying vec2 vUv;
        
        // RGB to HSV conversion
        vec3 rgb2hsv(vec3 c) {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
        
        // HSV to RGB conversion
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        // Color correction function
        vec3 colorCorrect(vec3 color, float zoom) {
          // Increase saturation at higher zoom levels
          float saturationBoost = 1.0 + (zoom - 1.0) * 0.2;
          // Enhance contrast at higher zoom levels
          float contrastBoost = 1.0 + (zoom - 1.0) * 0.1;
          
          // Apply contrast
          color = (color - 0.5) * contrastBoost + 0.5;
          
          // Convert to HSV for saturation adjustment
          vec3 hsv = rgb2hsv(color);
          hsv.y = clamp(hsv.y * saturationBoost, 0.0, 1.0);
          
          // Convert back to RGB
          return hsv2rgb(hsv);
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Check if the UV is out of bounds
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            return;
          }
          
          // Sample the appropriate texture based on zoom level
          vec4 texColor;
          if (useHighRes && zoomLevel > 2.0) {
            texColor = texture2D(highResMap, uv);
          } else {
            texColor = texture2D(map, uv);
          }
          
          // Convert to HSV
          vec3 hsv = rgb2hsv(texColor.rgb);
          
          // Apply Doppler effect to hue
          float hueShift = 10.0 * log(doppler) / 360.0;
          hsv.x = mod(hsv.x + hueShift, 1.0);
          
          // Apply brightness boost (beaming)
          hsv.z = min(hsv.z * doppler, 1.0);
          
          // Convert back to RGB
          vec3 finalColor = hsv2rgb(hsv);
          
          // Apply color correction based on zoom level
          finalColor = colorCorrect(finalColor, zoomLevel);
          
          gl_FragColor = vec4(finalColor, texColor.a);
        }
      `,
      transparent: true,
    });
  }, []);
  
  // Load high-resolution texture when artwork changes
  useEffect(() => {
    if (currentArt) {
      const loader = new THREE.TextureLoader();
      
      // Load regular texture
      loader.load(currentArt.src, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        if (materialRef.current) {
          materialRef.current.uniforms.map.value = texture;
          materialRef.current.needsUpdate = true;
        }
      });
      
      // Load high-resolution texture
      const highResSrc = currentArt.src.replace('.jpg', '-high-res.jpg');
      loader.load(highResSrc, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        setHighResTexture(texture);
      }, undefined, () => {
        // If high-res texture fails to load, use regular texture
        setHighResTexture(null);
      });
    }
  }, [currentArt]);
  
  // Update zoom level based on camera position
  useFrame(() => {
    if (meshRef.current && materialRef.current && currentArt) {
      // Calculate zoom level based on camera distance
      const distance = camera.position.z;
      const baseDistance = 5; // Base distance for zoom level 1
      const newZoomLevel = baseDistance / distance;
      
      // Update material uniforms
      materialRef.current.uniforms.zoomLevel.value = newZoomLevel;
      materialRef.current.uniforms.useHighRes.value = highResTexture !== null && newZoomLevel > 2.0;
      if (highResTexture) {
        materialRef.current.uniforms.highResMap.value = highResTexture;
      }
      
      // Reset mesh transform to prevent accumulation
      meshRef.current.matrix.identity();
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.scale.set(1, 1, 1);
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.matrixAutoUpdate = false;
      meshRef.current.updateMatrix();
      
      // Calculate total velocity magnitude
      const totalVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
      // Cap at 0.9999c to avoid infinity
      const cappedVelocity = Math.min(totalVelocity, 0.9999)
      
      // Calculate relativistic factors
      const gamma = calculateGamma(cappedVelocity);
      const doppler = calculateDopplerFactor(cappedVelocity);
      const invGamma = 1 / gamma;
      
      // Update material uniforms
      materialRef.current.uniforms.velocityX.value = velocityX;
      materialRef.current.uniforms.velocityY.value = velocityY;
      materialRef.current.uniforms.gamma.value = gamma;
      materialRef.current.uniforms.doppler.value = doppler;
      
      if (totalVelocity > 0.001) {
        // Calculate direction vector (normalized)
        const dx = velocityX / totalVelocity;
        const dy = velocityY / totalVelocity;
        
        materialRef.current.uniforms.directionX.value = dx;
        materialRef.current.uniforms.directionY.value = dy;
        
        // Calculate direction of motion
        const angle = Math.atan2(dy, dx);
        
        // Create transformation matrices
        const rotateToX = new THREE.Matrix4().makeRotationZ(-angle);
        const rotateBack = new THREE.Matrix4().makeRotationZ(angle);
        const scale = new THREE.Matrix4().makeScale(invGamma, 1, 1);
        
        // Combine matrices: rotateBack * scale * rotateToX
        const finalMatrix = new THREE.Matrix4()
          .multiply(rotateBack)
          .multiply(scale)
          .multiply(rotateToX);
        
        // Apply the final transformation
        meshRef.current.applyMatrix4(finalMatrix);
      } else {
        materialRef.current.uniforms.directionX.value = 0;
        materialRef.current.uniforms.directionY.value = 0;
      }
      
      meshRef.current.updateMatrix();
      meshRef.current.updateMatrixWorld();
    }
  });
  
  if (!currentArt) return null;
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[currentArt.width_px / 100, currentArt.height_px / 100]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
};

const PointerHandler = () => {
  const { camera, scene } = useThree();
  // @ts-expect-error - OrbitControls type from @react-three/drei is complex and difficult to type correctly
  const controlsRef = useRef<OrbitControls>(null);

  const handlePointerMove = (event: THREE.Event) => {
    if (!controlsRef.current) return;
    
    const pointerEvent = event as unknown as PointerEvent;
    // Get mouse position in normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(
      (pointerEvent.clientX / window.innerWidth) * 2 - 1,
      -(pointerEvent.clientY / window.innerHeight) * 2 + 1
    );
    
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersection with the art plane
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
      // Set the target to the intersection point
      controlsRef.current.target.copy(intersects[0].point);
    }
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableRotate={false}
        minDistance={0.5}
        maxDistance={20}
        zoomSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE
        }}
        onChange={(e?: OrbitControlsChangeEvent) => {
          if (e?.target?.object) {
            const camera = e.target.object;
            const baseDistance = 5;
            const zoomLevel = baseDistance / camera.position.z;
            // Use a custom event to communicate with the parent component
            window.dispatchEvent(new CustomEvent('zoomChange', { detail: { zoomLevel } }));
          }
        }}
      />
      <primitive object={new THREE.EventDispatcher()} onPointerMove={handlePointerMove} />
    </>
  );
};

export const ArtCanvas = () => {
  const [zoomPercentage, setZoomPercentage] = useState(100);
  const [showZoomHint, setShowZoomHint] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setShowZoomHint(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setShowZoomHint(true);
      }
    };

    const handleZoomChange = (e: CustomEvent) => {
      setZoomPercentage(Math.round(e.detail.zoomLevel * 100));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('zoomChange', handleZoomChange as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('zoomChange', handleZoomChange as EventListener);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.5} />
        <ArtPlane />
        <PointerHandler />
      </Canvas>
      
      {/* Zoom percentage indicator */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
        {zoomPercentage}% zoom
      </div>

      {/* Zoom hint */}
      {showZoomHint && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Hold Ctrl to zoom
        </div>
      )}

      <PhysicsExplanationPopup />
    </div>
  );
}; 
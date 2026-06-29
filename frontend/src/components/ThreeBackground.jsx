import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function StarField(props) {
  const ref = useRef();
  
  // Generate random points in a 3D sphere layout
  const [sphere] = useState(() => {
    const points = new Float32Array(1500); // 500 stars * 3 coordinates
    for (let i = 0; i < 1500; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.0; // Radius range
      
      points[i] = r * Math.sin(phi) * Math.cos(theta);
      points[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      points[i + 2] = r * Math.cos(phi);
    }
    return points;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#c084fc"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 1.2] }} style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={0.5} />
        <StarField />
      </Canvas>
    </div>
  );
}

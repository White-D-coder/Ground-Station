import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';

function CompassNeedle({ rotation }) {
    const mesh = useRef();

    useFrame(() => {
        if (mesh.current) {
            // Convert degrees to radians
            // Note: Adjust axes mapping based on your specific sensor orientation
            const degToRad = (deg) => (deg * Math.PI) / 180;

            // Assuming rotation.z is yaw (heading)
            // We rotate around Y axis in 3D space for heading
            mesh.current.rotation.y = -degToRad(rotation.z || 0);
            mesh.current.rotation.x = degToRad(rotation.x || 0); // Pitch
            mesh.current.rotation.z = degToRad(rotation.y || 0); // Roll
        }
    });

    return (
        <group ref={mesh}>
            {/* North Pointer (Red) */}
            <mesh position={[0, 0, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 1, 32]} />
                <meshStandardMaterial color="#ff0000" metalness={0.5} roughness={0.2} />
            </mesh>

            {/* South Pointer (White) */}
            <mesh position={[0, 0, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 1, 32]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>

            {/* Center Hub */}
            <mesh>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
                <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Connecting Bar */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 2.4, 16]} />
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
}

function CompassCard() {
    return (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <mesh>
                <ringGeometry args={[2.8, 3, 64]} />
                <meshBasicMaterial color="#444" side={2} />
            </mesh>
            {/* Cardinal Directions */}
            {/* N */}
            <mesh position={[0, 3.4, 0]} rotation={[0, 0, 0]}>
                {/* Text rendering in R3F is complex without drei/Text, using simple markers for now */}
                <boxGeometry args={[0.2, 0.5, 0.01]} />
                <meshBasicMaterial color="#ff0000" />
            </mesh>
            {/* S */}
            <mesh position={[0, -3.4, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.2, 0.5, 0.01]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            {/* E */}
            <mesh position={[3.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.2, 0.5, 0.01]} />
                <meshBasicMaterial color="#888" />
            </mesh>
            {/* W */}
            <mesh position={[-3.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.2, 0.5, 0.01]} />
                <meshBasicMaterial color="#888" />
            </mesh>
        </group>
    );
}

export default function Compass3D({ rotation }) {
    return (
        <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 4, 4]} />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={0} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <CompassNeedle rotation={rotation} />
                <CompassCard />

                <gridHelper args={[10, 10, 0x222222, 0x111111]} position={[0, -0.5, 0]} />
            </Canvas>
        </div>
    );
}

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment } from '@react-three/drei';

function Satellite({ rotation }) {
    const mesh = useRef();

    useFrame(() => {
        if (mesh.current) {
            // Apply rotation from props (converting degrees to radians if necessary, 
            // but usually gyro data might be in degrees or radians. Assuming degrees for now)
            // If data is pitch, roll, yaw.
            // rotation = { x: pitch, y: yaw, z: roll } typically.
            // Let's assume input is in degrees.
            const degToRad = (deg) => (deg * Math.PI) / 180;

            // Smooth interpolation could be added here, but for now direct mapping
            mesh.current.rotation.x = degToRad(rotation.x || 0);
            mesh.current.rotation.y = degToRad(rotation.y || 0);
            mesh.current.rotation.z = degToRad(rotation.z || 0);
        }
    });

    const railThickness = 0.1;
    const size = 1.5;
    const offset = size / 2 - railThickness / 2;

    // Helper for rails
    const Rail = ({ position, rotation, length }) => (
        <mesh position={position} rotation={rotation}>
            <boxGeometry args={[railThickness, length, railThickness]} />
            <meshStandardMaterial color="#E0E0E0" metalness={1.0} roughness={0.05} envMapIntensity={1} />
        </mesh>
    );

    return (
        <group ref={mesh}>
            {/* --- FRAME RAILS --- */}
            {/* Vertical Rails */}
            <Rail position={[offset, 0, offset]} length={size} />
            <Rail position={[-offset, 0, offset]} length={size} />
            <Rail position={[offset, 0, -offset]} length={size} />
            <Rail position={[-offset, 0, -offset]} length={size} />

            {/* Top Horizontal Rails */}
            <Rail position={[0, offset, offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[0, offset, -offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[offset, offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />
            <Rail position={[-offset, offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />

            {/* Bottom Horizontal Rails */}
            <Rail position={[0, -offset, offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[0, -offset, -offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[offset, -offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />
            <Rail position={[-offset, -offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />

            {/* --- INTERNAL BODY (Gold Foil/MLI) --- */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[size - 0.05, size - 0.05, size - 0.05]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.1} envMapIntensity={1} />
            </mesh>

            {/* --- PANELS (Gold) --- */}
            {/* Top */}
            <mesh position={[0, offset - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
                <gridHelper args={[size - 0.2, 4, 0xB8860B, 0xB8860B]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
            </mesh>
            {/* Bottom */}
            <mesh position={[0, -offset + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>

            {/* --- INDIAN FLAG (Front Face) --- */}
            {/* Moved to size/2 + 0.01 to ensure it's outside the body (body extends to ~0.725, rails to 0.75) */}
            <group position={[0, 0, size / 2 + 0.01]}>
                {/* Saffron (Top) */}
                <mesh position={[0, (size - 0.2) / 3, 0]}>
                    <planeGeometry args={[size - 0.2, (size - 0.2) / 3]} />
                    <meshStandardMaterial color="#FF9933" metalness={0.1} roughness={0.8} />
                </mesh>
                {/* White (Middle) */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[size - 0.2, (size - 0.2) / 3]} />
                    <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.8} />
                </mesh>
                {/* Green (Bottom) */}
                <mesh position={[0, -(size - 0.2) / 3, 0]}>
                    <planeGeometry args={[size - 0.2, (size - 0.2) / 3]} />
                    <meshStandardMaterial color="#138808" metalness={0.1} roughness={0.8} />
                </mesh>
                {/* Chakra (Blue Circle) */}
                <mesh position={[0, 0, 0.005]}>
                    <circleGeometry args={[(size - 0.2) / 6 - 0.02, 32]} />
                    <meshStandardMaterial color="#000080" />
                </mesh>
            </group>

            {/* Back */}
            <mesh position={[0, 0, -offset + 0.02]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>
            {/* Left */}
            <mesh position={[-offset + 0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>
            {/* Right */}
            <mesh position={[offset - 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>

            {/* --- DETAILS --- */}
            {/* Corner Bolts (Gold) */}
            {[1, -1].map(x => [1, -1].map(y => [1, -1].map(z => (
                <mesh key={`${x}${y}${z}`} position={[x * offset, y * offset, z * offset]}>
                    <boxGeometry args={[0.12, 0.12, 0.12]} />
                    <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} envMapIntensity={1} />
                </mesh>
            ))))}

            {/* Camera Lens (Front Face) - Moved slightly to avoid flag overlap if needed, or remove if flag covers it 
                Since flag covers the front, let's move camera to TOP face or just hide it behind flag? 
                User asked for flag on front. Let's keep camera but maybe it pokes through? 
                Actually, let's remove the camera from the front if the flag is there, or move it. 
                I'll remove it for now to keep the flag clean. */}

            {/* Antennas (Thin cylinders extending from corners) */}
            <mesh position={[offset, offset, offset]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.01, 0.01, 3, 8]} />
                <meshStandardMaterial color="#FFF" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[-offset, offset, -offset]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.01, 0.01, 3, 8]} />
                <meshStandardMaterial color="#FFF" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[offset, -offset, -offset]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.01, 0.01, 3, 8]} />
                <meshStandardMaterial color="#FFF" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[-offset, -offset, offset]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.01, 0.01, 3, 8]} />
                <meshStandardMaterial color="#FFF" metalness={1} roughness={0.2} />
            </mesh>
        </group>
    );
}

export default function CubeSat({ data }) {
    // Extract rotation data.
    // Data structure: { gyro: { x, y, z }, orientation: ... }
    // If orientation (yaw) is available separately, use it for Z?
    // For now, stick to gyro x,y,z but assume they are degrees.
    const rotation = {
        x: data.gyro?.x || 0,
        y: data.gyro?.y || 0,
        z: data.gyro?.z || 0
    };

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px', background: '#050510', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, color: '#00f2ff', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                ROTATION<br />
                X: {rotation.x.toFixed(2)}°<br />
                Y: {rotation.y.toFixed(2)}°<br />
                Z: {rotation.z.toFixed(2)}°
            </div>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 2, 6]} />
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Suspense fallback={null}>
                    <Environment preset="city" />
                </Suspense>
                <Satellite rotation={rotation} />
                <gridHelper args={[10, 10, 0x444444, 0x222222]} />
                <axesHelper args={[2]} />
                <OrbitControls enableZoom={true} />
            </Canvas>
        </div>
    );
}

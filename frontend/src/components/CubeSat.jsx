import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment } from '@react-three/drei';

function Satellite({ rotation }) {
    const mesh = useRef();

    useFrame(() => {
        if (mesh.current) {
            const degToRad = (deg) => (deg * Math.PI) / 180;

            mesh.current.rotation.x = degToRad(rotation.x || 0);
            mesh.current.rotation.y = degToRad(rotation.y || 0);
            mesh.current.rotation.z = degToRad(rotation.z || 0);
        }
    });

    const railThickness = 0.1;
    const size = 1.5;
    const offset = size / 2 - railThickness / 2;

    const Rail = ({ position, rotation, length }) => (
        <mesh position={position} rotation={rotation}>
            <boxGeometry args={[railThickness, length, railThickness]} />
            <meshStandardMaterial color="#E0E0E0" metalness={1.0} roughness={0.05} envMapIntensity={1} />
        </mesh>
    );

    return (
        <group ref={mesh}>
            <Rail position={[offset, 0, offset]} length={size} />
            <Rail position={[-offset, 0, offset]} length={size} />
            <Rail position={[offset, 0, -offset]} length={size} />
            <Rail position={[-offset, 0, -offset]} length={size} />

            <Rail position={[0, offset, offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[0, offset, -offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[offset, offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />
            <Rail position={[-offset, offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />

            <Rail position={[0, -offset, offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[0, -offset, -offset]} length={size} rotation={[0, 0, Math.PI / 2]} />
            <Rail position={[offset, -offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />
            <Rail position={[-offset, -offset, 0]} length={size} rotation={[Math.PI / 2, 0, 0]} />

            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[size - 0.05, size - 0.05, size - 0.05]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.1} envMapIntensity={1} />
            </mesh>

            <mesh position={[0, offset - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
                <gridHelper args={[size - 0.2, 4, 0xB8860B, 0xB8860B]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
            </mesh>
            <mesh position={[0, -offset + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>

            <group position={[0, 0, size / 2 + 0.01]}>
                <mesh position={[0, (size - 0.2) / 3, 0]}>
                    <planeGeometry args={[size - 0.2, (size - 0.2) / 3]} />
                    <meshStandardMaterial color="#FF9933" metalness={0.1} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[size - 0.2, (size - 0.2) / 3]} />
                    <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.8} />
                </mesh>
                <mesh position={[0, -(size - 0.2) / 3, 0]}>
                    <planeGeometry args={[size - 0.2, (size - 0.2) / 3]} />
                    <meshStandardMaterial color="#138808" metalness={0.1} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0.005]}>
                    <circleGeometry args={[(size - 0.2) / 6 - 0.02, 32]} />
                    <meshStandardMaterial color="#000080" />
                </mesh>
            </group>

            <mesh position={[0, 0, -offset + 0.02]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>
            <mesh position={[-offset + 0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>
            <mesh position={[offset - 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[size - 0.2, size - 0.2]} />
                <meshStandardMaterial color="#FFD700" metalness={1.0} roughness={0.05} envMapIntensity={1} />
            </mesh>

            {[1, -1].map(x => [1, -1].map(y => [1, -1].map(z => (
                <mesh key={`${x}${y}${z}`} position={[x * offset, y * offset, z * offset]}>
                    <boxGeometry args={[0.12, 0.12, 0.12]} />
                    <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} envMapIntensity={1} />
                </mesh>
            ))))}

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

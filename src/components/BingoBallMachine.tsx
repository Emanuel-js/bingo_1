import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import ball_tex from '/textures/ball_texture.jpg';

const BingoBall = ({
  number = 1,
  position = [0, 0, 0],
  isDrawn = false,
  isAnimating = false,
}) => {
  const meshRef = useRef();
  const textRef = useRef();
  const { viewport } = useThree();

  const texture = useTexture(ball_tex);

  useEffect(() => {
    if (isAnimating && meshRef.current) {
      gsap.to(meshRef.current.position, {
        y: position[1] + 0.5,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
      gsap.to(meshRef.current.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        duration: 2,
        repeat: -1,
        ease: 'none',
      });
    }
  }, [isAnimating, position]);

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.8}
          roughness={0.2}
          color={`hsl(${number * 3}, 100%, 50%)`}
        />
      </mesh>
      {number && (
        <Text
          ref={textRef}
          position={[0, 0, 0.41]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          {number}
        </Text>
      )}
    </group>
  );
};

export const BingoBallMachine = ({
  onDrawBall,
  isSpinning = false,
  currentBall = null,
}) => {
  const groupRef = useRef();
  const cageRef = useRef();
  const ballsRef = useRef();
  const drawnBallRef = useRef();
  const particlesRef = useRef();

  const { viewport } = useThree();

  useFrame((state) => {
    if (isSpinning && cageRef.current) {
      cageRef.current.rotation.y += 0.05;
      ballsRef.current.rotation.y += 0.07;
    }

    // Animate particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01;
      particlesRef.current.children.forEach((particle) => {
        particle.position.y +=
          Math.sin(state.clock.elapsedTime * 2 + particle.position.x) * 0.01;
      });
    }
  });

  useEffect(() => {
    if (currentBall !== null && drawnBallRef.current) {
      gsap.to(drawnBallRef.current.position, {
        x: 3,
        y: 2,
        duration: 1,
        ease: 'power2.out',
      });
    }
  }, [currentBall]);

  useEffect(() => {
    // Create particles
    const particles = new THREE.Group();
    for (let i = 0; i < 100; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.5,
        })
      );
      particle.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      particles.add(particle);
    }
    particlesRef.current = particles;
    groupRef.current.add(particles);

    return () => {
      groupRef.current.remove(particles);
    };
  }, []);

  return (
    <group ref={groupRef}>
      <mesh ref={cageRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#888888" wireframe={true} />
      </mesh>
      <group ref={ballsRef}>
        {[...Array(20)].map((_, index) => (
          <BingoBall
            key={index}
            number={Math.floor(Math.random() * 75) + 1}
            position={[
              Math.random() * 1.5 - 0.75,
              Math.random() * 1.5 - 0.75,
              Math.random() * 1.5 - 0.75,
            ]}
            isAnimating={isSpinning}
          />
        ))}
      </group>

      {currentBall !== null && (
        <group ref={drawnBallRef}>
          <BingoBall
            number={currentBall}
            position={[0, 0, 0]}
            isDrawn={true}
            isAnimating={true}
          />
        </group>
      )}

      <mesh position={[2.5, -2, 0]} onClick={onDrawBall}>
        <cylinderGeometry args={[0.2, 0.2, 2, 32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Add a spotlight for dramatic effect */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={1}
        castShadow
      />
    </group>
  );
};

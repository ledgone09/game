import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Billboard,
  Html,
  Text,
  useGLTF,
  useAnimations,
} from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import useGame from './stores/useGame.js';
import SpeechBubble from './interface/speechBubble/SpeechBubble.jsx';

export function Npc(props) {
  const isNearNpc = useGame((state) => state.isNearNpc);
  const toggleIsNearNpc = useGame((state) => state.toggleIsNearNpc);
  const isChatting = useGame((state) => state.isChatting);
  const toggleIsChatting = useGame((state) => state.toggleIsChatting);

  // Player position
  const positionX = useGame((state) => state.positionX);
  const positionY = useGame((state) => state.positionY);
  const positionZ = useGame((state) => state.positionZ);
  let playerPosition = new THREE.Vector3(positionX, positionY, positionZ);

  const { position, color } = props;

  // Non-playble character position
  const npcPosition = new THREE.Vector3(...position);

  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/npc.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    materials['Material.001'].color = { ...color };
  }, []);

  useFrame((state) => {
    actions.idle.play();

    playerPosition = new THREE.Vector3(positionX, positionY, positionZ);
    if (playerPosition.distanceTo(npcPosition) < 5) {
      if (!isNearNpc) {
        toggleIsNearNpc();
      }
    } else {
      if (isNearNpc) {
        toggleIsNearNpc();
        if (isChatting) {
          toggleIsChatting();
        }
      }
    }
  });

  const facialMaterial = new THREE.MeshBasicMaterial({ color: 0x06FFA5 }); // Pump.fun green eyes

  // Pump.fun themed NPC material
  const pumpNpcMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.1,
  });

  let bubblePosition;

  return (
    <>
      {!isChatting && (
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[position[0], 2.4, position[2]]}
        >
          <Text
            fontSize={1.5}
            font="./fonts/nickname.otf"
            color="#06FFA5"
            outlineColor="#8B5CF6"
            outlineWidth={0.1}
          >
            🚀
          </Text>
        </Billboard>
      )}

      <RigidBody type="fixed" position={position}>
        <CuboidCollider args={[2, 2, 2.5]} />
        <group ref={group} dispose={null}>
          <group name="PumpNpcScene">
            <Html position={[-2.5, 4, 0]}>
              {isChatting && isNearNpc && <SpeechBubble />}
            </Html>
            <group name="DegenNpcArmature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
              <primitive object={nodes.mixamorigHips} />
              <skinnedMesh
                name="pumpNpcBody"
                geometry={nodes.body.geometry}
                material={pumpNpcMaterial}
                skeleton={nodes.body.skeleton}
              />
              <skinnedMesh
                name="npcLeftEye"
                geometry={nodes.eyel.geometry}
                material={facialMaterial}
                skeleton={nodes.eyel.skeleton}
              />
              <skinnedMesh
                name="npcRightEye"
                geometry={nodes.eyer.geometry}
                material={facialMaterial}
                skeleton={nodes.eyer.skeleton}
              />
              <skinnedMesh
                name="npcMouth"
                geometry={nodes.mouth.geometry}
                material={facialMaterial}
                skeleton={nodes.mouth.skeleton}
              />
            </group>
          </group>
        </group>
      </RigidBody>
    </>
  );
}

useGLTF.preload('/npc.glb');

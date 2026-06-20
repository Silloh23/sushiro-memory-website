import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MemoryItem } from '../types';

interface SushiroSceneProps {
  onBelt: MemoryItem[];
  onPlateConsumed: (id: number) => void;
  isTouchDevice: boolean;
}

interface ThreadedPlate {
  id: number;
  item: MemoryItem;
  group: THREE.Group;
  status: 'sliding' | 'consuming';
  consumeTimer: number;
}

export default function SushiroScene({ onBelt, onPlateConsumed, isTouchDevice }: SushiroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Keep arrays of plates & particles in refs so they are updated inside the main requestAnimationFrame loop
  const platesRef = useRef<ThreadedPlate[]>([]);
  const platesOnBeltPropRef = useRef<MemoryItem[]>(onBelt);
  const onPlateConsumedRef = useRef<(id: number) => void>(onPlateConsumed);
  
  // Tracking mouse for camera tilt parallax
  const mouseRef = useRef({ x: 0, y: 0 });

  // Update references so loop always has fresh React callbacks & prop data
  useEffect(() => {
    platesOnBeltPropRef.current = onBelt;
  }, [onBelt]);

  useEffect(() => {
    onPlateConsumedRef.current = onPlateConsumed;
  }, [onPlateConsumed]);

  // Handle spawn requests - whenever React onBelt changes, see if we need to add a plate
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Filter items in onBelt that are not currently in our 3D plates array
    onBelt.forEach((item) => {
      const exists = platesRef.current.some(p => p.id === item.id);
      if (!exists) {
        // Spawn this plate!
        const plateGroup = create3DPlate(item);
        
        // Let's spawn plates spread out nicely so they don't overlap. 
        // If there's already a plate close to the starting point (x = ~6.5), push the new one back.
        let spawnX = 7.0;
        const slidingPlates = platesRef.current.filter(p => p.status === 'sliding');
        if (slidingPlates.length > 0) {
          const rightmostX = Math.max(...slidingPlates.map(p => p.group.position.x));
          if (rightmostX > 4.0) {
            spawnX = rightmostX + 3.5; // push it back behind the other plate
          }
        }
        
        plateGroup.position.set(spawnX, 0.45, 0);
        scene.add(plateGroup);

        platesRef.current.push({
          id: item.id,
          item,
          group: plateGroup,
          status: 'sliding',
          consumeTimer: 0
        });
      }
    });

    // Clean up plates in 3D scene that were removed from React's onBelt but NOT via consumption (e.g. if state reset)
    platesRef.current = platesRef.current.filter((p) => {
      const stillOrdered = onBelt.some(item => item.id === p.id);
      if (!stillOrdered && p.status === 'sliding') {
        scene.remove(p.group);
        // recursively dispose
        disposeHierarchy(p.group);
        return false;
      }
      return true;
    });

  }, [onBelt]);

  // Recursively clean up Three geometries and materials to avoid memory leaks
  function disposeHierarchy(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
  }

  // Create a beautiful circular Canvas Texture for rich emoji rendering in 3D
  function createEmojiTexture(emoji: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      
      // Draw a soft glowing pinkish-cream backplate circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#D0021B';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Soft cute drop-shadow under emoji (simulated)
      ctx.font = '64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw emoji
      ctx.fillText(emoji, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Generate a beautiful, low-poly procedural sushi plate in 3D
  function create3DPlate(item: MemoryItem): THREE.Group {
    const group = new THREE.Group();

    // 1. Plate Body (White sushi ceramic plate)
    const plateGeo = new THREE.CylinderGeometry(0.8, 0.76, 0.1, 32);
    const plateMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.receiveShadow = true;
    plateMesh.castShadow = true;
    group.add(plateMesh);

    // 2. Plate Rim (Sushiro trademark colored bands mapping to memory category tier)
    const rimGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.05, 32);
    const rimMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(item.rimColor) });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.035;
    group.add(rimMesh);

    // 3. Cute low-poly procedural Sushi Toppings
    // Rice block (warm white vanilla rectangle)
    const riceGeo = new THREE.BoxGeometry(0.6, 0.3, 0.4);
    const riceMat = new THREE.MeshLambertMaterial({ color: 0xfffcf7 });
    const riceMesh = new THREE.Mesh(riceGeo, riceMat);
    riceMesh.position.set(-0.15, 0.18, 0);
    riceMesh.rotation.y = 0.1;
    group.add(riceMesh);

    const riceGeo2 = new THREE.BoxGeometry(0.6, 0.3, 0.4);
    const riceMesh2 = new THREE.Mesh(riceGeo2, riceMat);
    riceMesh2.position.set(0.15, 0.18, 0.05);
    riceMesh2.rotation.y = -0.15;
    group.add(riceMesh2);

    // Cute pink/red fish slices on top
    const fishColor = item.category === 'tim' ? 0x92400E :
                      item.category === 'disney' ? 0x8B5CF6 :
                      item.category === 'secret' ? 0xEA580C : 0xD0021B;
    const fishGeo = new THREE.BoxGeometry(0.65, 0.1, 0.44);
    const fishMat = new THREE.MeshLambertMaterial({ color: fishColor });
    const fishMesh1 = new THREE.Mesh(fishGeo, fishMat);
    fishMesh1.position.set(-0.15, 0.32, 0);
    fishMesh1.rotation.y = 0.1;
    group.add(fishMesh1);

    const fishMesh2 = new THREE.Mesh(fishGeo, fishMat);
    fishMesh2.position.set(0.15, 0.32, 0.05);
    fishMesh2.rotation.y = -0.15;
    group.add(fishMesh2);

    // Nori seaweed wraps (wrap-arounds) for a cute finished touch
    const noriGeo = new THREE.BoxGeometry(0.2, 0.42, 0.46);
    const noriMat = new THREE.MeshLambertMaterial({ color: 0x1a2e1d });
    const noriMesh = new THREE.Mesh(noriGeo, noriMat);
    noriMesh.position.set(0, 0.22, 0.02);
    group.add(noriMesh);

    // 4. Floating Emoji Sprite above the plate
    const emojiTexture = createEmojiTexture(item.emoji);
    const spriteMat = new THREE.SpriteMaterial({ map: emojiTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 1.0, 0);
    // Dynamic rounded scale so it is easily clickable and cute
    sprite.scale.set(0.9, 0.9, 1.0);
    sprite.name = `emoji_sprite_${item.id}`;
    group.add(sprite);

    // Add pointer to group for raycasting
    group.userData = { id: item.id };
    
    return group;
  }

  // Build the conveyor belt look pattern programmatically
  function createBeltTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#2A2A2A'; 
      ctx.fillRect(0, 0, 128, 64);
      
      // Alternating metallic gray slats
      ctx.fillStyle = '#3A3A3A';
      ctx.fillRect(0, 0, 60, 64);
      
      // Bright edge dividers
      ctx.fillStyle = '#1D1D1D';
      ctx.fillRect(60, 0, 4, 64);
      ctx.fillRect(124, 0, 4, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 1);
    return texture;
  }

  // Build a custom 3D Chef Tim characters with a chef hat, sushi cutting board, knife & mini ingredients
  function createChefTim() {
    const chefGroup = new THREE.Group();

    // Materials suited to beautiful bright diner lighting - sweeter honey bear tone
    const bearBrown = new THREE.MeshStandardMaterial({ color: 0xB57A42, roughness: 0.5 }); 
    const bearCream = new THREE.MeshStandardMaterial({ color: 0xFFEFD5, roughness: 0.5 }); 
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x111111 }); 
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 }); 
    const redMat = new THREE.MeshStandardMaterial({ color: 0xE81A24, roughness: 0.5 });   

    // 1. Chef Coat / Body
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.63, 1.2, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, whiteMat);
    bodyMesh.position.y = 0.6;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    chefGroup.add(bodyMesh);

    // Red neck accessory / bandana
    const scarfGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.12, 16);
    const scarfMesh = new THREE.Mesh(scarfGeo, redMat);
    scarfMesh.position.y = 1.15;
    chefGroup.add(scarfMesh);

    // Bear Head Group for breathing/tilting
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.6, 0);

    // Main head sphere
    const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, bearBrown);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Muzzle (cute bear nose base)
    const muzzleGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, bearCream);
    muzzleMesh.scale.set(1.2, 0.9, 0.8);
    muzzleMesh.position.set(0, -0.05, 0.45);
    headGroup.add(muzzleMesh);

    // Tiny shiny black bear nose
    const noseGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const noseMesh = new THREE.Mesh(noseGeo, blackMat);
    noseMesh.position.set(0, 0.02, 0.55);
    headGroup.add(noseMesh);

    // Expressive little eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, blackMat);
    leftEye.position.set(-0.16, 0.12, 0.46);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.16;
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Ears (Outer)
    const earGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const leftEar = new THREE.Mesh(earGeo, bearBrown);
    leftEar.position.set(-0.45, 0.4, 0.1);
    headGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.45;
    headGroup.add(rightEar);

    // Ears (Inner Pink/Cream)
    const innerEarGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, bearCream);
    leftInnerEar.position.set(-0.43, 0.4, 0.15);
    headGroup.add(leftInnerEar);

    const rightInnerEar = leftInnerEar.clone();
    rightInnerEar.position.x = 0.43;
    headGroup.add(rightInnerEar);

    // Japanese chef headband (Hachimaki)
    const headbandGeo = new THREE.CylinderGeometry(0.57, 0.57, 0.1, 16);
    const headbandMesh = new THREE.Mesh(headbandGeo, redMat);
    headbandMesh.position.set(0, 0.22, 0);
    headbandMesh.rotation.x = 0.06; 
    headGroup.add(headbandMesh);

    // Tall professional white toque (Chef Hat)
    const hatGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.65, 16);
    const hatMesh = new THREE.Mesh(hatGeo, whiteMat);
    hatMesh.position.set(0, 0.52, 0);
    hatMesh.rotation.z = -0.1;
    headGroup.add(hatMesh);

    chefGroup.add(headGroup);

    // Left Arm (Joint group)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.6, 0.9, 0.1);
    const armGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.45, 12);
    const armMesh = new THREE.Mesh(armGeo, whiteMat); 
    armMesh.position.y = -0.2;
    armMesh.rotation.z = 0.3;
    leftArmGroup.add(armMesh);
    
    const pawGeo = new THREE.SphereGeometry(0.13, 8, 8);
    const pawMesh = new THREE.Mesh(pawGeo, bearBrown);
    pawMesh.position.set(-0.06, -0.4, 0.05);
    leftArmGroup.add(pawMesh);
    chefGroup.add(leftArmGroup);

    // Right Arm (Joint group)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.6, 0.9, 0.1);
    const armMeshRight = new THREE.Mesh(armGeo, whiteMat);
    armMeshRight.position.y = -0.2;
    armMeshRight.rotation.z = -0.3;
    rightArmGroup.add(armMeshRight);

    const pawMeshRight = new THREE.Mesh(pawGeo, bearBrown);
    pawMeshRight.position.set(0.06, -0.4, 0.05);
    rightArmGroup.add(pawMeshRight);
    chefGroup.add(rightArmGroup);

    // Chef cutting board counter
    const boardGroup = new THREE.Group();
    boardGroup.position.set(0, 0.35, 0.7); 

    const boardWoodGeo = new THREE.BoxGeometry(1.4, 0.06, 0.75);
    const boardWoodMat = new THREE.MeshStandardMaterial({ color: 0xE6C280, roughness: 0.8 }); 
    const boardMesh = new THREE.Mesh(boardWoodGeo, boardWoodMat);
    boardMesh.castShadow = true;
    boardMesh.receiveShadow = true;
    boardGroup.add(boardMesh);

    // Procedural mini sushi on board
    const miniRiceGeo = new THREE.BoxGeometry(0.14, 0.06, 0.09);
    const miniRiceMat = new THREE.MeshLambertMaterial({ color: 0xfffcf7 });
    const miniRice = new THREE.Mesh(miniRiceGeo, miniRiceMat);
    miniRice.position.set(-0.25, 0.06, 0);
    boardGroup.add(miniRice);

    const miniFishGeo = new THREE.BoxGeometry(0.15, 0.03, 0.1);
    const miniFishMat = new THREE.MeshLambertMaterial({ color: 0xD0021B });
    const miniFish = new THREE.Mesh(miniFishGeo, miniFishMat);
    miniFish.position.set(-0.25, 0.1, 0);
    boardGroup.add(miniFish);

    // Chef knife (Sanctuko knife)
    const bladeGeo = new THREE.BoxGeometry(0.25, 0.05, 0.015);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.1 });
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeMesh.position.set(0.2, 0.06, 0.1);
    bladeMesh.rotation.y = 0.2;
    boardGroup.add(bladeMesh);

    const handleGeo = new THREE.BoxGeometry(0.1, 0.03, 0.03);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(0.33, 0.06, 0.12);
    handleMesh.rotation.y = 0.2;
    boardGroup.add(handleMesh);

    chefGroup.add(boardGroup);

    return { group: chefGroup, leftArm: leftArmGroup, rightArm: rightArmGroup, head: headGroup };
  }

  // Handle interaction with mouse/parallax tilt and camera/scrolling setup
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // FOG (Fades into the page background's bright cream color instead of dark shadows)
    scene.fog = new THREE.FogExp2(0xfffbf7, 0.02);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 50);
    camera.position.set(0, 4, 7);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    // Brighter ambient light - gives overall vibrant fill and soft shadow baseline
    const ambientLight = new THREE.AmbientLight(0xfffbf4, 1.25);
    scene.add(ambientLight);

    // Directional bright key light pointing from upper-front to avoid face shadow
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(1.5, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Dedicated warm spot light centered right on the sushi conveyor belt
    const spotLight = new THREE.SpotLight(0xffebcf, 2.0, 20, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 6.5, 2);
    scene.add(spotLight);

    // Dedicated bright spot light right in front of Chef Tim to make him look lively
    const timSpotLight = new THREE.SpotLight(0xffffff, 2.8, 12, Math.PI / 4, 0.6, 1);
    timSpotLight.position.set(0, 4.2, -0.2); // positioned above the belt pointing back towards Tim
    scene.add(timSpotLight);

    // Subtle rim light behind Tim and back counter for beautiful outlines
    const rimLight = new THREE.PointLight(0xffecd6, 1.5, 15);
    rimLight.position.set(0, 4, -2.5);
    scene.add(rimLight);

    // ENVIRONMENT DESIGN
    // Warm table/counter box in the foreground
    const counterGeo = new THREE.BoxGeometry(18, 1.0, 3.5);
    const counterMat = new THREE.MeshStandardMaterial({ 
      color: 0x8d5b32, // Warm brown wood
      roughness: 0.6,
      metalness: 0.1
    });
    const counterMesh = new THREE.Mesh(counterGeo, counterMat);
    counterMesh.position.set(0, -0.2, 2.5);
    counterMesh.receiveShadow = true;
    scene.add(counterMesh);

    // Conveyor Belt Base Box
    const beltTexture = createBeltTexture();
    const beltGeo = new THREE.BoxGeometry(18, 0.5, 1.6);
    const beltMat = new THREE.MeshStandardMaterial({ 
      map: beltTexture,
      roughness: 0.5,
      metalness: 0.3
    });
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    beltMesh.position.set(0, 0.15, 0);
    beltMesh.receiveShadow = true;
    scene.add(beltMesh);

    // Metal rim tracks around the conveyor line
    const trackTrimGeo = new THREE.BoxGeometry(18, 0.1, 0.1);
    const trackTrimMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const frontTrim = new THREE.Mesh(trackTrimGeo, trackTrimMat);
    frontTrim.position.set(0, 0.42, 0.81);
    scene.add(frontTrim);
    const backTrim = frontTrim.clone();
    backTrim.position.z = -0.81;
    scene.add(backTrim);

    // Instantiate adorable Chef Tim the Bear right behind the belt
    const timObj = createChefTim();
    timObj.group.position.set(0, 0.15, -1.35); // Centered, standing behind conveyor line
    scene.add(timObj.group);

    // WHIMSICAL FLUTTERING SAKURA PETALS SYSTEM
    const sakuraCount = 35;
    const sakuraGeos: THREE.PlaneGeometry[] = [];
    const sakuraMeshes: THREE.Mesh[] = [];
    const sakuraMat = new THREE.MeshBasicMaterial({ 
      color: 0xffb7c5, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < sakuraCount; i++) {
      const geo = new THREE.PlaneGeometry(0.08, 0.08);
      const petal = new THREE.Mesh(geo, sakuraMat);
      
      // Random starting coordinates
      petal.position.set(
        (Math.random() - 0.5) * 16,
        Math.random() * 5 + 1.5,
        (Math.random() - 0.5) * 6
      );
      
      petal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      scene.add(petal);
      sakuraMeshes.push(petal);
      sakuraGeos.push(geo);
    }

    // SPARKLE EXPLOSIONS ENGINE
    interface ActiveSparkle {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      life: number;
    }
    const sparklesList: ActiveSparkle[] = [];
    const sparkleGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const sparkleColors = [0xfff9db, 0xffd8a8, 0xffc9c9, 0xeebefa, 0xd0bfff];

    function spawnSparklesAt(pos: THREE.Vector3) {
      for (let i = 0; i < 18; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
          transparent: true,
          opacity: 1.0
        });
        const sp = new THREE.Mesh(sparkleGeo, mat);
        sp.position.copy(pos);
        
        // Random spherical dispersion velocity
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = Math.random() * 0.08 + 0.04;
        
        const velocity = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 0.04, // disperse upwards mainly
          Math.cos(phi) * speed
        );

        scene.add(sp);
        sparklesList.push({
          mesh: sp,
          velocity,
          life: 1.0
        });
      }
    }

    // INTERACTION: MOUSE MOVE FOR CAMERA PARALLAX (Only active on Desktop)
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    if (!isTouchDevice) {
      window.addEventListener('mousemove', onMouseMove);
    }

    // INTERACTION: TAP TO ORDER PLATE
    const raycaster = new THREE.Raycaster();
    const tempMouse = new THREE.Vector2();

    const checkClick = (clientX: number, clientY: number) => {
      const containerRect = container.getBoundingClientRect();
      // Translate to screen coords ranging (-1 to 1) relative to canvas size
      tempMouse.x = ((clientX - containerRect.left) / containerRect.width) * 2 - 1;
      tempMouse.y = -((clientY - containerRect.top) / containerRect.height) * 2 + 1;

      raycaster.setFromCamera(tempMouse, camera);

      // Find children plates
      const targetPlatesGroup = platesRef.current.map(p => p.group);
      
      // We look at recursive intersects because our groups have meshes inside
      const intersects = raycaster.intersectObjects(targetPlatesGroup, true);
      
      if (intersects.length > 0) {
        // Find top-level active plate group parents
        let currentItem: THREE.Object3D | null = intersects[0].object;
        while (currentItem && currentItem.parent && currentItem !== scene) {
          if (currentItem.userData && typeof currentItem.userData.id === 'number') {
            break;
          }
          currentItem = currentItem.parent;
        }

        if (currentItem && currentItem.userData && typeof currentItem.userData.id === 'number') {
          const itemID = currentItem.userData.id;
          const matchedIndex = platesRef.current.findIndex(p => p.id === itemID);
          
          if (matchedIndex !== -1 && platesRef.current[matchedIndex].status === 'sliding') {
            // Found clean target plate! Trigger tween-consuming phase
            platesRef.current[matchedIndex].status = 'consuming';
            platesRef.current[matchedIndex].consumeTimer = 0;
            
            // Spawn sparkly burst around the plate top
            const platePos = platesRef.current[matchedIndex].group.position.clone();
            platePos.y += 0.55; 
            spawnSparklesAt(platePos);
          }
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      checkClick(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        checkClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart);

    // RESIZE OBSERVER (Responsive dimension tracking)
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      
      // Update camera and model dimensions recursively
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // ANIMATION & STATE RUNTIME
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Gently scroll the conveyor belt texture to represent continuous travel
      beltTexture.offset.x -= 0.12 * delta;

      // 2. Continuous slow automatic camera breathing bob (adds warmth)
      if (camera) {
        // Subtle vertical oscillation
        const bobOffset = Math.sin(time * 0.5) * 0.12;
        
        // Tilt Parallax handling
        const targetX = isTouchDevice ? 0 : mouseRef.current.x * 1.5;
        const targetY = 4 + (isTouchDevice ? 0 : -mouseRef.current.y * 0.45) + bobOffset;
        
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        
        // Always gaze centered down the serving table
        camera.lookAt(0, 0.25, 0);
      }

      // 3. Update active Sakura Falling particles
      for (let i = 0; i < sakuraMeshes.length; i++) {
        const petal = sakuraMeshes[i];
        
        // Drift downwards with cute fluttering wind sweep
        petal.position.y -= 0.38 * delta;
        petal.position.x += Math.sin(time + i) * 0.12 * delta;
        petal.position.z += Math.cos(time * 0.5 + i) * 0.08 * delta;
        
        // Twirl nicely
        petal.rotation.x += 0.15 * delta;
        petal.rotation.z += 0.22 * delta;

        // Reset if it slips underneath the counter bar
        if (petal.position.y < -0.8) {
          petal.position.y = 5.0;
          petal.position.x = (Math.random() - 0.5) * 16;
          petal.position.z = (Math.random() - 0.5) * 5;
        }
      }

      // 4. Update sparkles list
      for (let i = sparklesList.length - 1; i >= 0; i--) {
        const item = sparklesList[i];
        item.mesh.position.addScaledVector(item.velocity, 60 * delta);
        
        // Fade out
        item.life -= 1.8 * delta;
        if (item.mesh.material instanceof THREE.Material) {
          item.mesh.material.opacity = Math.max(0, item.life);
        }
        
        // Recycle sparkle once it fades fully
        if (item.life <= 0) {
          scene.remove(item.mesh);
          disposeHierarchy(item.mesh);
          sparklesList.splice(i, 1);
        }
      }

      // 5. Update plates movement and status animations
      const activePlates = platesRef.current;
      for (let i = activePlates.length - 1; i >= 0; i--) {
        const p = activePlates[i];

        if (p.status === 'sliding') {
          // Travel moderately down the conveyor line towards left
          p.group.position.x -= 1.4 * delta;
          
          // Gently bob the emoji floating sprite to feel bubbly
          const emojiSprite = p.group.getObjectByName(`emoji_sprite_${p.id}`);
          if (emojiSprite) {
            emojiSprite.position.y = 1.0 + Math.sin(time * 3 + p.id) * 0.08;
          }

          // Loop around to right if plate exits off the screen left bounds on continuous loop
          if (p.group.position.x < -10.5) {
            p.group.position.x = 9.5;
          }
        } 
        else if (p.status === 'consuming') {
          p.consumeTimer += delta;

          // Perform elegant manual lift-and-spin tween sequence without TweenJS
          const liftProgress = Math.min(p.consumeTimer / 0.45, 1.0); // 0.45 second lift
          
          // Lift up on Y axis
          p.group.position.y = 0.45 + liftProgress * 1.5;
          
          // Spin around rapidly
          p.group.rotation.y += 12 * delta;
          
          // Scale down as it gets absorbed
          const scale = 1.0 - liftProgress;
          p.group.scale.set(scale, scale, scale);

          // Once finished eating, delete from 3D world and call react triggers
          if (liftProgress >= 1.0) {
            scene.remove(p.group);
            disposeHierarchy(p.group);
            activePlates.splice(i, 1);
            
            // Notify React parent system!
            onPlateConsumedRef.current(p.id);
          }
        }
      }

      // 6. Animate adorable Chef Tim
      if (timObj) {
        // Natural heavy breathing / bobbing
        timObj.head.rotation.z = Math.sin(time * 1.5) * 0.03;
        timObj.head.position.y = 1.6 + Math.sin(time * 2.0) * 0.015;
        
        // Slicing/chopping or making sushi motion
        // Left arm moves in a chopping rhythm
        timObj.leftArm.rotation.x = -0.2 + Math.sin(time * 4.5) * 0.25;
        // Right arm mimics rolling or placing delicate garnishes
        timObj.rightArm.rotation.x = -0.25 + Math.cos(time * 3.0) * 0.15;
        timObj.rightArm.position.y = 0.9 + Math.sin(time * 3.0) * 0.04;
      }

      renderer.render(scene, camera);
    };

    // Trigger frame animations
    animateLoop();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);

      // Dispose resources
      sakuraGeos.forEach(g => g.dispose());
      sakuraMat.dispose();
      sparkleGeo.dispose();
      
      if (timObj) {
        scene.remove(timObj.group);
        disposeHierarchy(timObj.group);
      }

      platesRef.current.forEach((p) => {
        scene.remove(p.group);
        disposeHierarchy(p.group);
      });
      platesRef.current = [];

      sparklesList.forEach((sp) => {
        scene.remove(sp.mesh);
        disposeHierarchy(sp.mesh);
      });

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [isTouchDevice]);

  return (
    <div 
      className="w-full h-full relative" 
      ref={containerRef}
      style={{ touchAction: 'none' }}
    />
  );
}

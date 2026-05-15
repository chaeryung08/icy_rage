/* ── loader.js : Three.js GLB 로더 ──
 *
 * 하나의 garden.glb를 모든 계절에서 공유
 * 계절마다 배경색/조명색만 변경
 *
 * 블렌더 작업 가이드:
 *   1. 블렌더에서 탑뷰 정원 모델 제작
 *   2. 구역 오브젝트 이름 규칙:
 *      zone_A, zone_B, zone_C, zone_D
 *   3. File → Export → glTF 2.0 (.glb)
 *      → garden/models/garden.glb 저장
 *   4. loader.js 하단 TODO 주석 해제
 *
 * 과학적 표현:
 *   계절별 색상 = 생장 단계 색상 (plants.js)
 *   생장 단계 = 로지스틱 모델 결과값
 */

const SEASON_COLORS = {
  spring: { bg: 0xfce4ec, zone: 0xa5d6a7, light: 0xffe0e6 },
  summer: { bg: 0xe8f5e9, zone: 0x4caf50, light: 0xffffff },
  autumn: { bg: 0xfff8e1, zone: 0xff8a65, light: 0xffd180 },
  winter: { bg: 0xe3f2fd, zone: 0x90caf9, light: 0xe8f4ff },
};

// 계절별 Three.js 씬 저장
const threeScenes = {};
const threeRenderers = {};
const threeCameras = {};
const threeZones = {}; // 클릭 가능한 구역 mesh

function initLoader() {
  ['spring', 'summer', 'autumn', 'winter'].forEach(season => {
    setupScene(season);
  });
}

function setupScene(season) {
  const canvas = document.getElementById(`canvas-${season}`);
  if (!canvas) return;

  const W = canvas.parentElement.clientWidth || 800;
  const H = canvas.parentElement.clientHeight || 500;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SEASON_COLORS[season].bg);
  threeScenes[season] = scene;

  // Camera — 탑뷰 (위에서 내려다보기)
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
  camera.position.set(0, 14, 5);
  camera.lookAt(0, 0, 0);
  threeCameras[season] = camera;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeRenderers[season] = renderer;

  // 조명
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(SEASON_COLORS[season].light, 0.6);
  dir.position.set(5, 10, 5);
  scene.add(dir);

  // 임시 블록 정원 (glb 없을 때)
  threeZones[season] = [];
  buildBlockGarden(season, scene);

  // 클릭
  canvas.addEventListener('click', e => onCanvasClick(e, season));

  // 리사이즈
  window.addEventListener('resize', () => {
    const W2 = canvas.parentElement.clientWidth;
    const H2 = canvas.parentElement.clientHeight;
    threeCameras[season].aspect = W2 / H2;
    threeCameras[season].updateProjectionMatrix();
    threeRenderers[season].setSize(W2, H2);
  });

  // 애니메이션 루프
  (function loop() {
    requestAnimationFrame(loop);
    threeRenderers[season].render(threeScenes[season], threeCameras[season]);
  })();

  // ── TODO: garden.glb 준비 후 아래 주석 해제 ──
  // placeholder 숨기기 + glb 로드
  /*
  const loader = new THREE.GLTFLoader();
  loader.load('models/garden.glb',
    (gltf) => {
      document.getElementById(`placeholder-${season}`).style.display = 'none';

      // 계절에 맞게 색상 변경
      gltf.scene.traverse(obj => {
        if (obj.isMesh && obj.name?.startsWith('zone_')) {
          obj.material = obj.material.clone();
          obj.material.color.setHex(SEASON_COLORS[season].zone);
          obj.userData.zoneId = obj.name.replace('zone_','');
          threeZones[season].push(obj);
        }
      });

      threeScenes[season].add(gltf.scene);
    },
    undefined,
    err => console.warn(`garden.glb 로드 실패 (${season}):`, err)
  );
  */
}

// 임시 블록 정원
function buildBlockGarden(season, scene) {
  const color = SEASON_COLORS[season].zone;
  const zones = [
    { id: 'A', x: -2.8, z: 1.8, w: 2.5, d: 2.5 },
    { id: 'B', x: 1.5, z: -1.5, w: 3.5, d: 1.8 },
    { id: 'C', x: 0.2, z: 0.8, w: 1.8, d: 1.8 },
    { id: 'D', x: -0.8, z: -1.0, w: 1.8, d: 0.9 },
  ];

  zones.forEach(z => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(z.w, 0.3, z.d),
      new THREE.MeshLambertMaterial({ color })
    );
    mesh.position.set(z.x, 0, z.z);
    mesh.name = `zone_${z.id}`;
    mesh.userData.zoneId = z.id;
    scene.add(mesh);
    threeZones[season].push(mesh);
  });

  // 바닥
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.MeshLambertMaterial({ color: 0xd7ccc8 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.16;
  scene.add(floor);
}

// 클릭 → 구역 팝업
function onCanvasClick(e, season) {
  const canvas = document.getElementById(`canvas-${season}`);
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, threeCameras[season]);
  const hits = raycaster.intersectObjects(threeZones[season]);
  if (hits.length > 0) {
    openZonePopup(hits[0].object.userData.zoneId, season);
  }
}
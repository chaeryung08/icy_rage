/* ── loader.js : Three.js GLB 로더 (ground) ──
 *
 * groundbottom.glb 를 모든 계절에서 공유
 * 계절마다 배경색/조명색만 변경
 *
 * 구역 3개:
 *   1 — 외곽 생태 링
 *   2 — 중앙 교목 군락
 *   3 — 암석 건생 구역
 */

const SEASON_COLORS = {
  spring: { bg: 0xfce4ec, zone: 0xa5d6a7, light: 0xffe0e6 },
  summer: { bg: 0xe8f5e9, zone: 0x4caf50, light: 0xffffff },
  autumn: { bg: 0xfff8e1, zone: 0xff8a65, light: 0xffd180 },
  winter: { bg: 0xe3f2fd, zone: 0x90caf9, light: 0xe8f4ff },
};

const threeScenes = {};
const threeRenderers = {};
const threeCameras = {};
const threeZones = {};

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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SEASON_COLORS[season].bg);
  threeScenes[season] = scene;

  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
  camera.position.set(0, 14, 5);
  camera.lookAt(0, 0, 0);
  threeCameras[season] = camera;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeRenderers[season] = renderer;

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(SEASON_COLORS[season].light, 0.6);
  dir.position.set(5, 10, 5);
  scene.add(dir);

  threeZones[season] = [];

  // GLB 로드 시도 → 실패하면 블록 플레이스홀더로 대체
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();

    /* DRACOLoader 연결 (Draco 압축 GLB 지원) */
    if (typeof THREE.DRACOLoader !== 'undefined') {
      const draco = new THREE.DRACOLoader();
      draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
      loader.setDRACOLoader(draco);
    }

    loader.load(
      'models/groundbottom.glb',
      (gltf) => {
        const placeholder = document.getElementById(`placeholder-${season}`);
        if (placeholder) placeholder.style.display = 'none';

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 8 / Math.max(size.x, size.y, size.z);

        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.sub(center.multiplyScalar(scale));

        /* zone_1, zone_2, zone_3 으로 이름 붙은 메시 → 클릭 대상 */
        gltf.scene.traverse(obj => {
          if (!obj.isMesh) return;
          if (obj.name && obj.name.startsWith('zone_')) {
            obj.material = obj.material.clone();
            obj.material.color.setHex(SEASON_COLORS[season].zone);
            obj.userData.zoneId = obj.name.replace('zone_', '');
            threeZones[season].push(obj);
          }
        });

        scene.add(gltf.scene);

        /* GLB 로드 성공 시 블록 존도 클릭 대상에서 제거 */
        if (threeZones[season].some(m => m.userData.fromGlb)) return;
      },
      undefined,
      () => buildBlockGarden(season, scene)  /* 로드 실패 시 블록으로 */
    );
  } else {
    buildBlockGarden(season, scene);
  }

  canvas.addEventListener('click', e => onCanvasClick(e, season));

  window.addEventListener('resize', () => {
    const W2 = canvas.parentElement.clientWidth;
    const H2 = canvas.parentElement.clientHeight;
    threeCameras[season].aspect = W2 / H2;
    threeCameras[season].updateProjectionMatrix();
    threeRenderers[season].setSize(W2, H2);
  });

  (function loop() {
    requestAnimationFrame(loop);
    threeRenderers[season].render(threeScenes[season], threeCameras[season]);
  })();
}

/* 블록 플레이스홀더 (GLB 없을 때 / 로드 실패 시) */
function buildBlockGarden(season, scene) {
  const color = SEASON_COLORS[season].zone;

  /* 스케치 기반 3구역 배치
     1 — 외곽 (왼쪽 큰 타원)
     2 — 중앙 (내부 원)
     3 — 오른쪽 (암석 구역) */
  const zones = [
    { id: '1', x: -3.2, z: 0.5, w: 3.0, d: 4.5 },
    { id: '2', x: 0.2, z: 0.0, w: 2.5, d: 2.5 },
    { id: '3', x: 3.5, z: -0.5, w: 2.0, d: 3.0 },
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

  /* 바닥 */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 14),
    new THREE.MeshLambertMaterial({ color: 0xd7ccc8 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.16;
  scene.add(floor);
}

/* 클릭 → 구역 팝업 (raycasting) */
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

let camera, scene, renderer;

let texture_placeholder,
  isUserInteracting = false,
  onMouseDownMouseX = 0,
  onMouseDownMouseY = 0,
  lon = 90,
  onMouseDownLon = 0,
  lat = 0,
  onMouseDownLat = 0,
  phi = 0,
  theta = 0,
  target = new THREE.Vector3();

function init() {
  let container, mesh;

  container = document.querySelector("#container");
  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    1,
    1100
  );

  scene = new THREE.Scene();

  texture_placeholder = document.createElement("canvas");
  texture_placeholder.width = 128;
  texture_placeholder.height = 128;

  const context = texture_placeholder.getContext("2d");
  context.fillStyle = "rgb( 200, 200, 200 )";
  context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);

  const materials = [
    loadTexture("./space4.jpg"),
    loadTexture("./space2.jpg"),
    loadTexture("./space1.jpg"),
    loadTexture("./space6.jpg"),
    loadTexture("./space3.jpg"),
    loadTexture("./space5.jpg"),
  ];

  mesh = new THREE.Mesh(
    new THREE.BoxGeometry(300, 300, 300, 7, 7, 7),
    new THREE.MultiMaterial(materials)
  );
  mesh.scale.x = -1;
  scene.add(mesh);

  for (let i = 0, l = mesh.geometry.vertices.length; i < l; i++) {
    const vertex = mesh.geometry.vertices[i];

    vertex.normalize();
    vertex.multiplyScalar(550);
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);
  document.addEventListener("mousedown", onDocumentMouseDown, { passive: false });
  document.addEventListener("mousemove", onDocumentMouseMove, { passive: false });
  document.addEventListener("mouseup", onDocumentMouseUp, { passive: false });

  document.addEventListener("touchstart", onDocumentTouchStart, {
    passive: false,
  });
  document.addEventListener("touchmove", onDocumentTouchMove, {
    passive: false,
  });

  window.addEventListener("resize", onWindowResize, { passive: false });
}
init();
function onWindowResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function loadTexture(path) {
  const texture = new THREE.Texture(texture_placeholder);
  const material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });

  const image = new Image();

  image.onload = function () {
    texture.image = this;
    texture.needsUpdate = true;
  };
  image.src = path;

  return material;
}

function onDocumentMouseDown(e) {
  e.preventDefault();

  isUserInteracting = true;
  onPointerDownPointerX = e.clientX;
  onPointerDownPointerY = e.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
}
function update() {
    if (isUserInteracting === false) {
      lon += 0.1;
    }
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    target.x = 500 * Math.sin(phi) * Math.cos(theta);
    target.y = 500 * Math.cos(phi);
    target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.position.copy(target).negate();
    camera.lookAt(target);
    renderer.render(scene, camera);
  }
function onDocumentMouseMove(e) {
  if (isUserInteracting === true) {
    lon = (onPointerDownPointerX - e.clientX) * 0.1 + onPointerDownLon;
    lat = (e.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
  }
}

function onDocumentMouseUp() {
  isUserInteracting = false;
}

function onDocumentTouchStart(e) {
  if (e.touches.length == 1) {
    e.preventDefault();
    onPointerDownPointerX = e.touches[0].pageX;
    onPointerDownPointerY = e.touches[0].pageY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
  }
}

function onDocumentTouchMove(e) {
  if (e.touches.length == 1) {
    e.preventDefault();
    lon =
      (onPointerDownPointerX - e.touches[0].pageX) * 0.1 + onPointerDownLon;
    lat =
      (e.touches[0].pageY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
  }
}

function animate() {
  requestAnimationFrame(animate);
  update();
}
animate();


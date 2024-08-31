// Initialize Three.js
    let camera, scene, renderer, group, texture_placeholder, isUserInteracting = false, onMouseDownMouseX = 0, onMouseDownMouseY = 0, lon = 90, onMouseDownLon = 0, lat = 0, onMouseDownLat = 0, phi = 0, theta = 0, target = new THREE.Vector3();

    function init() {
      const container = document.querySelector("#container");

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 10;

      scene = new THREE.Scene();

      texture_placeholder = document.createElement("canvas");
      texture_placeholder.width = 128;
      texture_placeholder.height = 128;
      const context = texture_placeholder.getContext("2d");
      context.fillStyle = "rgb(200, 200, 200)";
      context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);

      const materials = [
        loadTexture("./space4.jpg"),
        loadTexture("./space2.jpg"),
        loadTexture("./space1.jpg"),
        loadTexture("./space6.jpg"),
        loadTexture("./space3.jpg"),
        loadTexture("./space5.jpg")
      ];

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(300, 300, 300, 7, 7, 7),
        new THREE.MeshBasicMaterial({ map: materials })
      );
      mesh.scale.x = -1;
      scene.add(mesh);

      for (let i = 0, l = mesh.geometry.vertices.length; i < l; i++) {
        const vertex = mesh.geometry.vertices[i];
        vertex.normalize();
        vertex.multiplyScalar(550);
      }

      renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Lights Setup
      const pointlight = new THREE.PointLight(0x85ccb8, 7.5, 20);
      pointlight.position.set(0, 3, 2);
      scene.add(pointlight);

      const pointlight2 = new THREE.PointLight(0x9f85cc, 7.5, 20);
      pointlight2.position.set(0, 3, 2);
      scene.add(pointlight2);

      // Load HDR environment map
      const hdrEquirect = new THREE.RGBELoader()
        .setPath('https://raw.githubusercontent.com/miroleon/gradient_hdr_freebie/main/Gradient_HDR_Freebies/')
        .load('ml_gradient_freebie_01.hdr', function () {
          hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        });
      scene.environment = hdrEquirect;
      scene.fog = new THREE.FogExp2(0x2A6F8E, 0.15);

      // Load OBJ model
      const objloader = new THREE.OBJLoader();
      objloader.load(
        'https://raw.githubusercontent.com/miroleon/peace-of-mind/main/assets/buddha.obj',
        (object) => {
          const material1 = new THREE.MeshStandardMaterial({
            color: 0x1fffff,
            roughness: 0,
            metalness: 0.5,
            envMapIntensity: 10
          });
          object.children[0].material = material1;
          object.scale.setScalar(20);
          object.position.set(0, -0.25, 0);
          scene.add(object);
        }
      );

      document.addEventListener("mousedown", onDocumentMouseDown, { passive: false });
      document.addEventListener("mousemove", onDocumentMouseMove, { passive: false });
      document.addEventListener("mouseup", onDocumentMouseUp, { passive: false });

      document.addEventListener("touchstart", onDocumentTouchStart, { passive: false });
      document.addEventListener("touchmove", onDocumentTouchMove, { passive: false });

      window.addEventListener("resize", onWindowResize, { passive: false });

      animate();
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

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function update() {
      if (!isUserInteracting) {
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

    function onDocumentMouseDown(e) {
      e.preventDefault();
      isUserInteracting = true;
      onMouseDownMouseX = e.clientX;
      onMouseDownMouseY = e.clientY;
      onMouseDownLon = lon;
      onMouseDownLat = lat;
    }

    function onDocumentMouseMove(e) {
      if (isUserInteracting) {
        lon = (onMouseDownMouseX - e.clientX) * 0.1 + onMouseDownLon;
        lat = (e.clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
      }
    }

    function onDocumentMouseUp() {
      isUserInteracting = false;
    }

    function onDocumentTouchStart(e) {
      if (e.touches.length == 1) {
        e.preventDefault();
        onMouseDownMouseX = e.touches[0].pageX;
        onMouseDownMouseY = e.touches[0].pageY;
        onMouseDownLon = lon;
        onMouseDownLat = lat;
      }
    }

    function onDocumentTouchMove(e) {
      if (e.touches.length == 1) {
        e.preventDefault();
        lon = (onMouseDownMouseX - e.touches[0].pageX) * 0.1 + onMouseDownLon;
        lat = (e.touches[0].pageY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      update();
    }

    // Parallax Effect
    const textBehind = document.getElementById('text-behind');
    const textFront = document.getElementById('text-front');
    const textBehindBlur = document.getElementById('text-behind-blur');
    const canvasRect = document.getElementById('canvas');

    const parallaxScaling1 = 0.0005;
    const parallaxScaling2 = 0.00025;
    const parallaxScaling3 = 0.0000001;

    let currentScroll = 0;
    let targetScroll = 0;
    let ease = 0.001;
    let theta1 = 0;

    function updateScale() {
      let rect = canvasRect.getBoundingClientRect();
      let startScrollPosition = window.pageYOffset + rect.top;
      let endScrollPosition = window.pageYOffset + rect.bottom;

      if (targetScroll + window.innerHeight < startScrollPosition || targetScroll > endScrollPosition) {
        return;
      }

      currentScroll += (targetScroll - currentScroll) * ease;

      let scaleValue1 = 1 + (currentScroll * parallaxScaling1);
      let scaleValue2 = 1 + (currentScroll * parallaxScaling2);

      textBehind.style.transform = `scale(${scaleValue1})`;
      textFront.style.transform = `scale(${scaleValue1})`;
      textBehindBlur.style.transform = `scale(${scaleValue1})`;
      canvasRect.style.transform = `scale(${scaleValue2})`;

      theta1 += currentScroll * parallaxScaling3;

      setTimeout(updateScale, 1000 / 60);
    }

    window.addEventListener('scroll', () => {
      targetScroll = window.pageYOffset;
      updateScale();
    });

    updateScale();

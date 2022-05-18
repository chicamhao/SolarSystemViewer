var scene, camera, renderer;
var earth, clouds, moon, mercury;

const sunPosition = new THREE.Vector3(0, 0, 0);
const sunRadius = 10;

const earthPosition = new THREE.Vector3(30, 0, 0);
const earthRadius = 1;

const mercuryPosition = new THREE.Vector3(1000, 0, 0);
const mercuryRadius = 5;

//moon orbit
const radius = 35;
var theta = 0;
var deltaTheta = 2 * Math.PI / 1000;

const cameraDeltaMovement = new THREE.Vector3(.01, -.01, -.05);

// initial scene, camera, renderer
function init(){
     scene = new THREE.Scene();
     camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000);
     scene.add(camera);
     camera.position.set(0,35,400);

     renderer = new THREE.WebGLRenderer({antialias: true});
     renderer.setSize(window.innerWidth, window.innerHeight);
     document.body.appendChild(renderer.domElement);

     var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
}

// initial light, earth, moon
function fillScene(){
    // light
     var ambientLight = new THREE.AmbientLight(0xaaaaaa);
     scene.add(ambientLight);

     var sunLight = new THREE.DirectionalLight(0xffffff);
     sunLight.position.set(100, 100, 50);
     scene.add(sunLight);

     //sun
     var sunGeometry = new THREE.SphereGeometry(sunRadius, 50, 50);
     var sunMaterial = new THREE.MeshPhongMaterial({
       map: new THREE.TextureLoader().load("textures/moon_texture.jpg"),
       color: 0xf2f2f2,
       specular: 0xbbbbbb,
       shininess: 2
     });
     sun = new THREE.Mesh(sunGeometry, sunMaterial);
     sun.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
     scene.add(sun);

     //earth
     var earthGeometry = new THREE.SphereGeometry(earthRadius, 50, 50);
     var earthMaterial = new THREE.MeshPhongMaterial({
       map: new THREE.TextureLoader().load("textures/earth_texture.jpg"),
       color: 0xf2f2f2,
       specular: 0xbbbbbb,
       shininess: 2
     });
     earth = new THREE.Mesh(earthGeometry, earthMaterial);
     earth.position.set(earthPosition.x, earthPosition.y, earthPosition.z);
     //scene.add(earth);

     // clouds
     var cloudGeometry = new THREE.SphereGeometry(earthRadius + .2,  50, 50);
     var cloudMaterial = new THREE.MeshPhongMaterial({
       map: new THREE.TextureLoader().load("textures/clouds.jpg"),
       transparent: true,
       opacity: 0.1
     });
     clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
     earth.add(clouds);

     //mercury
     var earthGeometry = new THREE.SphereGeometry(mercuryRadius, 50, 50);
     var earthMaterial = new THREE.MeshPhongMaterial({
       map: new THREE.TextureLoader().load("textures/earth_texture.jpg"),
       color: 0xf2f2f2,
       specular: 0xbbbbbb,
       shininess: 2
     });
     mercury = new THREE.Mesh(earthGeometry, earthMaterial);
     mercury.position.set(mercuryPosition.x, mercuryPosition.y, mercuryPosition.z);
     scene.add(mercury);

     // stars
     var starGeometry = new THREE.SphereGeometry(1000, 50, 50);
     var starMaterial = new THREE.MeshPhongMaterial({
       map: new THREE.TextureLoader().load("textures/galaxy.png"),
       side: THREE.DoubleSide,
       shininess: 0
     });
     var starField = new THREE.Mesh(starGeometry, starMaterial);
     scene.add(starField);

     // moon 
     var moonGeometry = new THREE.SphereGeometry(3.5, 50,50);
     var moonMaterial = new THREE.MeshPhongMaterial({
       map: new THREE.TextureLoader().load("textures/moon_texture.jpg")
     });
     moon = new THREE.Mesh(moonGeometry, moonMaterial);
     moon.position.set(35,0,0);
     //scene.add(moon);
}

// update earth, clouds, camera movement
function render() {
    earth.rotation.y += .0009;
    clouds.rotation.y += .00005;

    // moon orbit        
    theta += deltaTheta;
    moon.position.x = radius * Math.cos(theta);
    moon.position.z = radius * Math.sin(theta);

    earth.position.x = radius * Math.cos(theta);
    earth.position.z = radius * Math.sin(theta);

    mercury.position.x = radius * Math.cos(theta);
    mercury.position.z = radius * Math.sin(theta);


    //reset flyby if camera is close to earth
    if (camera.position.z < 0) {
      cameraDeltaMovement.setX(cameraDeltaMovement.x * -1);
    }
    //reset flyby if camera is far from eath
    else if (camera.position.z < -100) {
      camera.position.set(0,35,70);
    }  

    camera.position.x += cameraDeltaMovement.x;
    camera.position.y += cameraDeltaMovement.y;
    camera.position.z += cameraDeltaMovement.z;

    camera.lookAt(sunPosition);
    renderer.render(scene, camera);
}

// animation loop
function animate(){
    window.requestAnimationFrame(animate);
    render();
}

try {
    init();
    fillScene();
    animate();
} catch(e) {
    var error = "encountered an error:<br/><br/>";
    $('#container').append(error + e);
}


// *
// reference: https://mattloftus.github.io
// *
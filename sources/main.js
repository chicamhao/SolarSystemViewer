//size's scale
const eScale = (1 / 510) * 0.00002;
const diameterScale = 1000;

//time's scale
const defaultTimeScale = 1000000;
const secInDay = 87600;
var tScale = defaultTimeScale;
var t1 = Date.now() / diameterScale;

var planets = [];
var planetObjects = {};
var scene, camera, renderer;
var sunLight;

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000);
    scene.add(camera);
    camera.position.set(0, 5, 20);
  
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  
    new THREE.OrbitControls(camera, renderer.domElement);

    // intial planet's data
    planetDatas.forEach(function (planet) {
    planets.push({
      "name" : planet.name,
      "theta" : 0,
      "dTheta" : (2 * Math.PI) / (planet.period_days * secInDay),
      "diameter" : planet.diameter * eScale * diameterScale,
      "distance_KM" : planet.distance_KM * eScale,
      "period" : planet.period * tScale,
      "inclination" : planet.inclination * (Math.PI / 180),
      "rotation" : (2 * Math.PI) / (planet.rotation_days * secInDay)
    });
  });
}

function fillScene(){
  // light
  var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, .3 );
  scene.add(light);

  sunLight = new THREE.PointLight(0xffffff);
  sunLight.position.set(0,0,0);
  scene.add(sunLight);

  // sun
  var sunGeometry = new THREE.SphereGeometry(1, 50, 50);
  var sunMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("textures/sun_texture.jpg"),
    color: 0xf2e8b7,
    emissive: 0x91917b,
    specular: 0x777d4a,
    shininess: 62,
  });
  var sunObject = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunObject);

  // starfield
  var starGeometry = new THREE.SphereGeometry(window.innerHeight, 100, 100);
  var starMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("textures/galaxy_starfield.png"),
    side: THREE.DoubleSide,
    shininess: 5
  });
  var starField = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(starField);

  // planetary trajectories
  var trajectories = {};
  planets.forEach(function (planet) {
    
    var targetMaterial = new THREE.LineDashedMaterial({
        color: 0xfffff,
        transparent: true, 
        opacity: .4, 
        dashSize: 5,
        gapSize: 5
    });
    var targetOrbit = new THREE.EllipseCurve(
      0,0,
      planet.distance_KM, planet.distance_KM, 
      0, 2.0 * Math.PI, 
      false);
    var targetPath = new THREE.CurvePath(targetOrbit.getPoints(1000));
    targetPath.add(targetOrbit);
    var targetGeometry = targetPath.createPointsGeometry(100);

    var targetTrajectory = new THREE.Line(targetGeometry, targetMaterial);
    targetTrajectory.rotation.x += Math.PI / 2 + planet.inclination;
    scene.add( targetTrajectory );
    trajectories[planet.name] = targetTrajectory;
  });

  // planets 
  planets.forEach(function (planet) {
      var planetGeometry = new THREE.SphereGeometry(planet.diameter, 50, 50);
      var planetMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("textures/" + planet.name + "_texture.jpg"),
      color: 0xf2f2f2,
      specular: 0xbbbbbb,
      shininess: 2
    });
    
    var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.x = planet.distance_KM;
    scene.add( planetMesh );
    planetObjects[planet.name] = planetMesh;
  });

  
}

function render() {
  var t2 = Date.now() / 1000;
  var dT = (t2 - t1) * tScale;
  t1 = t2;

  //adjust sun's light
  if (Math.abs(planetObjects['earth'].rotation.y  % Math.PI, 0) < 0.01)
    sunLight.intensity = Math.random(0.5, 1);

  // planet's movement  
  planets.forEach(function (planet) {

    planetObjects[planet.name].rotation.y += planet.rotation * diameterScale / 10;

    var dTheta = planet.dTheta * dT; 
    planet.theta += dTheta;

    // moon's movement based on earth
    if (planet.name == 'moon'){
      planetObjects[planet.name].position.z = planetObjects['earth'].position.z + planet.distance_KM * Math.sin(planet.theta);
      planetObjects[planet.name].position.x = planetObjects['earth'].position.x + planet.distance_KM * Math.cos(planet.theta);
      planetObjects[planet.name].position.y = - planetObjects['earth'].position.y + planet.distance_KM * Math.sin(planet.theta) *  planet.inclination;

      return;
    }

    planetObjects[planet.name].position.z = planet.distance_KM * Math.sin(planet.theta);
    planetObjects[planet.name].position.x = planet.distance_KM * Math.cos(planet.theta);
    planetObjects[planet.name].position.y = - planet.distance_KM * Math.sin(planet.theta) *  planet.inclination;
  });

  renderer.render(scene, camera);
}

function animate() 
{
  window.requestAnimationFrame(animate);
  render();
}

try {
  init();
  fillScene();
  animate();
}catch(e){
  var error = "encounter an error:<br/><br/>";
  $('#container').append(error + e);
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event){
  var keyCode = event.which;
  console.log(keyCode);
  switch(keyCode){
    case 187:
      tScale *= 2;
      break;
    case 189:
      tScale *= 0.5;
      break;
    case 220:
      tScale = defaultTimeScale;
        break;
    case 49:  
      camera.lookAt(0);
      break;
    case 50:
      camera.lookAt(planetObjects['earth'].position);
      break;
    case 51:
      camera.lookAt(planetObjects['mars'].position);
      break;
    case 52:
      camera.lookAt(planetObjects['moon'].position);
      break;
    case 53:
      camera.lookAt(planetObjects['jupiter'].position);
      break;
    case 54:
      camera.lookAt(planetObjects['saturn'].position);
      break;
    case 55:
      camera.lookAt(planetObjects['uranus'].position);
      break;
    case 56:
      camera.lookAt(planetObjects['neptune'].position);
      break;
    case 57:
      camera.lookAt(planetObjects['pluto'].position);
      break;
  }
}


// reference: https://mattloftus.github.io
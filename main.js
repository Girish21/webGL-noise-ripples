import './style.css'
import * as THREE from 'three'
import fragmentShader from './shaders/fragment.frag?raw'
import vertexShader from './shaders/vertex.vert?raw'
import brush from './assets/brush.png'
import background from './assets/landscape-bg.jpeg'

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
}

let mouse = new THREE.Vector2()
let prevMouse = new THREE.Vector2()

let currentWave = -1
const maxes = 50
const meshes = []

const canvas = document.getElementById('webGL')

const frustrumSize = size.height
const aspect = size.width / size.height

const scene = new THREE.Scene()
const baseScene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(
  (frustrumSize * aspect) / -2,
  (frustrumSize * aspect) / 2,
  frustrumSize / 2,
  frustrumSize / -2,
  -1000,
  1000
)
const renderer = new THREE.WebGLRenderer({ canvas })
const baseTexture = new THREE.WebGLRenderTarget(size.width, size.height, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
})
const clock = new THREE.Clock()

// camera.fov = 75
// camera.aspect = size.width / size.height
// camera.far = 100
// camera.near = 0.1
camera.position.set(0, 0, 1)

scene.add(camera)

const textureGeometry = new THREE.PlaneBufferGeometry(
  size.width,
  size.height,
  1,
  1
)
const textureMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uDisplacement: { value: null },
    uTexture: { value: new THREE.TextureLoader().load(background) },
  },
})
const textureMesh = new THREE.Mesh(textureGeometry, textureMaterial)
baseScene.add(textureMesh)

const geometry = new THREE.PlaneBufferGeometry(64, 64, 1, 1)
for (let i = 0; i < maxes; i++) {
  const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(brush),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.z = 2 * Math.PI * Math.random()
  mesh.visible = false
  meshes.push(mesh)
  scene.add(mesh)
}

function resizeHandler() {
  size.height = window.innerHeight
  size.width = window.innerWidth

  mouse.x = 0
  mouse.y = 0

  camera.aspect = size.width / size.height
  camera.updateProjectionMatrix()

  renderer.setSize(size.width, size.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
resizeHandler()
window.addEventListener('resize', resizeHandler)

function trackMouse() {
  if (
    Math.abs(mouse.x - prevMouse.x) < 4 ||
    Math.abs(mouse.y - prevMouse.y) < 4
  ) {
    return
  }
  function setNewWave() {
    const mesh = meshes[currentWave]
    mesh.visible = true
    mesh.material.opacity = 0.5
    mesh.scale.x = mesh.scale.y = 0.2
    mesh.position.x = mouse.x
    mesh.position.y = mouse.y
  }
  currentWave = (currentWave + 1) % maxes
  setNewWave()
  prevMouse = new THREE.Vector2().copy(mouse)
}

function tick() {
  const elapsedTime = clock.getElapsedTime()

  trackMouse()

  textureMesh.visible = false
  renderer.setRenderTarget(baseTexture)
  renderer.render(scene, camera)
  textureMaterial.uniforms.uDisplacement.value = baseTexture.texture
  renderer.setRenderTarget(null)
  renderer.clear()
  textureMesh.visible = true

  for (const mesh of meshes) {
    if (!mesh.visible) {
      continue
    }
    mesh.rotation.z += 0.01
    mesh.material.opacity *= 0.96
    mesh.scale.x = mesh.scale.y = mesh.scale.x * 0.982 + 0.108

    if (mesh.material.opacity < 0.002) {
      mesh.visible = false
    }
  }

  renderer.render(baseScene, camera)

  window.requestAnimationFrame(tick)
}
tick()

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
const event = isTouch ? 'touchmove' : 'mousemove'
window.addEventListener(event, e => {
  if (isTouch && e.touches?.[0]) {
    const touchEvent = e.touches[0]
    mouse.x = touchEvent.clientX - size.width / 2
    mouse.y = -touchEvent.clientY + size.height / 2
  } else {
    mouse.x = e.clientX - size.width / 2
    mouse.y = -e.clientY + size.height / 2
  }
})

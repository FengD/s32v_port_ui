import * as THREE from './threejs/three.module.js';
import { OrbitControls } from './threejs/jsm/controls/OrbitControls.js';
import { PCDLoader } from './threejs/jsm/loaders/PCDLoader.js';

var View = function () {
  this.camera = undefined;
  this.controls = undefined;
  this.scene = undefined;
  this.renderer = undefined;
  this.init();
  // animate();
  // var that = this;
  // function animate () {
  //   requestAnimationFrame( animate );
  //   console.log(that.controls);
  //   that.controls.update();
  //   that.renderer.render( that.scene, that.camera );
  // }
};

Object.assign( View.prototype, {
  constructor: View,

  init: function () {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );

    this.camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 0.01, 10000 );
    this.camera.position.z = 300;
    this.camera.up.set( 0, 0, 1 );

    this.scene.add( this.camera );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight - 45);
    document.body.appendChild( this.renderer.domElement );

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.PointsMaterial( { size: 0.01 } );

    var mesh = new THREE.Points( geometry, material );
    var name = "Right_Cloud";
    mesh.name = name;

    this.scene.add(mesh);
    var container = $("#view").append(this.renderer.domElement);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 3.0;
    this.controls.panSpeed = 1.0;
    this.controls.staticMoving = true;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 0.1 * 10000;
    this.controls.target.set( 0, 0, 0);
  },

  getCamera: function() {
    return this.camera;
  },

  getControls: function() {
    return this.controls;
  },

  getScene: function() {
    return this.scene;
  },

  getRenderer: function() {
    return this.renderer;
  },

  addCloud: function(filePath, name) {
    var that = this;
    setInterval(function() {
      var loader = new PCDLoader();
      loader.load( filePath, function ( cloud ) {
        var points = that.scene.getObjectByName( name );
        points.geometry = cloud.geometry;
      } );
    }, 100);
  }

});

export { View };

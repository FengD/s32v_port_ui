import * as THREE from './threejs/three.module.js';
import { OrbitControls } from './threejs/jsm/controls/OrbitControls.js';
import { PCDLoader } from './threejs/jsm/loaders/PCDLoader.js';
import { YAMLLoader } from './YAMLLoader.js';

var View = function () {
  this.camera = undefined;
  this.controls = undefined;
  this.scene = undefined;
  this.renderer = undefined;
  this.init();
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

  addCloud: function(path, name, check) {
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.PointsMaterial( { size: 1 } );
    var mesh = new THREE.Points( geometry, material );
    mesh.name = name;
    this.scene.add(mesh);

    var that = this;
    setInterval(function() {
      if ($("." + check).is(':checked')) {
        var loader = new PCDLoader();
        loader.load( path, function ( cloud ) {
          var points = that.scene.getObjectByName( name );
          points.geometry = cloud.geometry;
        } );
      }
    }, 100);
  },

  addFreespace: function(path, name, check) {
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    for (var i = 0; i <= 360; i++) {
      geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }

    for (var i = 0; i < 359; i++) {
      geometry.faces.push(new THREE.Face3(0, i + 1, i + 2));
    }
    geometry.faces.push(new THREE.Face3(0, 360, 1));

    var fs = new THREE.Mesh(geometry, material);
    fs.name = name;
    fs.visible = false;
    this.scene.add(fs);

    var that = this;
    setInterval(function() {

      function angPos(r, ang) {
        let _ang = THREE.Math.degToRad(ang);
        let x = r * Math.sin(_ang), y = r * Math.cos(_ang);
        return [x, y];
      }

      if ($("." + check).is(':checked')) {
        var loader = new YAMLLoader();
        loader.load( path, function ( data ) {
          var fs = that.scene.getObjectByName( name );
          for (var i = 0; i < data.fs.length; i++) {
            var p = angPos(data.fs[i], i);
            fs.geometry.vertices[i + 1].set(p[1], p[0], 0);
          }
          fs.geometry.verticesNeedUpdate = true;
        } );
      }
    }, 100);
  },

  addSignboard: function() {
    
  }
});

export { View };

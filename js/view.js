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

  addFreespace: function(name) {
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
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
  },

  addSignboard: function(name) {
    var geometry = new THREE.SphereGeometry(0.5, 30, 30);
    var material = new THREE.MeshBasicMaterial({
      color: '#ff0000',
    });
    var signboard = new THREE.Mesh(geometry, material);
    signboard.name = name;
    signboard.visible = false;
    this.scene.add(signboard);
  },

  addBridge: function(name) {
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial({
      color: 0x0000ff
    });
    geometry.vertices.push(new THREE.Vector3(0, -5, 0));
    geometry.vertices.push(new THREE.Vector3(0, 5, 0));
    var bridge = new THREE.Line(geometry, material);
    bridge.name = name;
    bridge.visible = false;
    this.scene.add(bridge);
  },

  addBoundary: function(path, name, check) {
    var geometry = new THREE.SphereGeometry(0.5, 30, 30);
    var material = new THREE.MeshBasicMaterial({
      color: '#ff0000'
    });
    var signboard = new THREE.Mesh(geometry, material);
    signboard.name = name;
    signboard.visible = false;
    this.scene.add(signboard);
    var that = this;
    setInterval(function() {
      if ($("." + check).is(':checked')) {
        var loader = new YAMLLoader();
        loader.load( path, function ( data ) {
          var signboard = that.scene.getObjectByName( name );
          if (data.signboard.type == 0) {
            signboard.visible = false;
          } else {
            signboard.position.x = data.signboard.x;
            signboard.position.y = data.signboard.y;
            signboard.visible = true;
          }
        } );
      }
    }, 100);
  },

  updateDetection: function (path) {
    function angPos(r, ang) {
      let _ang = THREE.Math.degToRad(ang);
      let x = r * Math.sin(_ang), y = r * Math.cos(_ang);
      return [x, y];
    }

    function updateFreespace(scene, data) {
      if ($(".freespace_check").is(':checked')) {
        var fs = scene.getObjectByName( 'freespace' );
        for (var i = 0; i < data.length; i++) {
          var p = angPos(data[i], i);
          fs.geometry.vertices[i + 1].set(p[1], p[0], 0);
        }
        fs.geometry.verticesNeedUpdate = true;
      }
    }

    function updateSignboard(scene, data) {
      if ($(".signboard_check").is(':checked')) {
        var signboard = scene.getObjectByName( 'signboard' );
        if (data.type == 0) {
          signboard.visible = false;
        } else {
          signboard.position.x = data.x;
          signboard.position.y = data.y;
          signboard.visible = true;
        }
      }
    }

    function updateBridge(scene, data) {
      if ($(".bridge_check").is(':checked')) {
        var bridge = that.scene.getObjectByName( 'bridge' );
        if (data.flag == 0) {
          bridge.visible = false;
        } else {
          bridge.geometry.vertices[0].set(data.b, -5, 0);
          bridge.geometry.vertices[1].set(data.b, 5, 0);
          bridge.geometry.verticesNeedUpdate = true;
          bridge.visible = true;
        }
      }
    }

    var that = this;
    setInterval(function() {
      var loader = new YAMLLoader();
      loader.load( path, function ( data ) {
        updateFreespace(that.scene, data.fs);
        updateSignboard(that.scene, data.signboard);
        updateBridge(that.scene, data.bridge);
      } );
    }, 100);
  }
});

export { View };

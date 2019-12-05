import { View } from './view.js';

(function($) {
	var	$window = $(window);
	$window.on('load', function() {
		$.getJSON("source/jsons/cn.json",function(data) {
			$('#homepage').createNav(data.nav);
			$('#homepage').createView();

			var view = new View();
			animate();
			createClouds();
			createDetection();

		  function animate () {
		    requestAnimationFrame( animate );
		    view.getControls().update();
		    view.getRenderer().render( view.getScene(), view.getCamera() );
		  }

			function createClouds() {
				$.each(data.view.clouds, function(index, cloud) {
					view.addCloud(cloud.path, cloud.name, cloud.check);
					checkAction(cloud.name, cloud.check);

				});
			}

			function createDetection() {
				var fs = data.view.detections.freespace;
				view.addFreespace(fs.path, fs.name, fs.check);
				checkAction(fs.name, fs.check);
			}

			function checkAction(name, check) {
				$("." + check).change(function() {
					if($(this).is(':checked')) {
						view.getScene().getObjectByName( name ).visible = true;
					} else {
						view.getScene().getObjectByName( name ).visible = false;
					}
				});
			}

	    window.addEventListener( 'resize', function() {
	      view.getCamera().aspect = window.innerWidth / window.innerHeight;
	      view.getCamera().updateProjectionMatrix();
	      view.getRenderer().setSize( window.innerWidth, window.innerHeight - 45);
	    }, false );

	    window.addEventListener( 'keypress', function(ev) {

				function changeCloudColor(points, color) {
					points.material.color.setHex( color );
					points.material.needsUpdate = true;
				}

				function changeCloudSize(points, isLarger) {
					if (isLarger) {
						points.material.size *= 1.2;
	          points.material.needsUpdate = true;
					} else {
						points.material.size /= 1.2;
	          points.material.needsUpdate = true;
					}
					if (points.material.size > 5) {
						points.material.size = 5;
					}
					if (points.material.size < 0.2) {
						points.material.size = 0.2;
					}
				}

	      var left_points = view.getScene().getObjectByName( 'left_cloud' );
				var right_points = view.getScene().getObjectByName( 'right_cloud' );
				var top_points = view.getScene().getObjectByName( 'top_cloud' );
	      switch ( ev.key || String.fromCharCode( ev.keyCode || ev.charCode ) ) {
	        case '+':
	          changeCloudSize(left_points, true);
						changeCloudSize(right_points, true);
						changeCloudSize(top_points, true);
	          break;
	        case '-':
						changeCloudSize(left_points, false);
						changeCloudSize(right_points, false);
						changeCloudSize(top_points, false);
	          break;
	        case 'c':
						changeCloudColor(left_points, Math.random() * 0xffffff);
						changeCloudColor(right_points, Math.random() * 0xffffff);
						changeCloudColor(top_points, Math.random() * 0xffffff);
	          break;
					case 'C':
						changeCloudColor(left_points, 0xffffff);
						changeCloudColor(right_points, 0xffffff);
						changeCloudColor(top_points, 0xffffff);
						break;
	      }
	    });
    });
	});
})(jQuery);

import { View } from './view.js';

(function($) {
	var	$window = $(window);
	$window.on('load', function() {
		$.getJSON("source/json/cn.json",function(data) {
			$('#homepage').createNav(data.nav);
			$('#homepage').createView();

			var view = new View();

			animate();

		  function animate () {
		    requestAnimationFrame( animate );
		    view.getControls().update();
		    view.getRenderer().render( view.getScene(), view.getCamera() );
		  }

			view.addCloud('source/pcds/right.pcd', 'Right_Cloud');

	    window.addEventListener( 'resize', function() {
	      view.getCamera().aspect = window.innerWidth / window.innerHeight;
	      view.getCamera().updateProjectionMatrix();
	      view.getRenderer().setSize( window.innerWidth, window.innerHeight - 45);
	    }, false );

	    window.addEventListener( 'keypress', function(ev) {
	      console.log(ev);
	      var points = view.getScene().getObjectByName( 'Right_Cloud' );
	      switch ( ev.key || String.fromCharCode( ev.keyCode || ev.charCode ) ) {
	        case '+':
	          points.material.size *= 1.2;
	          points.material.needsUpdate = true;
	          break;
	        case '-':
	          points.material.size /= 1.2;
	          points.material.needsUpdate = true;
	          break;
	        case 'c':
	          points.material.color.setHex( Math.random() * 0xffffff );
	          points.material.needsUpdate = true;
	          break;
	      }
	    } );

			$(".right_cloud_check").change(function() {
		    if($(this).is(':checked')) {
		      view.getScene().getObjectByName( 'Right_Cloud' ).visible = true;
		    } else {
		      view.getScene().getObjectByName( 'Right_Cloud' ).visible = false;
		    }
		  });
    });
	});
})(jQuery);

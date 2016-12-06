$(document).ready(function(){
	console.log('Loaded!')

	
	let allId = $('.video')
	console.log(allId)

	for ( i = 0 ; i < allId.length ; i++){
		$(allId[i]).hide(function(){
			console.log('Where they at tho?')
		})
	}

	$('#0').show(function(){
		console.log('Hi there! I am here!')
	})

	var counter = 0

	$('#update').click(function(){	
		console.log('button clicked')

		$('#' + counter).remove()
		counter++
		$('#' + counter).show()
	})

	$('#add').click(function(){	
		var video = {video: $('.video').attr('src')}
		console.log(video)
		$.post('/favevideo',video ,(data)=>{
			console.log("YOOO:"+data)
			$('#' + counter).remove()
			counter++
			$('#' + counter).show()
		})
	})

	//bootstrap part
	$('#faya').click(function() {
		$(location).attr('href', 'http://localhost:8000/auth/google')
	})





})
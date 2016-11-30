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
		
		$('#' + counter).hide()
		counter++
		$('#' + counter).show()
	})
})
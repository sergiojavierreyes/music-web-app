//Import Mdules
const sequelize = require('sequelize')
const express = require ('express')
const app = express()
const pg = require ('pg')
const bodyParser = require ('body-parser')
const session = require('express-session');
const ypi  = require ('youtube-playlist-info')

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")

app.use('/resources',express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
	secret: 'random stuff',
	resave: true,
	saveUninitialized: false
}));



//Define database structure
let db = new sequelize('musicapp', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server:'localhost',
	dialect: 'postgres'
})

//Create tables
let User = db.define('user', {
	name: sequelize.STRING,
	email: sequelize.STRING,
	idtoken: sequelize.STRING
})

let Media = db.define('media', {
	video: sequelize.STRING
})


//Define Relations

app.get('/',(req,res)=>{
	//Loops through all videos
	ypi.playlistInfo("AIzaSyB643_Jt_IPP8c0ElYR43SVYYFyk-e0nd0", "PLTG9OTg_jhUxfzo8aPKvncqQt6RgUQgaK", function(playlistItems) {
		// console.log(playlistItems)
		array = []
		for (var i = playlistItems.length - 1; i >= 0; i--) {
			// console.log(playlistItems[i].resourceId.videoId)
			array.push(playlistItems[i].resourceId.videoId)
		}
		res.send(array)

	})
	// res.render('index')
})


// db.sync({force: false}).then(db => {
// 	console.log('We synced bruh!')
// })

app.listen(8000,()=>{
	console.log("8000 IAM ALL THE WAY UP!")
})

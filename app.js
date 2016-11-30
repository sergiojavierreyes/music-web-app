//Import Mdules
const sequelize = require('sequelize')
const express = require ('express')
const app = express()
const pg = require ('pg')
const bodyParser = require ('body-parser')
const session = require('express-session');
const ypi  = require ('youtube-playlist-info')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');

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
let Profile = db.define('profile', {
	token: sequelize.STRING,
	email: sequelize.STRING,
	name: sequelize.STRING
})

let Media = db.define('media', {
	video: sequelize.STRING
})

//Define Relations
Profile.hasMany(Media)
Media.belongsTo(Profile)


var globalFun =	ypi.playlistInfo("AIzaSyBqfoN0DrRKAlaqTvz8NoPCKDZkoaX5Zr8", "PLTG9OTg_jhUxfzo8aPKvncqQt6RgUQgaK", (playlistItems) => {
	// let array = []
	for (var i = playlistItems.length - 1; i >= 0; i--) {
		// array.push(playlistItems[i].resourceId.videoId)
		Media.create({
			video: 'https://www.youtube.com/embed/' + playlistItems[i].resourceId.videoId
		})
	}
	ypi.playlistInfo()
})



//Shows the selection of video's
app.get('/video', (req, res) =>{
	Media.findAll({
		order: [
		sequelize.fn('Random')]
	}).then(show =>{
		res.render('video', {
			video: show
		})
	});
});

db.sync({force: true}).then(db => {
	console.log('We synced bruh!')
})

app.listen(8000,()=>{
	console.log("8000 IAM ALL THE WAY UP!")
})
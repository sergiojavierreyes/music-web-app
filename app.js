//Import Mdules
const sequelize = require('sequelize')
const express = require ('express')
const app = express()
const pg = require ('pg')
const bodyParser = require ('body-parser')
const session = require('express-session');
const ypi  = require ('youtube-playlist-info')
const arrayStrip = require('./src/array_module.js')

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


let arrayFromYoutube = ypi.playlistInfo()
console.log(arrayFromYoutube);


db.sync({force: false}).then(db => {
	console.log('We synced bruh!')
})

app.listen(8000,()=>{
	console.log("8000 IAM ALL THE WAY UP!")
})
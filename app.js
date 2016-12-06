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

app.use( passport.initialize());
app.use( passport.session());

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

// if user is authenticated in the session, carry on
if (req.isAuthenticated())
	return next();

// if they aren't redirect them to the home page
res.redirect('/');
}


//Define database structure
let db = new sequelize('musicapp', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server:'localhost',
	dialect: 'postgres'
})

//Create tables
let User = db.define('user', {
	gid: sequelize.STRING,
	token: sequelize.STRING,
	email: sequelize.STRING,
	name: sequelize.STRING,

})

let Media = db.define('media', {
	video: {type: sequelize.STRING, unique: true}
})

let Likes = db.define('likes',{
	person: sequelize.INTEGER,
	likedvideo:{type: sequelize.STRING, unique: true}
})

//Define Relations
User.hasMany(Media)

Media.hasMany(Likes)
Likes.belongsTo(Media)

User.hasMany(Likes)
Likes.belongsTo(User)

var globalFun = ypi.playlistInfo("AIzaSyBqfoN0DrRKAlaqTvz8NoPCKDZkoaX5Zr8", "PLTG9OTg_jhUxfzo8aPKvncqQt6RgUQgaK", (playlistItems) => {
// let array = []
for (var i = playlistItems.length - 1; i >= 0; i--) {
	Media.create({
		video: 'https://www.youtube.com/embed/' + playlistItems[i].resourceId.videoId
	})
}
ypi.playlistInfo()
});


//Shows the selection of video's
app.get('/video', (req, res) => {
	Media.findAll({
		order: [
		sequelize.fn('Random')]
	}).then(show => {
		res.render('video', {
			video: show
		})
	})
});



app.post('/favevideo', (req,res) => {
	console.log('this is the vid: ' + req.body.video)
	console.log('user is\n' + req.session.user.id)

	Likes.findOne({
		where:{
			likedvideo: req.body.video
		}
	}).then ((fave)=>{
		console.log("Database 1")
		console.log ("fave:"+fave)
		if (fave !== req.body.video){
			console.log("did not like this yet")
			Likes.create({
				person: req.session.user.id,
				likedvideo: req.body.video
			}).then (()=>{
				res.send('succes')
			})
		} else {
			Likes.findOne({
				where:{
					likedvideo: req.body.video
				}
			}).then ((fave)=>{
				console.log("Database 2")
				console.log("FAVE :"+fave.likedvideo)
				if(fave.likedvideo == req.body.video){
					console.log('already liked')
					let liked = "already Liked"
					res.send(fave.likedvideo)
				}

			})
		}
	})
})







passport.serializeUser((user, done) =>{
	console.log('\nSERIALIZE THIS\n')
	console.log(user)
	done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser((id, done) =>{
	console.log('\nDESERIALIZE\n')
	console.log(id)
	User.findById(id).then( ( user) =>{
		done(null, user.get({plain: true}));
	});
});




passport.use(new GoogleStrategy({
	clientID: '218840791548-b7d1m8nffcbnajhcagogff93imsqivvd.apps.googleusercontent.com',
	clientSecret: 'CGCbZloQ_pclgE6YBjwA8f7-',
	callbackURL: "http://localhost:8000/auth/google/callback"

},
function(accessToken, refreshToken, profile, done) {
	console.log('\nGoogle profile\n')
	console.log(profile)
	User.findOne({ where: {'gid' : profile.id }}).then ((user) =>{
		if (user) {

        // if a user is found, log them in
        return done(null, user.get({plain:true}))
    } else {

    	User.create( {
    		gid: profile.id,
    		token: accessToken,
    		email: profile.emails[0].value,
    		name: profile.displayName
    	}).then( (user) => {
    		console.log( '\nResulting user:\n' )
    		return done(null, user.get({plain:true}));
    	} )
    }
})
}))



// route for home page
app.get('/', (req, res)=>{
	res.render('index', { 
		user: req.user 
	});
});

// route for showing the profile page
app.get('/profile', isLoggedIn, (req, res) =>{
	req.session.user = {id: req.user.id}
	Likes.findAll({
		where: {
			person: req.session.user.id
		}
	}).then((post)=>{
		console.log('THIS IS THE POST: ' + post)
		res.render('profile', {
			user : req.user,
			like: post
		});
	})
});

// route for logging out
app.get('/logout', (req, res) =>{
	req.logout();
	res.redirect('/');
});

// send to google to do the authentication
app.get('/auth/google', 
	passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback', passport.authenticate('google', {
	failureRedirect : '/'
}), (req, res) => {
	res.redirect('/profile')
})


db.sync({force: false}).then(db => {
	console.log('We synced bruh!')
})

app.listen(8000,()=>{
	console.log("8000 IAM ALL THE WAY UP!")
})
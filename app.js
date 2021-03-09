if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// values init
//test
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const passport = require('passport');
const initializePassport = require("./passport-config")
const flash = require('express-flash');
const session = require('express-session');

const users = []

initializePassport(
    passport, 
    email => users.find(user=>user.email === email),
    id => users.find(user => user.id === id)
)
app.set('view-engine', 'ejs');


// Use functions
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// 


// home page
app.get("/", checkAuthenticated,(req,res)=>{
    res.render("home.ejs", {name: req.user.name})
})

// Register page 
app.route("/register") 
// Get
.get( checkNotAuthenticated,(req,res)=>{
    res.render("register.ejs")
})
// Post
.post(async(req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect("/login");
    } catch (error) {
        res.redirect("/register")
        
    }
    console.log(users);
})

// Login Page
app.route("/login")
// Get
.get(checkNotAuthenticated, (req,res)=>{
    res.render("login.ejs")
    
})
// Post
.post(passport.authenticate('local', {
    successRedirect: "/",
   failureRedirect: "/login",
   failureFlash: true 
}))


// Checking authentication on a specific page (for example pages that need authenticate -> own todo list page)
function checkAuthenticated(req,res,next) { 
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect("/login");
 }

//  Checking authentication on a specific page (for example login and register pages)
 function checkNotAuthenticated(req, res, next){
     if(req.isAuthenticated()){
         return res.redirect("/");
     }

     next();
 }

//  Page not found - error 404
 app.get('*', (req,res)=>{
    res.send("<h1>Lol error 404</h1>");
})

// Port function
app.listen(3000);
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Movie = require('./models/movie');
const { log } = require('npmlog');

const app = express();

app.use(express.urlencoded({extended : true}));
app.set('view engine','ejs');

const dbURI =  `mongodb+srv://mohis:mohis@ninja-blog.ajgav.mongodb.net/trell?retryWrites=true&w=majority`

mongoose.connect(dbURI,{useNewUrlParser : true , useUnifiedTopology : true })
.then((result) => app.listen(3000,()=> console.log('server started at http://localhost:3000')))
.catch((err)=>console.log(err))


app.get('/',(req,res)=>{
    User.find()
    .then(result => {
        if(result.length > 0)
            res.redirect('/login')
        else
            res.redirect('/signup')
    })
    .catch(err => console.log(err))
})

app.get('/signup',(req,res)=>{
    res.sendFile(__dirname + '/views/signup.html')
})

app.post('/save-user',(req,res)=>{
    const name = req.body.username;
    const pass = req.body.password;
    
    bcrypt.hash(pass, 6 , function(err, hash) {
        
        const user = new User({
            name,
            password : hash
        })

        user.save()
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => console.log(err))
    });
    
})

app.get('/login',(req,res)=>{
    res.sendFile(__dirname + '/views/login.html');
})

app.post('/login',(req,res)=>{
    const name = req.body.username;
    const pass = req.body.password;

    // console.log(name,pass);

    User.find({name : name})
    .then(result => {
        // console.log(result);
        if(result.length > 0)
        {
            // console.log(result[0].password);
            bcrypt.compare(pass, result[0].password, function(err, check) {
                console.log(check);
                if(check == true)
                    res.redirect('/movies')
                else 
                    res.redirect('/signup')
            });
        }
        else
            res.redirect('/signup')
    })
    .catch(err => console.log(err))
})

app.get('/movies',(req,res)=>{
    res.sendFile(__dirname + '/views/movies.html');
})

app.get('/add-movie',(req,res)=>{
    res.sendFile(__dirname + '/views/addMovie.html');
})

app.post('/add-movie',(req,res)=>{
    const name = req.body.name
    const description = req.body.desc 
    const director = req.body.director

    const movie = new Movie({
        name, description , director
    })

    movie.save()
    .then(result => {
        res.redirect('/movies')
    })
    .catch(err => console.log(err))
})


app.post('/search-movie',(req,res)=>{
    // console.log(req.body);
    const movie = req.body.movieName;

    Movie.find({name : movie})
    .then(result => {
        if(result.length > 0)
        res.redirect(`/movies/${movie}`)
        else 
        res.redirect('/movies')
    })
    .catch(err => console.log(err))
})

app.get('/movies/:id',(req,res)=>{
    const movie = req.params.id;

    Movie.find({name : movie})
    .then(result => {
        // res.send(result);
        res.render('showMovie',{movie : result[0]})
    })
    .catch(err => console.log(err))

})
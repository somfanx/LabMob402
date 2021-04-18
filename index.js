var express = require ('express');
var expressHbs = require('express-handlebars')
const path = require('path');
var multer = require('multer');

var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const uri = "mongodb+srv://admin:admin@cluster0.2vogk.mongodb.net/test?retryWrites=true&w=majority";

const mongoose = require('mongoose');
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('connected')
});

var user = mongoose.Schema({
    email : String,
    password : String,
    name : String,
    address : String,
    age : String,
    number_phone : String,
    avatar : String,
    description : String,
})
const userConnect = db.model('users',user)

//thiet lap handlebars
app.engine('handlebars', expressHbs({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(express.static('upload'));

app.use('/public', express.static(__dirname + "public"));
app.use('/upload', express.static(__dirname + "upload"));


app.get('/', function(req, res){
    res.render('index');
});
app.get('/login', function(req, res){
    res.render('login');
});
app.get('/register', function(req, res){
    res.render('register');
});


app.post('/register1',function (req,res) {
    var email = req.body.email;
    var name = req.body.name;
    var phone = req.body.phone;
    var password = req.body.password;

    userConnect({
        email : email,
        password : password,
        name : name,
        address : '',
        age : '',
        number_phone : phone,
        avatar : 'not-found.jpg',
        description : '',
    }).save(function (err){
        if(err){
            res.render('register',{isShow:true,alertMessage:'Dang ky that bai'});
            console.log('dang ky that bai : '+err)
            return ;
        }
        res.render('register',{isShow:true,alertMessage:'Dang ky thanh cong'});
        console.log('dang ky thanh cong');
    })});

// app.post('/login1',async (req,res)=> {
//
//     let users =await userConnect.find({}).lean();
//     console.log(users[0])
//      res.render('home',{
//          arr: users,
//          name: users[0].name,
//          address: users[0].address,
//          age : users[0].age,
//          avatar : users[0].avatar
//      });
// })

app.get('/home',async (req,res) =>{
    let users =await userConnect.find({}).lean();
    console.log('homepage')
    console.log(users[0]);
    if(users.length > 0){
        res.render('home',{
            arr: users,
            name: users[0].name,
            address: users[0].address,
            age : users[0].age,
            avatar : users[0].avatar,
            id: users[0]._id
        });
        return;
    }
    res.render('home');
})
app.get('/home/:id',async (req,res) =>{
    let users =await userConnect.find({}).lean();
    for(let i = 0 ; i < users.length ; i++){
        console.log('param : '+req.params.id)
        if (users[i]._id == req.params.id){
            res.render('home',{
                arr : users,
                name: users[i].name,
                address: users[i].address,
                age : users[i].age,
                avatar : users[i].avatar,
                id : users[i]._id,
            });
            console.log('id : '+req.params.id)
            return
        }
    }
})

app.get('/DeleteUser/:id',async (req,res)=>{
    await userConnect.findByIdAndDelete(req.params.id + '');
    console.log('xoa id:' + req.params.id);
    // let users =await userConnect.find({}).lean();
    // // console.log(users[0])
    // res.render('home',{
    //     arr: users,
    //     name: users[0].name,
    //     address: users[0].address,
    //     age : users[0].age,
    //     avatar : users[0].avatar
    // });
    res.redirect('/home')
})

app.get('/UpdateUser/:id',async (req,res)=>{
    let users =await userConnect.find({}).lean();
    for(let i = 0 ; i < users.length ; i++){
        console.log('param : '+req.params.id)
        if (users[i]._id == req.params.id){
            res.render('UpdateUser',{
                email : users[i].email,
                password : users[i].password,
                phone : users[i].number_phone,
                name: users[i].name,
                address: users[i].address,
                age : users[i].age,
                avatar : users[i].avatar,
                description : users[i].description,
                id : users[i]._id,
            });
            console.log('user : '+users[i])
            return
        }
    }
})

app.post('/UpdateUser/update',async (req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name
    let phone = req.body.phone;
    let address =req.body.address;
    let age = req.body.age;
    let description = req.body.description;
    let idUser = req.body.idUser;

    try {
        await userConnect.findByIdAndUpdate(idUser, {
            email : email,
            password : password,
            number_phone : phone,
            name: name,
            address: address,
            age : age,
            description : description,
        })
        res.redirect('/home/'+idUser);
    } catch (e) {
        res.send('co loi xay ra: ' + e.message)
    }

})

app.get('/UpdateAvatar/:id',async (req,res)=>{
    let users =await userConnect.find({}).lean();
    for(let i = 0 ; i < users.length ; i++){

        if (users[i]._id == req.params.id){
            res.render('UpdateAvatar',{
                avatar : users[i].avatar,
                id : users[i]._id,
            });
            return
        }
    }
})
var tenGoc;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload')
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        tenGoc = file.originalname;
        cb(null, tenGoc);
    }

})

var upload = multer({
    storage:storage,
    limits:{
        fileSize: 2 * 1024 * 1024  // max : 2
    },
    fileFilter:function (req,file,cb) {
        if (file.mimetype == 'image/jpg' || file.mimetype == 'image/png' ||file.mimetype == 'image/jpeg' ){
            cb(null,true);
        }else{
            cb(new Error('Goes wrong on the mimetype'),false);
        }
    }

}).single('avatar');
app.post('/UpdateAvatar/updateAvt',async (req,res)=>{
     upload(req,res, async function (err) {
        if (err) {
            return res.send(err+"");
        }
        try {
            // var anh = 'img/'+tenGoc;
            await userConnect.findByIdAndUpdate(req.body.id, {
               // avatar : 'img/'+tenGoc
               //  avatar : req.file.path
                avatar : req.file.path.split('\\')[1]
            })
            res.redirect('/UpdateUser/'+req.body.id);
        } catch (e) {
            res.send('co loi xay ra: ' + e.message)
        }
    })
})

const port = process.env.PORT || 9191;
app.listen(port, () => {
    console.log("Way to go server at port " + port);
});

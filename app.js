require("dotenv").config()
const express = require('express');
require('ejs')
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const uuid = require('uuid').v4;
const MongoDb = require('./config/config');
const Mongoose = require('./config/db');
Mongoose(process.env.MONGODB_URL);
const {UserModel} = require("./models/user-model");
const {uploadModel} = require("./models/upload-model");
const session = require("express-session");
const bodyParser = require("body-parser");

const auth = require("./middleware/auth");


// date 
let date = new Date();
date = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`

// url 
const url = process.env.PORT || 3000;

const upload = multer({
    storage:multer.diskStorage({
        destination:(req,res,cb)=>{
            cb(null,'public/upload');
        },
        filename:(req,file,cb)=>{
            let fileName = Date.now()+'-'+Math.floor(Math.random()*1E9)+path.extname(file.originalname)
            cb(null, file.originalname);
        }
    }),
}).single('file')

const profile = multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,"public/profileImage");
        },
        filename:(req,file,cb)=>{
            let fileName = Date.now()+'-'+Math.floor(Math.random()*1E9)+path.extname(file.originalname)
            cb(null,fileName);
        }
    })
}).single("profileImg")


// express set use 
const app = express();
const pubPath = path.join(__dirname, 'public');
app.use(express.static(pubPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({secret:"thisismysession"}))


// api create 

// data show index page api call
app.get("/",auth.isLogout,(req,res)=>{
    res.render("register");
})
app.get("/login",auth.isLogout,(req,res)=>{
    res.render("login");
})

app.post("/register",auth.isLogout,profile,async (req,res)=>{
    console.log(req.file);
    const {username,email,password,confirmpassword} = req.body;
    const userData = await UserModel.findOne({email});
    if(userData){
        res.send("User already registered");
    }else{
        if(username && email && password && confirmpassword){
            if(password === confirmpassword){
                const passHash = await bcrypt.hash(password,10);
                const data = await UserModel.create({image:req.file.filename,username,email,password:passHash,key:uuid(),date});
                console.log(req.session.user)
                req.session.user = data;
                res.redirect(`/deshboard`);
                
            }else{
                res.send("password and confirm password not match");
            }
        }else{
            res.send("All fields are required");
        }
    }
})

app.post("/login",auth.isLogout,async (req,res,next)=>{
    const {email,password} = req.body;
    const userFind = await UserModel.findOne({email});
    if(userFind != null){
        if(email && password){
            const passHash = await bcrypt.compare(password,userFind.password);
            if(userFind.email && passHash){
                req.session.user = userFind;
                res.redirect(`/deshboard`)
            }else{
                res.send("password and confirm password not match");
            }
        }else{
            res.send("All fields are required");
        }
    }else{
        res.send("User not Registered");
    }
})


app.get('/deshboard',auth.isLogin,async (req, res) =>{
    if(req.session.user){
        const userData = req.session.user;
        let data = await uploadModel.find({key:userData.key});
        console.log(data)
        res.render('index',{data,username:userData.username,userimg:userData.image,id:userData.key});
    }
})

// folder create api call
app.post('/:id/deshboard/folder',async (req,res)=>{
        fs.mkdir(`${pubPath}/upload/${req.body.folder}`,async (err)=>{
            if(err){
                res.redirect(`/deshboard`)
            }else{
                const data = await uploadModel.create({data:`${(req.body.folder).toLowerCase()}`,path:`upload/${req.body.folder}`,uuid:uuid(),date,type:'folder',key:req.params.id})
                res.redirect(`/deshboard`)
            }
        })
    })
    
// file created api call
app.post("/:id/deshboard/file",upload,async (req,res)=>{
    const data = await uploadModel.create({data:`${(req.file.filename).toLowerCase()}`,path:`upload/${req.file.path}`,uuid:uuid(),date,type:'file',key:req.params.id,size:`${((req.file.size)/(1024*1024)).toPrecision(2)} MB`})
    res.redirect(`/deshboard`);
})


// file open api 
app.get('/fileopen/:data',(req, res) =>{
    let data = req.params.data;
    // console.log(req.params.data);
    res.render('file-open',{data});
})

app.get('/folder/:folder',async (req,res)=>{
    let dataFolder = req.params.folder;
    let result = await MongoDb();
    let db = await result.collection('file-folder');
    let data = await db.find({}).toArray();
    res.render('folderopen',{data,dataFolder});

    // fs.readdir(`${pubPath}/upload/`,{withFileTypes: true},(err, data) =>{
    //     res.render('folderopen',{data,dataFolder})
    // });
})

// delete api 
app.get('/update/:oldName',async (req,res)=>{
    await uploadModel.updateOne({data:req.params.oldName},{$set:{data:(req.query.update).toLowerCase()}});
    fs.rename(`public/upload/${req.params.oldName}`,`public/upload/${(req.query.update).toLowerCase()}`,(err)=>{
        if(err){
            // console.log("Error renaming")
            res.redirect(`/deshboard`);
        }else{
            // console.log("Update renaming");
            res.redirect(`/deshboard`);
        }
    })
})
// update api 
app.get('/delete/:type/:data',async (req, res) =>{
    let datas = await uploadModel.findOne({data:req.params.data})
    if(req.params.type === 'folder'){
        let dataDelete = await uploadModel.deleteOne({data:req.params.data})
        fs.rmdir(`public/upload/${req.params.data}`,(err)=>{
            // console.log(`Delete file - ${req.params.data} - \n data : ${dataDelete}`)
            res.redirect(`/deshboard`);
        })
    }else{
        let dataDelete = await uploadModel.deleteOne({data:req.params.data})
        fs.unlink(`public/upload/${req.params.data}`,(err)=>{
            // console.log(`Delete file - ${req.params.data} - \n data: ${dataDelete}`)
            res.redirect(`/deshboard`);
        })
    }
})

// search data api
app.post('/search',async (req,res)=>{
    let result = await MongoDb();
    let db = result.collection("uploads");
    // let data = await uploadModel.find({data:req.query.name});
    if(req.session.user){
        let dataFind = await db.find({key:req.session.user.key,
            "$or":[
                {"data":{$regex:(req.body.name)}}
            ]
        }).toArray();
        dataFind.forEach(elem=>{
            let title = elem.data;
            res.render('search',{data:dataFind,title,id:req.params.id,username:req.session.user.username,userimg:req.session.user.image});
        })

    //     let data = await uploadModel.find({key:req.params.id});
    //     res.render('search',{data,username:userData.username,userimg:userData.image,id:req.params.id});
    }
})

app.use("",(req,res)=>{
    res.render("error");
})

// server create
app.listen(url,()=>{
    console.log('listening on http://localhost:3000')
})

const express = require('express');
require('ejs')
const fs = require('fs');
const path = require('path');
const {v4:uuid} = require('uuid');
const multer = require('multer');
const bcrypt = require('bcrypt');

const MongoDb = require('./config/config');

const Mongoose = require('./config/db');
Mongoose("mongodb://localhost:27017");
const {UserModel} = require("./models/user-model");
const {uploadModel} = require("./models/upload-model");

// date 
let date = new Date();
date = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
// console.log(date)

// url 
const url = 3000;

const storage = multer.diskStorage({
    destination:(req,res,cb)=>{
        cb(null,'public/upload');
    },
    filename:(req,file,cb)=>{
        let fileName = Date.now()+'-'+Math.floor(Math.random()*1E9)+path.extname(file.originalname)
        cb(null, file.originalname);
    }
})
function fileFilter(req, file, cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/png' || file.mimetype === 'image/jpg' || file.mimetype === "image/svg"){
        cb(null, true)
    }
    else{
        console.log("Please try again...");
        cb(null, false);
        return cb(new Error("Invalid file and"));
    }
}

const upload = multer({storage,fileFilter}).single('file')



// multer 
// const upload = multer({
//     storage:multer.diskStorage({
//         destination:(req,res,cb)=>{
//             cb(null,'public/upload');
//         },
//         filename:(req,file,cb)=>{
//             let fileName = Date.now()+'-'+Math.floor(Math.random()*1E9)+path.extname(file.originalname)
//             cb(null, file.originalname);
//         }
//     }),
// }).single('file');



// express set use 

const app = express();
const pubPath = path.join(__dirname, 'public');
app.use(express.static(pubPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// api create 

// data show index page api call
app.get("/",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/register",async (req,res)=>{
    const {username,email,password,confirmpassword} = req.body;
    const userData = await UserModel.findOne({email});
    if(userData){
        res.send("User already registered");
    }else{
        if(username && email && password){
            if(password === confirmpassword){
                const passHash = await bcrypt.hash(password,2);
                const data = await UserModel.create({image:"",username,email,password:passHash,key:uuid(),date});
                res.redirect(`${data.key}/deshboard`)
            }else{
                res.send("password and confirm password not match");
            }
        }else{
            res.send("All fields are required");
        }
    }
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const userFind = await UserModel.findOne({email});
    if(userFind != null){
        if(email && password){
            const passHash = await bcrypt.compare(password,userFind.password);
            if(userFind.email && passHash){
                res.redirect(`${userFind.key}/deshboard`)
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


app.get('/:id/deshboard',async (req, res) =>{
    const userData = await UserModel.findOne({key:req.params.id});
    if(userData.key === req.params.id){
        let data = await uploadModel.find({key:req.params.id});
        res.render('index',{data,username:userData.username,id:req.params.id});
    }
})

// folder create api call
app.post('/:id/deshboard/folder',async (req,res)=>{
        fs.mkdir(`${pubPath}/upload/${req.body.folder}`,async (err)=>{
            if(err){
                res.redirect(`/${req.params.id}/deshboard`)
            }else{
                const data = await uploadModel.create({data:`${(req.body.folder).toLowerCase()}`,path:`upload/${req.body.folder}`,uuid:uuid(),date,type:'folder',key:req.params.id})
                res.redirect(`/${req.params.id}/deshboard`)
            }
        })
    })
    
// file created api call
app.post("/:id/deshboard/file",upload,async (req,res)=>{
    const data = await uploadModel.create({data:`${(req.file.filename).toLowerCase()}`,path:`upload/${req.file.path}`,uuid:uuid(),date,type:'file',key:req.params.id,size:`${((req.file.size)/(1024*1024)).toPrecision(2)} MB`})
    res.redirect(`/${req.params.id}/deshboard`);
})


// file open api 
app.get('/fileopen/:data',(req, res) =>{
    let data = req.params.data;
    console.log(req.params.data);
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
    let datas = await uploadModel.findOne({data:req.params.oldName})
    console.log(req.params.oldName);
    let result = await MongoDb();
    let db = await result.collection('file-folder');
    let data = await uploadModel.updateOne({data:req.params.oldName},{$set:{data:(req.query.update).toLowerCase()}});
    fs.rename(`public/upload/${req.params.oldName}`,`public/upload/${(req.query.update).toLowerCase()}`,(err)=>{
        if(err){
            console.log("Error renaming")
            res.redirect(`/${datas.key}/deshboard`);
        }else{
            console.log("Update renaming");
            res.redirect(`/${datas.key}/deshboard`);
        }
    })
})
// update api 
app.get('/delete/:type/:data',async (req, res) =>{
    let datas = await uploadModel.findOne({data:req.params.data})
    if(req.params.type === 'folder'){
        let dataDelete = await uploadModel.deleteOne({data:req.params.data})
        fs.rmdir(`public/upload/${req.params.data}`,(err)=>{
            console.log(`Delete file - ${req.params.data} - \n data : ${dataDelete}`)
            res.redirect(`/${datas.key}/deshboard`);
        })
    }else{
        let dataDelete = await uploadModel.deleteOne({data:req.params.data})
        fs.unlink(`public/upload/${req.params.data}`,(err)=>{
            console.log(`Delete file - ${req.params.data} - \n data: ${dataDelete}`)
            res.redirect(`/${datas.key}/deshboard`);
        })
    }
})

// search data api
app.get('/search',async (req,res)=>{
    let result = await MongoDb();
    let db = result.collection("uploads");
    let data = await db.find({
        "$or":[
            {"data":{$regex:(req.query.name).toLowerCase()}}
        ]
    }).toArray();
    data.forEach(elem=>{
        let title = elem.data;
        res.render('search',{data,title});
    })
})


app.use("",(req,res)=>{
    res.render("error");
})


// server create
app.listen(url,()=>{
    console.log('listening on http://localhost:3000')
})

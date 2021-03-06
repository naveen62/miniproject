const express = require('express');
const router = new express.Router();
const multer = require('multer')


const User = require('../models/user');


const {auth} = require('../middleware/auth');


router.post('/users', async (req, res) => {
    const newuser = new User(req.body);

    try {
        const user = await newuser.save();
        const token = await user.genAuthToken();
        res.send({
            user,
            token
        })
    } catch(err) {
        res.status(400).send(err)
    }
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCreadentials(req.body.email, req.body.password);
        const token = await user.genAuthToken();  

        res.send({
            user,
            token
        })
    }catch(err) {
        res.status(400).send(err)
    }

})
const upload = multer({
    limits:{
        fileSize:10000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.endsWith('.jpg')) {
            return cb(new Error('please upload a word document'));
        }
        cb(undefined, true)
    }
})
router.post('/users/avatar',auth,upload.single('avatar'), async (req, res) => {
    try{
        req.user.avatar = req.file.buffer;
        await req.user.save();
        res.send()
    }catch(err) {
        console.log(err)
    }
}, (err, req, res, next) => {
    console.log(err)
    res.status(400).send({err:err.message})
})
router.post('/users/logout',auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    }catch(err) {
        
        res.status(505).send();
    }
})
router.post('/users/logoutAll',auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()
    } catch(err) {
        res.status(505).send();
    }
})
router.get('/users/me',auth, async (req, res) => {
    res.send({
        user:req.user,
        token:req.token
    })
})
router.get('/users/:id', async (req, res) => {
    const userid = req.params.id;
    try {
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).send({err:'user not found'})
        }
        res.send(user)
    } catch(e) {
        res.status(400).send(e);
    }
})
router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error:'Invalid operation'});
    }

    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, {
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
        if(!user) {
            return res.status(400).send()
        }

        res.send(user);
    }catch(err) {
        res.status(400).send(err)
    }
})
router.delete('/users/me',auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        if(!user) {
            return res.status(400).send()
        }
        res.send(user);
    } catch(err) {
        res.status(400).send(err)
    }
})



module.exports = router;
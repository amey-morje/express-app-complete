const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const favRouter = express.Router();
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

favRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{ res.sendStatus(200) })
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user: req.user._id })
    .populate('user')
    .populate('dishes')
    .then((fav)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(fav);
    },(err)=>next(err)
    ).catch(err => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({ user: req.user._id })
    .then((fav)=>{
        if(fav!=null){
            for(var i = 0; i< req.body.length ; i++){
                if(fav.dishes.indexOf(req.body[i]._id) == -1)
                    fav.dishes.push(req.body[i]);
            }
            fav.save().then((fav)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(fav);
            });
        }else{
            Favorites.create({ user: req.user._id , dishes: req.body }).then((fav)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(fav)
            },(err)=> next(err)).catch(err => next(err));
        }
    });
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites.');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.remove({ user: req.user._id})
    .then((response)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(response);
    })
});

//////////////////////////////////////////////////////////////////////////////////////
favRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{ res.sendStatus(200) })
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('GET Operation is not allowed on /favorites'+req.params.dishId);
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({ user: req.user._id })
    .then((fav)=>{
        if(fav!=null){
                if(fav.dishes.indexOf(req.params.dishId) == -1){
                    fav.dishes.push(req.params.dishId);
                    fav.save().then((fav)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(fav);
                    })
                }else{
                    res.statusCode = 200;
                    res.end('Dish already exists in favorites');
                }
        }else{
            Favorites.create({ user: req.user._id }).then((fav)=>{
                fav.dishes.push(req.params.dishId);
                fav.save().then((fav)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                },(err)=> next(err)).catch(err => next(err));
            })
        }
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT Operation is not allowed on /favorites'+req.params.dishId);
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({ user: req.user._id }).then((fav)=>{
        if(fav.dishes.indexOf(req.params.dishId)==-1){
            res.statusCode = 404;
            res.end("Dish doesn't exist in Favorites list.");
        }else{
            fav.dishes.remove(req.params.dishId);
            fav.save().then((response)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(response);
            },(err)=> next(err)).catch((err)=> next(err));
        }
    })
});

module.exports = favRouter;

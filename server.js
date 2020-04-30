const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require( 'mongoose' );
const uuid = require('uuid');
const {Bookmark} = require('./models/bookmarkModel');

const app = express();
const jsonParser = bodyParser.json();
const tokenValidation = require('./middleware/validateToken');

app.use(morgan('dev'));
app.use(tokenValidation);

// c -> GET request of all bookmarks should go to /bookmarks => Added Mongoose Functionality
app.get('/bookmarks-api/bookmarks',  (req, res) => {
    console.log("Getting all Bookmarks");
    
    Bookmark.getAll()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong when accessing the DB. Please try again later.";
            return res.status(500).end();
        })
})

// d -> GET by title requests should go to /bookmark?title=value => Added Mongoose Functionality
app.get('/bookmarks-api/bookmark',  (req, res) => {
    console.log("Getting Bookmarks by title using the query string.");
    console.log(req.query);

    let title = req.query.title;

    if(!title){
        res.statusMessage = "Please send the 'title' as parameter.";
        return res.status(406).end();
    }

    Bookmark.getByTitle(title)
        .then(result => {
            if(!result){
                res.statusMessage = `There is no recorded bookmarks with the 'title=${title}'.`;
                return res.status(404).end();
            }

            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = `Something went wrong when accessing the DB. Please try again later. ${err.errmsg}`;
            return res.status(500).end();
        });
});

// e -> POST requests of a bookmark should go to /bookmarks => Added Mongoose Functionality
app.post('/bookmarks-api/bookmark', jsonParser, (req, res) => {
    console.log("Adding a new bookmark to the list.");
    console.log("Body", req.body );

    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;
    
    // VALIDATE MISSING PARAMETERS

    let missingFields = [];

    if(!title){
        missingFields.push("title");
    }

    if(!description){
        missingFields.push("description");
    }

    if(!url){
        missingFields.push("url");
    }

    if(!rating){
        missingFields.push("rating");
    }

    if(missingFields.length > 0){
        res.statusMessage = `The following parameters are missing in the request: ${missingFields}.`;
        return res.status(406).end();
    }
    
    // VALIDATE DATA TYPES

    if(typeof(title) !== 'string'){
        res.statusMessage = "The 'title' MUST be a string.";
        return res.status(409).end();
    }
    
    if(typeof(description) !== 'string'){
        res.statusMessage = "The 'description' MUST be a string.";
        return res.status(409).end();
    }
    
    if(typeof(url) !== 'string'){
        res.statusMessage = "The 'url' MUST be a string.";
        return res.status(409).end();
    }

    if(typeof(rating) !== 'number' || (rating < 0 || rating > 5)){
        res.statusMessage = "The 'rating' MUST be a number between 0-5.";
        return res.status(409).end();
    }

    let newBookmarkId = uuid.v4();

    let newBookmark = {
        id: newBookmarkId,
        title: title.toString(),
        description: description.toString(),
        url: url.toString(),
        rating: rating
    }

    Bookmark
        .createBookmark(newBookmark)
        .then(result => {
            if(result.errmsg){
                res.statusMessage = `A bookmark with id=${newBookmarkId} already exists. ${result.errmsg}`;
                return res.status(409).end();
            }
            return res.status(201).json(result); 
        })
        .catch(err => {
            res.statusMessage = `Something went wrong when accessing the DB. Please try again later. ${err.message}`;
            return res.status(500).end();
        });
});


// f -> DELETE requests should go to /bookmark/:id => Added Mongoose Functionality
app.delete('/bookmarks-api/bookmark/:id', ( req, res ) => {
    console.log("Deleting a Bookmark by id using the integrated param.");
    console.log(req.params);

    let id = req.params.id;

    Bookmark.deleteBookmark(id)
        .then(result => {
            if(result.deletedCount > 0)
            {
                return res.status(200).end();
            }
            else{
                res.statusMessage = `There are no Bookmarks with the provided 'id=${id}'.`;
                return res.status(404).end();
            }
        })
        .catch(err => {
            res.statusMessage = `Something went wrong when accessing the DB. Please try again later. ${err.errmsg}`;
            return res.status(500).end();
        });
});


// g -> PATCH requests should go to /bookmark/:id => Added Mongoose Functionality
app.patch('/bookmarks-api/bookmark/:id', jsonParser, (req, res) => {
    console.log("Patching a Bookmark by id using the Integrated Param and Body.");

    // Integrated Params
    console.log("Integrated Param", req.params);
    let param_id = req.params.id;

    // Message Body Json
    console.log("Body", req.body);
    let body_id = req.body.id;
    let updatedBookmarkFields = req.body.updatedFields;

    // Check if Id exists in request Body.
    if(!body_id){
        res.statusMessage = "'id' field missing in the request body.";
        return res.status(406).end();
    }

    // Check Id in body matches Id in path
    if(param_id !== body_id){
        res.statusMessage = `'id=${param_id}' in Path does not match 'id=${body_id}' in Request Body.`;
        return res.status(409).end();
    }

    // Update Provided Parameters
    Bookmark.updateBookmark(param_id, updatedBookmarkFields)
        .then(result => {
            if(!result){
                res.statusMessage = `There are no Bookmarks with the provided 'id=${param_id}'.`;
                return res.status(404).end();
            }

            return res.status(202).json(result);
        })
        .catch(err => {
            res.statusMessage = `Something went wrong when accessing the DB. Please try again later. ${err.errmsg}`;
            return res.status(500).end();
        });
});

app.listen(8080, () => {
    // Start Mongoose Server Connection
    new Promise((resolve, reject) => {
        const settings = {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        };
        mongoose.connect('mongodb://localhost/bookmarksdb', settings, (err) => {
            if(err){
                return reject(err);
            }
            else{
                console.log("Database connected successfully.");
                return resolve();
            }
        })
    })
    .catch(err => {
        console.log(err);
    });

    console.log("This server is running on port 8080");
});

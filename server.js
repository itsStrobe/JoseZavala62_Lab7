const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid');

const app = express();
const jsonParser = bodyParser.json();
const tokenValidation = require('./middleware/validateToken');

app.use(morgan('dev'));
app.use(tokenValidation);

let bookmarksDb = [
];

// c -> GET request of all bookmarks should go to /bookmarks
app.get('/bookmarks-api/bookmarks',  (req, res) => {
    console.log("Getting all Bookmarks");

    return res.status(200).json(bookmarksDb);
})

// d -> GET by title requests should go to /bookmark?title=value
app.get('/bookmarks-api/bookmark',  (req, res) => {
    console.log("Getting Bookmarks by title using the query string.");
    console.log(req.query);

    let title = req.query.title;

    if(!title){
        res.statusMessage = "Please send the 'title' as parameter.";
        return res.status(406).end();
    }

    let results = bookmarksDb.filter((bookmark) => {
        if(bookmark.title == title){
            return bookmark;
        }
    });

    if(!result){
        res.statusMessage = `There is no recorded bookmarks with the 'title=${title}'.`;
        return res.status(404).end();
    }

    return res.status(200).json(result);
})

// e -> POST requests of a bookmark should go to /bookmarks
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

    let newBookmark = {
        id: uuid.v4(),
        title: title.toString(),
        description: description.toString(),
        url: url.toString(),
        rating: rating
    }

    bookmarksDb.push(newBookmark);

    return res.status(201).json(newBookmark);
});


// f -> DELETE requests should go to /bookmark/:id
app.delete('/bookmarks-api/bookmark/:id', ( req, res ) => {
    console.log("Deleting a Bookmark by id using the integrated param.");
    console.log(req.params);

    let id = req.params.id;

    let bookmarkToRemove = bookmarksDb.findIndex((bookmark) => {
        if(bookmark.id === id){
            return true;
        }
    });

    if(bookmarkToRemove < 0){
        res.statusMessage = `There are no Bookmarks with the provided 'id=${id}'.`;
        return res.status(404).end();
    }

    bookmarksDb.splice(bookmarkToRemove, 1);
    return res.status(200).end();
});


// g -> PATCH requests should go to /bookmark/:id
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

    let bookmarkToEdit = bookmarksDb.findIndex((bookmark) => {
        if(bookmark.id === param_id){
            return true;
        }
    });

    if(bookmarkToEdit < 0){
        res.statusMessage = `There are no Bookmarks with the provided 'id=${param_id}'.`;
        return res.status(404).end();
    }

    // Update Provided Parameters
    for(field in updatedBookmarkFields){
        console.log(`Updating entry ${param_id} with '${field}=${updatedBookmarkFields[field]}'`);
        bookmarksDb[bookmarkToEdit][field] = updatedBookmarkFields[field];
    }
    
    return res.status(202).json(bookmarksDb[bookmarkToEdit]);
});

app.listen(8080, () => {
    // Preload Bookmarks
    bookmarksDb.push(
        {
            id: uuid.v4(),
            title: "SoundOnSound",
            description: "Sound on Sound is an independently owned monthly music technology magazine published by SOS Publications Group, based in Cambridge, United Kingdom.",
            url: "www.soundonsound.com",
            rating: 4
        },

        {
            id: uuid.v4(),
            title: "arXiv",
            description: "arXiv is an open-access repository of electronic preprints approved for posting after moderation, but not full peer review.",
            url: "arxiv.org",
            rating: 5
        }
    )

    console.log("This server is running on port 8080");
});

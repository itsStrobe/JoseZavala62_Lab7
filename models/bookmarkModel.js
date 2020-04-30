const mongoose = require('mongoose');
const uuid = require('uuid');

const bookmarkSchema = mongoose.Schema({
    id : {
        type : uuid,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
        required : true
    }
});

const bookmarksCollection = mongoose.model('bookmarks', bookmarkSchema);

const Bookmark = {
    createBookmark : function(newBookmark){
        return bookmarksCollection
                .create(newBookmark)
                .then(createdBookmark => {
                    return createdBookmark;
                })
                .catch(err => {
                    return err;
                });
    },
    getAll : function(){
        return bookmarksCollection
                .find()
                .then(allBookmarks => {
                    return allBookmarks;
                })
                .catch(err => {
                    return err;
                });
    },
    getByTitle : function(title){
        return bookmarksCollection
                .find()
                .where('title').equals(title)
                .then(result => {
                    return result;
                })
                .catch(err => {
                    return err;
                });
    },
    deleteBookmark : function(id){
        return bookmarksCollection
                .deleteOne()
                .where('id').equals(id)
                .then(result => {
                    return result;
                })
                .catch(err => {
                    return err;
                });
    },
    updateBookmark : function(id, updatedFields){
        return bookmarksCollection
            .findOneAndUpdate(
                {id : id},
                updatedFields,
                {new : true}
            )
            .then(result => {
                console.log(result);
                return result;
            })
            .catch(err => {
                return err;
            });
    }
}

/*
    let results = bookmarksDb.filter((bookmark) => {
        if(bookmark.title == title){
            return bookmark;
        }
    });
*/

module.exports = {Bookmark};

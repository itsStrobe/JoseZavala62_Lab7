
const PORT = 8080;
const API_TOKEN = "2abbf7c3-245b-404f-9473-ade729ed4653";

function getValueFromStringField(field){
    let val = field.value.trim();
    if(val === "" || val === null){
        return null;
    }

    return val;
}

function getValueFromNumericField(field){
    let val = field.value.trim();
    if(val === "" || val === null){
        return null;
    }

    return Number(val);
}

function getAllBookmarks(){
    let req_url = `/bookmarks-api/bookmarks`;
    let settings = {
        method : 'GET',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`
        }
    }

    fetch(req_url, settings)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON => {
            console.log(responseJSON);
            displayResults(responseJSON);
        })
        .catch(err => {
            console.log(err);
            alert(err.message);
        });
}

function getBookmarksByTitle(title){
    let req_url = `/bookmarks-api/bookmark?title=${title}`;

    let settings = {
        method : 'GET',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`
        }
    };

    fetch(req_url, settings)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON => {
            displayResults(responseJSON);
        })
        .catch(err => {
            alert(err.message);
        });
}

function addBookmark(title, description, url, rating){
    let req_url = `/bookmarks-api/bookmark`;

    let data = {
        title : title,
        description : description,
        url : url,
        rating : rating
    }

    let settings = {
        method : 'POST',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( data )
    }

    fetch(req_url, settings)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON => {
            displayResult(responseJSON);
        })
        .catch(err => {
            displayError(err.message);
        });
}

function deleteBookmarkById(id){
    let req_url = `/bookmarks-api/bookmark/${id}`;

    let settings = {
        method : 'DELETE',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`
        }
    };

    fetch(req_url, settings)
        .then(response => {
            if(response.ok){
                return;
            }
            throw new Error(response.statusText);
        })
        .then( () => {
            getAllBookmarks();
        })
        .catch(err => {
            alert(err.message);
        });
}

function patchBookmark(id, title, description, url, rating){
    let req_url = `/bookmarks-api/bookmark/${id}`;

    let data = {
        id : id,
        updatedFields : {
        }
    }

    if(title !== "" && title != null){
        data.updatedFields.title = title;
    }

    if(description !== "" && description != null){
        data.updatedFields.description = description;
    }

    if(url !== "" && url != null){
        data.updatedFields.url = url;
    }

    if(rating !== "" && rating != null){
        data.updatedFields.rating = rating;
    }

    console.log(data);

    let settings = {
        method : 'PATCH',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( data )
    }

    fetch(req_url, settings)
        .then(response => {
            if(response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON => {
            displayResult(responseJSON);
        })
        .catch(err => {
            displayError(err.message);
        });
}

function displayResult(data){
    let results = document.querySelector('.resultSection');
    results.innerHTML = "";
    results.innerHTML += 
        `<div class=\"bookmark\">
            <h3>${data['title']}</h3>
            <p>Id: ${data['id']} </p>
            <p>${data['description']}</p>
            <p>Rating: ${data['rating']}</p>
            <a href="${data['url']}">${data['url']}</a>
        </div>`
}

function displayResults(data){
    let results = document.querySelector('.resultSection');
    results.innerHTML = "";

    console.log(data);
    
    data.forEach(bookmark => {
        results.innerHTML += 
            `<div class=\"bookmark\">
                <h3>${bookmark['title']}</h3>
                <p>Id: ${bookmark['id']} </p>
                <p>${bookmark['description']}</p>
                <p>Rating: ${bookmark['rating']}</p>
                <a href="${bookmark['url']}">${bookmark['url']}</a>
            </div>`
        ;
    });
}

function displayError(message){
    alert(`Server says: ${message}`);
}

function watchForms(){
    let formSection = document.querySelector('.formSection');

    formSection.addEventListener('click', (event) =>{
        event.preventDefault();

        if(event.target.matches('.submitBtn')){
            let thisForm = event.target.parentElement;
            
            if(thisForm.id === "getBookmarks"){
                getAllBookmarks();
            }

            if(thisForm.id === "getBookmarksByTitle"){
                let title = getValueFromStringField(thisForm.querySelector("#getBookmarkTitle"));
                getBookmarksByTitle(title);
            }

            if(thisForm.id === "postBookmark"){
                let title = null;
                title = getValueFromStringField(thisForm.querySelector("#postBookmarkTitle"));
                let description = getValueFromStringField(thisForm.querySelector("#postBookmarkDescription"));
                let url = getValueFromStringField(thisForm.querySelector("#postBookmarkUrl"));
                let rating = getValueFromNumericField(thisForm.querySelector("#postBookmarkRating"));
                addBookmark(title, description, url, rating);
            }

            if(thisForm.id === "deleteBookmarkById"){
                let id = getValueFromStringField(thisForm.querySelector("#deleteBookmarkId"));
                deleteBookmarkById(id);
            }

            if(thisForm.id === "patchBookmark"){
                let id = getValueFromStringField(thisForm.querySelector("#patchBookmarkId"));
                let title = getValueFromStringField(thisForm.querySelector("#patchBookmarkTitle"));
                let description = getValueFromStringField(thisForm.querySelector("#patchBookmarkDescription"));
                let url = getValueFromStringField(thisForm.querySelector("#patchBookmarkUrl"));
                let rating = getValueFromNumericField(thisForm.querySelector("#patchBookmarkRating"));
                patchBookmark(id, title, description, url, rating);
            }
        }
    });
}

function init(){
    watchForms();
    getAllBookmarks();
}

init();

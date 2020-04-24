const TOKEN = '2abbf7c3-245b-404f-9473-ade729ed4653';

function tokenValidation(req, res, next){

    let auth_token = req.headers.authorization;
    if(auth_token){
        if(auth_token !== `Bearer ${TOKEN}`){
            res.statusMessage = "The 'authorization bearer' TOKEN is invalid.";
            return res.status(401).end();
        }
        else {
            return next();
        }
    }

    let header_token = req.header('book-api-key');
    if(header_token){
        if(header_token !== TOKEN){
            res.statusMessage = "The book-api-key 'authorization' header TOKEN is invalid.";
            return res.status(401).end();
        }
        else {
            return next();
        }
    }

    let query_token = req.query.apiKey;
    if(query_token){
        if(query_token !== TOKEN){
            res.statusMessage = "The apiKey 'authorization' query parameter TOKEN is invalid.";
            return res.status(401).end();
        }
        else {
            return next();
        }
    }
    
    res.statusMessage = "You need to send the 'authorization' token.";
    return res.status(401).end();
}

module.exports = tokenValidation;

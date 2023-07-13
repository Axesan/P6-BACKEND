// function methode get
function sauces(req,res) {
    res.send("sauces")
}
// Function method Post - A review
function saucesRequest(req,res) {
    res.send('Post sauces')
}
// Function by id
function saucesById(req,res) {
    res.send('sauceById')
}
// function Method PUT
function updateSauce(req,res) {
    
}

function deleteSauce(req,res) {}

function likeSauces(req,res) {}

module.exports = {
    sauces,saucesById,saucesRequest,updateSauce,deleteSauce,likeSauces
}
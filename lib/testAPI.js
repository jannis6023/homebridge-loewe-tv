const Loewe = require('./LoeweAPI')
const Parser = require('fast-xml-parser')

let loewe = new Loewe("10.1.1.119")
loewe.auth(function (clientID){
    loewe.injectRCKey(clientID, "72")
})
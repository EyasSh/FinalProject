const {initializeApp ,cert} = require('firebase-admin/app')
const {getFireStore}=require('firebase-admin/firestore')

const serviceAccount=
require('./trial-3f5ca-firebase-adminsdk-yipx2-28dabb5111.json')

initializeApp({
    credential:cert(serviceAccount)
})
const db = getFireStore
module.exports={db}



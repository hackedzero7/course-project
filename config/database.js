const mongoose = require('mongoose');

exports.connectDatabase = () => {
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.DATABASE_URL)
    .then((con)=>{
        console.log(`Database connect successfully on ${con.connection.host}`)
    }).catch((err)=>{
        console.log(err)
    })
}
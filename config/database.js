const mongoose = require('mongoose');

// exports.connectDatabase = () => {
//     mongoose.set('strictQuery', true);
//     mongoose.connect(process.env.DATABASE_URL)
//     .then((con)=>{
//         console.log(`Database connect successfully on ${con.connection.host}`)
//     }).catch((err)=>{
//         console.log(err)
//     })
// }

exports.connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
      const conn = await mongoose.connect(process.env.DATABASE_URL);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
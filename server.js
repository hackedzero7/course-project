const app = require('./app');
const { connectDB } = require('./config/database');
const cloudinary = require("cloudinary");

/**call database function */




cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

// app.listen(process.env.PORT, ()=> {
//     console.log(`Server is working on PORT:${process.env.PORT}`)
// })

//Connect to the database before listening
connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is working on PORT:${process.env.PORT}`)
    })
})
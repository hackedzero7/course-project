const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please Enter Course Title"],
        minLength: [4, "Title must be at least 4 character"],
        maxLength: [80, "title cannot exceed 80 characters"]
    },
    description: {
        type: String,
        required: [true, "Please Enter Course Description"],
        minLength: [20, "Description must be at least 20 character"],
    },
    lectures:[
        {
            title:{
                type: String,
                required: true
            },
            description:{
                type: String,
                required: true
            },

            video:{
                public_id:{
                    type: String,
                    required: true
                },
                url:{
                    type: String,
                    required: true
                }
            }
        }
    ],
    poster:{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    views:{
        type: Number,
        default: 0
    },
    numOfVideos:{
        type: Number,
        default: 0
    },
    createdBy:{
        type: String,
        required:[true, "Enter Course Creator Name"]
    },
    category:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model("Course", Schema);
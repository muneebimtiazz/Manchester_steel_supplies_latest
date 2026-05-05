import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 6, required: true }
},{timestamps:true});

export const User=mongoose.model("User",userSchema)
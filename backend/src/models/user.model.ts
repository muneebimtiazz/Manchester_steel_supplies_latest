import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    fname:String,
    lname:String,
    email:{type:String,unique:true,require:[true]},
    password:{type:String,minlength:[6],require:[true]}
},{timestamps:true});

export const User=mongoose.model("User",userSchema)
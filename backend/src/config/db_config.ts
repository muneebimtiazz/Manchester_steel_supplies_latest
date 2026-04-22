import mongoose from 'mongoose'

const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URL as string)
        console.log('db connection successfully')
    } catch (error) {
        console.log('db connection failed',error)
        process.exit(1);
    } 
}

export default connectDb
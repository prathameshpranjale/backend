import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema({

    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type:String, //cloudinary url
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    }
},{
    timestamps:true
})  

// pre hook middle ware from mongoose to encrpty password to store 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    // console.log('Password before hashing:', this.password); // Check the value

    try {
        if (!this.password) {
            throw new Error('Password is not set');
        }
        this.password = await bcrypt.hash(this.password, 10)
        next();
    } catch (err) {
        console.log("error hit !123!");
        console.error(err); // Log the actual error
        next(err); // Pass the error to the next middleware or error handler
    }
});


userSchema.methods.isPasswordCorrect = async function(password){
    // console.log('Entered password:', password);
    // console.log('Stored hash:', this.password);
    try {
        return await bcrypt.compare(password, this.password)
    } catch (err) {
        console.error('Error comparing passwords:', err)
        throw err;
    }
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)
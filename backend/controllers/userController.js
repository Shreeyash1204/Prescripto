import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/useModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary' 
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing details" });
        }

        

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const loginUser = async (req,res)=>{

    try {

        const {email,password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
           return res.json({ success: false, message:'user doesnot exist' });

        }
        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:"Invalid credentials"})
        }

        
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
// api to get user profile data
const getProfile =async(req,res) => {

    try {

        const { userId } = req;
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData})

        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
        
    }


}

//API TO UPDATE PROFILE 
const updateProfile = async(req,res) => {
    try {
        const {name,phone,address,dob,gender} = req.body
         const { userId } = req;
        const imageFile =  req.file

        if( !name || !phone || !address || !dob || !gender)
        {
            return res.json({success:false,message:"data missing"})

        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

        if(imageFile){
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        res.json({success:true,message:"profile updated"})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select("-password");
        

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor not Available" });
        }

        let slots_booked = docData.slots_booked;

        if (slots_booked[slotDate]) {
            if(slots_booked[slotDate].includes(slotTime))
            {
            return res.json({ success: false, message: "Slot not Available" })
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }
        }
        else{
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime)
        }
        const userData = await userModel.findById(userId).select("-password");

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
             userData: userData.toObject(),
             docData: docData.toObject(),
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({ success: true, message: 'Appointment Booked' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
//api to get user appointments for frontend

const listAppointment = async (req,res) => {
    try {
        const {userId}=req
        const appointments =await appointmentModel.find({userId})

        res.json({success:true,appointments})
        
    } catch (error) {
         console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// api to cancel 
const cancelAppointment = async (req,res)=>{
    try {
        const {appointmentId}= req.body
        const {userId} = req 

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user
       if(!appointmentData || appointmentData.userId !== userId)
        {
            return res.json({success:false,message:"Unauthorized action"})
        }
        
        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
        // releasing doctor slot

        const {docId,slotDate,slotTime} = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate]=slots_booked[slotDate].filter(e => e!== slotTime)

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true , message:'appointment cancelled'})

    } catch (error) {
         console.log(error);
        res.json({ success: false, message: error.message })
    }

}


const simulatePayment = async (req, res) => {
    try {
        const { appointmentId } = req.body; 
        const { userId } = req; 
        const appointmentData = await appointmentModel.findById(appointmentId);

        
        if (!appointmentData || appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        
        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });

        res.json({ success: true, message: 'Payment simulated successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,simulatePayment };
const User = require('../models/User')

const userProfile = async (req, res) => {
    try {
        const tokenEmail = req.user.email;
        console.log(tokenEmail, "token email ka data ");
        const user = await User.findOne({ email: tokenEmail });
        if (!user) return res.status(404).json({ error: "User not found and  MAy be invalid email" })
        console.log(user);
        return res.json({
            username: user.username,
            email: user.email,
            contact: user.contact,
            address: user.address,
            Id:user._id,
            state:user.state,
            city:user.city,
            country:user.country,
            pincode:user.pincode,
            firstname:user.firstname,
            lastname:user.lastname,
            gender:user.gender,
            role:user.role

        });
    } catch (error) {
        console.log("Error arise in fetching profile user");
        res.status(500).json({ error: "Server error" });
    }
};

const userDataUpdate=async(req,res)=>{
    console.log(req.body);
  
  try{  
    const {Id,firstname,lastname,city,country,state,address,pincode}=req.body
    if (!Id) {
        return res.status(400).json({ message: "User ID is required" });
    }

  
    const updatedUser = await User.findByIdAndUpdate(
        Id, 
        { firstname, lastname, city, country, state, address, pincode },
        { new: true, runValidators: true } 
    );

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
} catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
}

}
const userDeleteProfile=async(req,res)=>{
try {
    const {id}=req.params
    console.log(req.params)
    if(!id){
        return res.status(400).json({ message: "User ID is required" });
    }
    else{
        let res=await User.findByIdAndDelete(id);
        if(res){
            res.status(200).json({ message: "User deleted successfully" });

        }
    }
    
} catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
}
}

module.exports = { userProfile,userDataUpdate,userDeleteProfile };

// module.exports={userProfile}
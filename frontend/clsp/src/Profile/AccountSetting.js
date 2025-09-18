// // import { React, useState } from 'react';
// // import { Card, Form, Button } from 'react-bootstrap';
// // import { deleteUserAccount } from '../services/operations/authCall';
// // import { useDispatch } from 'react-redux';
// // import { useNavigate } from 'react-router-dom';
// // import { logout } from '../services/operations/authCall';
// // import { toast } from 'react-hot-toast';
// // import { getFromLocalStorage, saveToLocalStorage ,updateLocalStorageData} from '../services/operations/SecureLocal';
// // import  {updateUserDetails} from '../services/operations/authCall';

// // function AccountSetting() {
// //   let dispatch = useDispatch();
// //   let navigate = useNavigate();
// //     let userData=getFromLocalStorage("userData")
// //     console.log(userData.email);
// //   // State for user details
// //   const [userDetails, setUserDetails] = useState({
// //     firstName: '',
// //     lastName:'' ,
// //     email: userData.email,
// //     number:0,
// //   });

// //   // State for delete confirmation
// //   const [isAgreed, setIsAgreed] = useState(false);

// //   // Handle logout
// //   const handleLogout = () => {
// //     dispatch(logout(navigate));
// //     toast.success('Logged Out');
// //   };

// //   // Handle checkbox change for delete confirmation
// //   const handleCheckboxChange = (event) => {
// //     alert('Are you sure?');
// //     setIsAgreed(event.target.checked);
// //   };

// //   // Handle delete
// //   const handleDelete = () => {
// //     if (isAgreed) {
// //       let data = getFromLocalStorage('userData');
// //       console.log('Profile deleted. ', data.email);
// //       if (deleteUserAccount(data.email)) handleLogout();
// //     }
// //   };

// //   // Handle input changes for user details
// //   const handleInputChange = (event) => {
// //     const { name, value } = event.target;
// //     setUserDetails((prevState) => ({
// //       ...prevState,
// //       [name]: value,
// //     }));
// //   };

// //   // Handle update button click
// //   const handleUpdate = () => {
// //     console.log('Updated details:', userDetails);
// //     // Call an API or function to update user details
// //     const success = updateUserDetails(userDetails); // Replace this with your API call
// //     const updatedDetails = {
// //       firstName: userDetails.firstName,
// //       LastName: userDetails.lastName,
// //       number:userDetails.number
// //   };
// //    updateLocalStorageData("userData",updatedDetails)

// //     if (success) {
// //       alert("pls refresh the page")
// //       toast.success('Profile updated successfully!');
// //     } else {
// //       toast.error('Failed to update profile.');
// //     }
// //   };

// //   return (
// //     <Card className="p-4" style={{ minHeight: '750px' }}>
// //       <h4 className="mb-3">Account Settings</h4>

// //       <Form>
// //         {/* First Name Field */}
// //         <Form.Group controlId="firstName" className="mb-3">
// //           <Form.Label>First Name</Form.Label>
// //           <Form.Control
// //             type="text"
// //             placeholder="Enter first name"
// //             name="firstName"
// //             value={userDetails.firstName}
// //             onChange={handleInputChange}
// //           />
// //         </Form.Group>

// //         {/* Last Name Field */}
// //         <Form.Group controlId="lastName" className="mb-3">
// //           <Form.Label>Last Name</Form.Label>
// //           <Form.Control
// //             type="text"
// //             placeholder="Enter last name"
// //             name="lastName"
// //             value={userDetails.lastName}
// //             onChange={handleInputChange}
// //           />
// //         </Form.Group>

// //         {/* Email Field */}
// //         <Form.Group controlId="email" className="mb-3">
// //           <Form.Label>Number</Form.Label>
// //           <Form.Control
// //             type="number"
// //             placeholder="Enter number"
// //             name="number"
// //             maxLength={10}
// //             minLength={10}

// //             onChange={handleInputChange}
// //           />
// //         </Form.Group>

// //         {/* Update Button */}
// //         <Button
// //           variant="primary"
// //           className="mb-3 w-100 fw-bold"
// //           style={{ background: '#2B4F61', color: 'white' }}
// //           onClick={handleUpdate}
// //         >
// //           Update Details
// //         </Button>
// //       </Form>

// //       <h4>Delete Profile</h4>
// //       <Form.Check
// //         type="checkbox"
// //         label="I agree to delete my profile"
// //         className="mb-2"
// //         checked={isAgreed}
// //         onChange={handleCheckboxChange}
// //       />
// //       <p className="text-muted">
// //         Please note that if you choose to delete your profile, your account will no longer exist, and you will lose
// //         access to the resources provided.
// //       </p>
// //       <Button
// //         variant="danger"
// //         onClick={handleDelete}
// //         disabled={!isAgreed} // Disable button if checkbox is unchecked
// //       >
// //         Delete
// //       </Button>
// //     </Card>
// //   );
// // }

// // export default AccountSetting;
// import React, { useState } from 'react';
// import '../Pages/Stylesheet/Acount.css'
// const statesData = {
//   "California": ["Los Angeles", "San Francisco", "San Diego"],
//   "Texas": ["Houston", "Dallas", "Austin"],
//   "Florida": ["Miami", "Orlando", "Tampa"]
// };

// function AccountSetting() {
//   const [user, setUser] = useState({
//     fullName: "John Doe",
//     email: "johndoe@example.com",
//     phone: "1234567890",
//     gender: "",
//     state: "",
//     city: ""
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUser({
//       ...user,
//       [name]: value,
//       ...(name === "state" && { city: "" })
//     });
//   };

//   const handleUpdate = (e) => {
//     e.preventDefault();
//     alert("Profile Updated Successfully!");
//   };

//   const handleDelete = () => {
//     if (window.confirm("Are you sure you want to delete your account?")) {
//       alert("Account Deleted Successfully!");
//     }
//   };

//   return (
//     // <div className='container mt-5'>
//     //   <div className='row justify-content-center'>
//     //     <div className='w-full shadow p-4 rounded bg-light'>
//     //       <h3 className='text-center mb-4'>Account Settings</h3>
//     //       <form onSubmit={handleUpdate}>
//     //         <div className='mb-3'>
//     //           <label className='form-label'>Full Name:</label>
//     //           <input type='text' name='fullName' value={user.fullName} className='form-control' disabled />
//     //         </div>

//     //         <div className='mb-3'>
//     //           <label className='form-label'>Email:</label>
//     //           <input type='email' name='email' value={user.email} className='form-control' disabled />
//     //         </div>

//     //         <div className='mb-3'>
//     //           <label className='form-label'>Phone:</label>
//     //           <input type='text' name='phone' value={user.phone} className='form-control' disabled />
//     //         </div>

//     //         <div className='mb-3'>
//     //           <label className='form-label'>Gender:</label>
//     //           <select name='gender' value={user.gender} onChange={handleChange} className='form-select'>
//     //             <option value=''>Select</option>
//     //             <option value='Male'>Male</option>
//     //             <option value='Female'>Female</option>
//     //             <option value='Other'>Other</option>
//     //           </select>
//     //         </div>

//     //         <div className='mb-3'>
//     //           <label className='form-label'>State:</label>
//     //           <select name='state' value={user.state} onChange={handleChange} className='form-select'>
//     //             <option value=''>Select State</option>
//     //             {Object.keys(statesData).map((state) => (
//     //               <option key={state} value={state}>{state}</option>
//     //             ))}
//     //           </select>
//     //         </div>

//     //         <div className='mb-3'>
//     //           <label className='form-label'>City:</label>
//     //           <select name='city' value={user.city} onChange={handleChange} className='form-select' disabled={!user.state}>
//     //             <option value=''>Select City</option>
//     //             {user.state && statesData[user.state].map((city) => (
//     //               <option key={city} value={city}>{city}</option>
//     //             ))}
//     //           </select>
//     //         </div>

//     //         <div className='d-grid gap-2'>
//     //           <button type='submit' className='btn btn-primary'>Update Profile</button>
//     //           <button type='button' onClick={handleDelete} className='btn btn-danger'>Delete Account</button>
//     //         </div>
//     //       </form>
//     //     </div>
//     //   </div>
//     // </div>
//     <>
//     <div className='container-fluid outerBody'>
//       <div className='container w-full  '>
//         <div className='Acountheader'>
//           <div id='profile'>
//             <div>
//         <img src={'logo'} alt='image user '/></div>
//         <span id='username'>userName</span>
//        </div>
//        <button className='btn' >EDIT </button>

//        </div>
//        <div className='ProfileForm'>
//         <form>
//         <div> Full Name : {user.firstname} {user.lastname}
//         </div>
//        <div> Email : {user.email}</div>
//         <div>Contact no : {user.contact}</div>
//         <div>Address : {user.address?user.address : "NA"}</div>
//         <div>State  : {user.state?user.address : "NA"}</div>
//         <div>city  : {user.city?user.address : "NA"}</div>

//         </form>

//        </div>
//       </div>
//     </div>
//     </>
//   );
// }

// export default AccountSetting;
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { userProfile, updateProfile,deleteProfile } from '../Services/operation/authcall';
import logo from '../assesst/user.png'
import '../Pages/Stylesheet/Acount.css'
import countriesData from "../Pages/utils/countryStateCity.json"
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useNavigate} from 'react-router-dom'
function AccountSettings() {
  const { register, handleSubmit } = useForm();
  const [updateTrigger, setUpdateTrigger] = useState(false);
  let [user, setUser] = useState("")
  let token = localStorage.getItem("token");
  useEffect(() => {
    const fetchUserData = async () => {

      if (token) {
        try {
          console.log(token)
          const res = await userProfile(token);
          setUser(res);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }
    fetchUserData()
  }, [updateTrigger])
  const navigate=useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("");


  // Handle Input Change
  const onSubmit = async (data) => {

    console.log(data);
    let updateuserData = {
      ...data, Id: user.Id
    }
    try {
      let res = await updateProfile(updateuserData, token)
      if (res) {
        toast.success("Profile Successfully update", { autoClose: 2000 })
        setShowModal(false);
        setUpdateTrigger(prev => !prev);
      }
      else {
        toast.info("Profile not updated", { autoClose: 2000 })
      }
    } catch (e) {
      toast.error("Profile updated api error", { autoClose: 2000 })
    }
  }
  const deleteUser = async (Id) => {
    try {
     let ans=  window.confirm("Are you sure to delete this account")
    if(ans){
      let token = localStorage.getItem("token"); // ✅ Token ko fetch karo
      if (!token) {
        toast.error("Authentication failed. Please login again.", { autoClose: 2000 });
        return;
      }
  
      let del = await deleteProfile(Id,token); // ✅ Await ka use kiya
      if (del) {
        toast.success("User Deleted Successfully", { autoClose: 2000 });
        localStorage.clear();
        navigate('/login')
      }
    }} catch (e) {
      toast.error("Not deleted. API error", { autoClose: 2000 });
    }
  };
  

  const countryList = Object.keys(countriesData);
  const stateList = selectedCountry ? countriesData[selectedCountry].states : [];
  const cityList = selectedState ? stateList.find(state => state.code === selectedState)?.cities || [] : [];
  console.log("City List:", cityList);

  // Handle Form Submission

  return (
    <> <div className='container-fluid bg-light py-4 vh-100'>
      <div className='container'>
        {/* Profile Header */}
        <div className='d-flex justify-content-between Acountheader align-items-center bg-white p-3 shadow-sm rounded'>
          <div className='d-flex align-items-center'>
            <img src={logo} alt='User' className='rounded-circle me-3' width='60' height='60' />
            <span className='fw-bold fs-5 text-capitalize'>{user.username} {user.role}</span>
          </div>
          <div className='gap-3 d-flex'>   <button className="btn btn-primary" onClick={() => setShowModal(true)}>Edit</button>
            <button className='btn btn-danger' onClick={() => deleteUser(user.Id)}>Delete</button></div>
        </div>

        {/* Profile Form */}
        <div className='bg-white mt-4 p-4 shadow-sm rounded'>
          <h5 className='mb-3'>Profile Information</h5>
          <form>
            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>Full Name:</label>
              <div className='col-sm-9 text-capitalize'>{user.firstname} {user.lastname}</div>
            </div>

            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>Email:</label>
              <div className='col-sm-9'>{user.email}</div>
            </div>

            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>Contact No:</label>
              <div className='col-sm-9'>{user.contact}</div>
            </div>
            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>Gender:</label>
              <div className='col-sm-9 text-capitalize'>{user.gender ? user.gender : "NA"}</div>
            </div>
            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>Address:</label>
              <div className='col-sm-9 text-capitalize'>{user.address ? user.address : "NA"}</div>
            </div>

            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>State:</label>
              <div className='col-sm-9 text-capitalize'>{user.state ? user.state : "NA"}</div>
            </div>

            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>City:</label>
              <div className='col-sm-9 text-capitalize'>{user.city ? user.city : "NA"}</div>
            </div>
            <div className='row mb-3'>
              <label className='col-sm-3 fw-bold'>Pincode:</label>
              <div className='col-sm-9 text-capitalize'>{user.pincode ? user.pincode : "NA"}</div>
            </div>
          </form>
        </div>
      </div>
    </div>


      {showModal && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Profile</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <input type="text" placeholder="First Name" className="form-control" required value={firstName} {...register("firstname")} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <input type="text" placeholder="Last Name" className="form-control" required value={lastName} {...register("lastname")} onChange={(e) => setLastName(e.target.value)} />
                    </div>

<div className='d-flex  justify-content-around gap-2'>

                    <div className="mb-3">
                      <label className="form-label">Select Country</label>
                      <select className="form-control" value={selectedCountry} {...register("country")} onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedState(""); // Reset state when country changes
                      }}>
                        <option value="">-- Select Country --</option>
                        {countryList.map((countryCode) => (
                          <option key={countryCode} value={countryCode}>
                            {countriesData[countryCode].name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State Dropdown (Dependent on Country) */}
                   
                      <div className="mb-3">
                        <label className="form-label">Select State</label>
                        <select className="form-control" value={selectedState} {...register("state")} onChange={(e) => setSelectedState(e.target.value)}>
                          <option value="">-- Select State --</option>
                          {stateList.map((state) => (
                            <option key={state.code} value={state.code}>{state.name}</option>
                          ))}
                        </select>
                      </div>
          

                   
                      <div className="mb-3">
                        <label className="form-label">Select City</label>
                        <select className="form-control" {...register("city")}>
                          <option value="">-- Select City --</option>
                          {cityList.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
      </div>
                    <div className="mb-3">
                      <input type="text" placeholder="Address" className="form-control"{...register("address")} required value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <input type="text" placeholder="pincode" className="form-control"{...register("pincode")} required value={pincode} onChange={(e) => setPincode(e.target.value)} />
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button className="btn btn-success">
                    Update
                  </button>

                </div>
              </div>
            </div>
          </div>
        </form>

      )}

      {/* Modal Backdrop */}
      {showModal && <div className="modal-backdrop fade show"></div>}
      <ToastContainer />
    </>
  );
}

export default AccountSettings;


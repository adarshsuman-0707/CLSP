import React, { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
 const Image = () => {
    const [img,setImage]=useState("")
    const [res,setRes]=useState();
    const formdata=new FormData();
    formdata.append("image",img)
    const handleSubmit=async()=>{
        const res=await axios.post("http://localhost:5000/profile/upload",formdata)
        if(res){alert("Uploaded")}
    }
    let imageId='67f2d649c8b485ad96db11b9';
    useEffect(()=>{
        const ress= axios.get("http://localhost:5000/files/67f2d649c8b485ad96db11b9")
 setRes(ress)
    },[])
  return (
    <div>Image
    <input type="file" onChange={(e)=>{setImage(e.target.files[0])}}/>
    <button onClick={handleSubmit}>Upload</button>
    <img src={`http://localhost:5000/files/${imageId}`} alt="Uploaded Image" height={200} />
    </div>

  )
}
export default Image;
import React, { useState } from "react";
import axios from "axios";
const UserProfile = () => {
 const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/profile/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-3">Upload Profile Image</h3>
<img src="../../../../backend/uploads/1759751944326-Screenshot.png" alt="Profile" style={{width:"180px",height:"180px",borderRadius:"8px",objectFit:"cover",border:"2px solid #ccc"}}/>
      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {preview && (
          <div className="mb-3">
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "8px",
                objectFit: "cover",
                border: "2px solid #ccc",
              }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Upload
        </button>
      </form>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};


export default UserProfile
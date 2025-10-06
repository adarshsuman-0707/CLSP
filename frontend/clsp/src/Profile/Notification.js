import React, { useState, useEffect } from "react";
import { getNotification, markAsRead } from "../Services/operation/Notification";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Pages/Stylesheet/Notification.css'

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotification(token);
      // Only unread notifications
      setNotifications(res.notifications.filter(n => !n.isRead));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(token, id);
      setNotifications(prev => prev.filter(n => n._id !== id)); // remove from list
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="container py-4">
      <br></br>
      <br></br>
      <h3 className="mb-3">Notifications</h3>

      {loading && <p>Loading...</p>}
      {!loading && notifications.length === 0 && (
        <div className="alert alert-info">No new notifications!</div>
      )}

      <div className="row">
        {notifications.map(n => (
          <div key={n._id} className="col-md-3 mb-3 fade-in">
            <div className="card  shadow-lg"
              style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}>
              <div className="card-body">
                <h5 className="card-title">{n.title}</h5>
                <p className="card-text">{n.message}</p>
                <div className="d-flex justify-content-end gap-2">
                  {n.link && (
                    <a href={n.link} className="btn btn-sm btn-outline-primary">
                      View
                    </a>
                  )}
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleMarkAsRead(n._id)}
                  >
                    Mark as Read
                  </button>
                </div>
              </div>
              <div className="card-footer text-muted" style={{ fontSize: "0.8rem" }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;

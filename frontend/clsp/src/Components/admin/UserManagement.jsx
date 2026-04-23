import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getUsers,
  blockUser,
  changeUserRole,
  deleteUser,
} from "../../Services/operation/adminAuthCall";

const ROLES = ["user", "service", "admin"];

const UserManagement = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (currentPage, currentSearch) => {
    setLoading(true);
    try {
      const res = await getUsers(
        { page: currentPage, limit: 10, search: currentSearch },
        token
      );
      if (res?.success) {
        setUsers(res.data || []);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and whenever page or search changes
  useEffect(() => {
    fetchUsers(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      await blockUser(userId, token);
      toast.success(isBlocked ? "User unblocked successfully!" : "User blocked successfully!");
      fetchUsers(page, search);
    } catch (err) {
      toast.error(err?.message || err || "Failed to update user status!");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole, token);
      toast.success("User role updated successfully!");
      fetchUsers(page, search);
    } catch (err) {
      toast.error(err?.message || err || "Failed to change user role!");
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete this user?`)) return;
    try {
      await deleteUser(userId, token);
      toast.success(`User "${username}" deleted successfully!`);
      // If we deleted the last user on this page, go back one page
      if (users.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchUsers(page, search);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to delete user!");
    }
  };

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">👥 User Management</h4>
      </div>

      {/* Search bar */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Loading spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        /* Empty state */
        <div className="text-center py-5 text-muted">
          <div className="fs-1">🔍</div>
          <p className="mt-2">No users found.</p>
        </div>
      ) : (
        <>
          {/* Users table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td className="text-muted small">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td>
                      <div className="fw-semibold">{user.username}</div>
                      {user.firstname || user.lastname ? (
                        <small className="text-muted">
                          {[user.firstname, user.lastname].filter(Boolean).join(" ")}
                        </small>
                      ) : null}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {/* Role dropdown */}
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: "100px" }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{user.contact || "—"}</td>
                    <td>{user.city || "—"}</td>
                    <td>
                      {user.isBlocked ? (
                        <span className="badge bg-danger">Blocked</span>
                      ) : (
                        <span className="badge bg-success">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        {/* Block / Unblock button */}
                        {user.isBlocked ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          >
                            Block
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user._id, user.username)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Page {page} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page <= 1}
              >
                &laquo; Prev
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;

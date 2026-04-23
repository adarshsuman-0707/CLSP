import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import {
  userProfile,
  updateProfile,
  deleteProfile,
  uploadProfilePic,
  changePassword,
} from '../Services/operation/authcall';
import { NotificationAdd } from '../Services/operation/Notification';
import countriesData from '../Pages/utils/countryStateCity.json';
import defaultAvatar from '../assesst/user.png';

const API_BASE = 'http://localhost:5000';

/* ── small helpers ─────────────────────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div className="row mb-3 align-items-center">
    <div className="col-sm-4 fw-semibold text-muted small text-uppercase">{label}</div>
    <div className="col-sm-8 text-capitalize fw-medium">{value || <span className="text-muted">—</span>}</div>
  </div>
);

const roleBadgeClass = (role) =>
  role === 'admin' ? 'bg-danger' : role === 'service' ? 'bg-warning text-dark' : 'bg-success';

/* ── main component ─────────────────────────────────────────────────────────── */
function AccountSettings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  // modal tabs: 'profile' | 'password'
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // profile edit form
  const [editForm, setEditForm] = useState({
    firstname: '', lastname: '', address: '', pincode: '',
    country: '', state: '', city: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  /* ── fetch user ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    userProfile(token)
      .then((res) => setUser(res))
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [updateTrigger, token]);

  /* ── open edit modal, pre-fill form ── */
  const openEditModal = (tab = 'profile') => {
    if (user) {
      setEditForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        address: user.address || '',
        pincode: user.pincode || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
      });
    }
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setActiveTab(tab);
    setModalOpen(true);
  };

  /* ── profile picture upload ── */
  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    setUploadingPic(true);
    try {
      const res = await uploadProfilePic(file, token);
      toast.success('Profile picture updated!');
      await NotificationAdd(token, { type: 'account', title: 'Profile Picture', message: 'Profile picture updated.' });
      setUpdateTrigger((p) => !p);
    } catch (err) {
      toast.error(err?.message || 'Upload failed.');
    } finally {
      setUploadingPic(false);
      e.target.value = '';
    }
  };

  /* ── save profile info ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!editForm.firstname.trim() || !editForm.lastname.trim()) {
      toast.warning('First name and last name are required.');
      return;
    }
    if (editForm.pincode && !/^\d{6}$/.test(editForm.pincode)) {
      toast.warning('Pincode must be exactly 6 digits.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ ...editForm, Id: user.Id }, token);
      toast.success('Profile updated successfully!');
      await NotificationAdd(token, { type: 'account', title: 'Account', message: 'Profile updated.' });
      setModalOpen(false);
      setUpdateTrigger((p) => !p);
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── change password ── */
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.warning('All password fields are required.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    if (pwForm.newPassword === pwForm.currentPassword) {
      toast.warning('New password must be different from current password.');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        token
      );
      toast.success('Password changed successfully!');
      await NotificationAdd(token, { type: 'account', title: 'Security', message: 'Password changed.' });
      setModalOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  /* ── delete account ── */
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
    try {
      await deleteProfile(user.Id, token);
      toast.success('Account deleted.');
      localStorage.clear();
      navigate('/login');
    } catch {
      toast.error('Failed to delete account.');
    }
  };

  /* ── country / state / city cascades ── */
  const countryList = Object.keys(countriesData);
  const stateList = editForm.country ? (countriesData[editForm.country]?.states || []) : [];
  const cityList = editForm.state
    ? (stateList.find((s) => s.code === editForm.state)?.cities || [])
    : [];

  const avatarSrc = user?.profileImageUrl
    ? `${API_BASE}${user.profileImageUrl}`
    : defaultAvatar;

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ── render ── */
  return (
    <>

      <div className="container py-4 fade-in">
    <br>
    </br>  <br>
    </br>    
        {/* ── Profile card ── */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          {/* Gradient banner */}
          <div style={{ height: 100, background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)' }} />

          <div className="card-body px-4 pb-4">
            {/* Avatar row */}
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-3" style={{ marginTop: -50 }}>
              {/* Avatar + upload */}
              <div className="position-relative" style={{ width: 100 }}>
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="rounded-circle border border-4 border-white shadow"
                  style={{ width: 100, height: 100, objectFit: 'cover', background: '#fff' }}
                  onError={(e) => { e.target.src = defaultAvatar; }}
                />
                {/* Camera overlay */}
                <button
                  className="btn btn-sm btn-dark position-absolute bottom-0 end-0 rounded-circle p-1"
                  style={{ width: 30, height: 30, lineHeight: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPic}
                  title="Change profile picture"
                >
                  {uploadingPic
                    ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                    : '📷'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  className="d-none"
                  onChange={handlePicChange}
                />
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary btn-sm px-3" onClick={() => openEditModal('profile')}>
                  ✏️ Edit Profile
                </button>
                <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => openEditModal('password')}>
                  🔒 Change Password
                </button>
                <button className="btn btn-outline-danger btn-sm px-3" onClick={handleDelete}>
                  🗑 Delete Account
                </button>
              </div>
            </div>

            {/* Name + role */}
            <div className="mt-3">
              <h4 className="fw-bold mb-1 text-capitalize">
                {user.firstname} {user.lastname}
              </h4>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted small">@{user.username}</span>
                <span className={`badge ${roleBadgeClass(user.role)}`}>{user.role?.toUpperCase()}</span>
                {user.emailVerified && <span className="badge bg-success bg-opacity-75">✉ Verified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div className="row g-4">
          {/* Personal info */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-primary mb-3">👤 Personal Information</h6>
                <InfoRow label="Full Name" value={`${user.firstname} ${user.lastname}`} />
                <InfoRow label="Username" value={user.username} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Contact" value={user.contact} />
                <InfoRow label="Gender" value={user.gender} />
              </div>
            </div>
          </div>

          {/* Address info */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-primary mb-3">📍 Address Information</h6>
                <InfoRow label="Address" value={user.address} />
                <InfoRow label="City" value={user.city} />
                <InfoRow label="State" value={user.state} />
                <InfoRow label="Country" value={user.country} />
                <InfoRow label="Pincode" value={user.pincode} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Edit Modal — tabs: Profile Info | Change Password
      ══════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 520 }}>
              <div className="modal-content rounded-4 border-0 shadow-lg">

                {/* Header */}
                <div className="modal-header border-0 pb-0 px-4 pt-4">
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Account Settings</h5>
                    <small className="text-muted">Update your profile or change your password</small>
                  </div>
                  <button className="btn-close" onClick={() => setModalOpen(false)} />
                </div>

                {/* Tabs */}
                <div className="px-4 pt-3">
                  <ul className="nav nav-pills gap-2">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                      >
                        👤 Profile Info
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                      >
                        🔒 Password
                      </button>
                    </li>
                  </ul>
                </div>

                {/* ── Tab: Profile Info ── */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSave}>
                    <div className="modal-body px-4 pt-3">
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="form-label fw-semibold small">First Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.firstname}
                            onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-semibold small">Last Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.lastname}
                            onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                            required
                          />
                        </div>

                        {/* Country */}
                        <div className="col-12">
                          <label className="form-label fw-semibold small">Country</label>
                          <select
                            className="form-select"
                            value={editForm.country}
                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value, state: '', city: '' })}
                          >
                            <option value="">— Select Country —</option>
                            {countryList.map((code) => (
                              <option key={code} value={code}>{countriesData[code].name}</option>
                            ))}
                          </select>
                        </div>

                        {/* State */}
                        <div className="col-6">
                          <label className="form-label fw-semibold small">State</label>
                          <select
                            className="form-select"
                            value={editForm.state}
                            onChange={(e) => setEditForm({ ...editForm, state: e.target.value, city: '' })}
                            disabled={!stateList.length}
                          >
                            <option value="">— Select State —</option>
                            {stateList.map((s) => (
                              <option key={s.code} value={s.code}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* City */}
                        <div className="col-6">
                          <label className="form-label fw-semibold small">City</label>
                          <select
                            className="form-select"
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            disabled={!cityList.length}
                          >
                            <option value="">— Select City —</option>
                            {cityList.map((c, i) => (
                              <option key={i} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* Address */}
                        <div className="col-12">
                          <label className="form-label fw-semibold small">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Street, Area"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          />
                        </div>

                        {/* Pincode */}
                        <div className="col-6">
                          <label className="form-label fw-semibold small">Pincode</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="6-digit pincode"
                            maxLength={6}
                            value={editForm.pincode}
                            onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer border-0 px-4 pb-4">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary px-4" disabled={savingProfile}>
                        {savingProfile ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* ── Tab: Change Password ── */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSave}>
                    <div className="modal-body px-4 pt-3">
                      <div className="alert alert-info py-2 small mb-3">
                        🔒 Password must be at least 6 characters.
                      </div>

                      {/* Current password */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Current Password *</label>
                        <div className="input-group">
                          <input
                            type={showPw.current ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Enter current password"
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                          >
                            {showPw.current ? '🙈' : '👁'}
                          </button>
                        </div>
                      </div>

                      {/* New password */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">New Password *</label>
                        <div className="input-group">
                          <input
                            type={showPw.new ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Enter new password"
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPw({ ...showPw, new: !showPw.new })}
                          >
                            {showPw.new ? '🙈' : '👁'}
                          </button>
                        </div>
                        {/* Strength indicator */}
                        {pwForm.newPassword && (
                          <div className="mt-1">
                            <div className="progress" style={{ height: 4 }}>
                              <div
                                className={`progress-bar ${
                                  pwForm.newPassword.length < 6 ? 'bg-danger' :
                                  pwForm.newPassword.length < 10 ? 'bg-warning' : 'bg-success'
                                }`}
                                style={{ width: `${Math.min(100, (pwForm.newPassword.length / 12) * 100)}%` }}
                              />
                            </div>
                            <small className="text-muted">
                              {pwForm.newPassword.length < 6 ? 'Too short' :
                               pwForm.newPassword.length < 10 ? 'Fair' : 'Strong'}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Confirm New Password *</label>
                        <div className="input-group">
                          <input
                            type={showPw.confirm ? 'text' : 'password'}
                            className={`form-control ${
                              pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                                ? 'is-invalid' : ''
                            }`}
                            placeholder="Re-enter new password"
                            value={pwForm.confirmPassword}
                            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                          >
                            {showPw.confirm ? '🙈' : '👁'}
                          </button>
                          {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                            <div className="invalid-feedback">Passwords do not match.</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer border-0 px-4 pb-4">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-danger px-4" disabled={savingPw}>
                        {savingPw ? <span className="spinner-border spinner-border-sm me-1" /> : '🔒 '}
                        Update Password
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default AccountSettings;

import React, { useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchNearbyVendors } from "../../Services/operation/vendorAuthCall";

const CATEGORY_OPTIONS = [
  "All", "Plumbing", "Carpentry", "Electrical", "Cleaning",
  "AC Repair", "Painting", "Appliance Repair",
];

const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= stars ? "#f5a623" : "#ccc", fontSize: "14px" }}>★</span>
      ))}
      <small className="text-muted ms-1">({rating.toFixed(1)})</small>
    </span>
  );
};

const VendorCard = ({ vendor }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card h-100 shadow-sm border-0 rounded-4"
      style={{ transition: "transform 0.2s", cursor: "default" }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="fw-bold mb-0">{vendor.name}</h5>
            <small className="text-muted">{vendor.city}, {vendor.state}</small>
          </div>
          <span className={`badge rounded-pill ${vendor.availableWithinNextTwoHours ? "bg-success" : "bg-secondary"}`}>
            {vendor.availableWithinNextTwoHours ? "⚡ Available Now" : "Unavailable"}
          </span>
        </div>

        {/* Rating */}
        <div className="mb-2">
          <StarRating rating={vendor.rating} />
          <small className="text-muted ms-1">· {vendor.reviewCount} reviews</small>
        </div>

        {/* Distance */}
        <div className="mb-2">
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
            📍 {vendor.distance} km away
          </span>
        </div>

        {/* Service types */}
        <div className="mb-3 d-flex flex-wrap gap-1">
          {vendor.service_types.length > 0
            ? vendor.service_types.map((t) => (
                <span key={t} className="badge bg-light text-dark border">{t}</span>
              ))
            : <span className="text-muted small">No services listed</span>}
        </div>

        {/* Services list */}
        {vendor.services.length > 0 && (
          <div className="border-top pt-2">
            <small className="text-muted fw-semibold">Services:</small>
            <ul className="list-unstyled mb-0 mt-1">
              {vendor.services.slice(0, 3).map((s) => (
                <li key={s.id} className="d-flex justify-content-between small">
                  <span>{s.name}</span>
                  <span className="text-success fw-semibold">₹{s.price}</span>
                </li>
              ))}
              {vendor.services.length > 3 && (
                <li className="small text-muted">+{vendor.services.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div className="mt-3 border-top pt-2 d-flex gap-2">
          <a href={`tel:${vendor.contact}`} className="btn btn-sm btn-outline-primary flex-fill">
            📞 Call
          </a>
          <a
            href={`https://www.google.com/maps?q=${vendor.latitude},${vendor.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline-secondary flex-fill"
          >
            🗺️ Map
          </a>
        </div>
      </div>
    </div>
  </div>
);

const NearbyVendors = () => {
  const token = localStorage.getItem("token");

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState("All");

  const [meta, setMeta] = useState(null);

  // Auto-detect user location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocationLoading(false);
        toast.success("📍 Location detected!");
      },
      () => {
        setLocationLoading(false);
        toast.error("Unable to detect location. Please enter manually.");
      }
    );
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!lat || !lng) {
      toast.warning("Please provide your location first.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetchNearbyVendors(
        { lat, lng, radius, category: category === "All" ? "" : category },
        token
      );
      setVendors(res.data || []);
      setMeta(res.meta || null);
      if ((res.data || []).length === 0) {
        toast.info("No vendors found in this area. Try increasing the radius.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to fetch nearby vendors.");
    } finally {
      setLoading(false);
    }
  };

  // Sort controls
  const [sortBy, setSortBy] = useState("distance");
  const sorted = [...vendors].sort((a, b) => {
    if (sortBy === "distance") return a.distance - b.distance;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "available")
      return (b.availableWithinNextTwoHours ? 1 : 0) - (a.availableWithinNextTwoHours ? 1 : 0);
    return 0;
  });

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">📍 Find Nearby Vendors</h2>
        <p className="text-muted">Discover service providers near you, sorted by distance, rating, and availability.</p>
      </div>

      {/* Search form */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              {/* Latitude */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 28.6139"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>

              {/* Longitude */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 77.2090"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>

              {/* Radius */}
              <div className="col-md-2">
                <label className="form-label fw-semibold">Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="col-md-2">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="col-md-2 d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={detectLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : "📍"} Auto-detect
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-1" /> : "🔍"} Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <>
          {/* Meta + sort bar */}
          {meta && (
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <span className="text-muted small">
                Found <strong>{meta.totalFound}</strong> vendor(s) within <strong>{meta.radiusKm} km</strong>
              </span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Sort by:</span>
                {["distance", "rating", "available"].map((opt) => (
                  <button
                    key={opt}
                    className={`btn btn-sm ${sortBy === opt ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setSortBy(opt)}
                  >
                    {opt === "distance" ? "📍 Distance" : opt === "rating" ? "⭐ Rating" : "⚡ Available"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">Searching nearby vendors...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1">🔍</div>
              <h5 className="mt-2">No vendors found</h5>
              <p className="text-muted">Try increasing the radius or changing the category.</p>
            </div>
          ) : (
            <div className="row">
              {sorted.map((vendor) => (
                <VendorCard key={vendor.vendor_id} vendor={vendor} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NearbyVendors;

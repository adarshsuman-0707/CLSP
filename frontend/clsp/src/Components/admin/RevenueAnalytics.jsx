import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { getAnalytics } from "../../Services/operation/adminAuthCall";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "₹0";
  if (amount >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(2)}L`;
  if (amount >= 10_000)    return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

// ── Summary Card ──────────────────────────────────────────────────────────────

const SummaryCard = ({ icon, label, value, colorClass }) => (
  <div className="col-6 col-xl-4 col-xxl-2">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3 py-3">
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${colorClass}`}
          style={{ width: 48, height: 48, fontSize: 22 }}
        >
          {icon}
        </div>
        <div>
          <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>
            {label}
          </div>
          <div className="fw-bold fs-5 lh-1 mt-1">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

// ── Top-5 List ────────────────────────────────────────────────────────────────

const TopFiveList = ({ title, icon, items, valueLabel, valueFormatter }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-header bg-white border-bottom fw-bold py-3">
      {icon} {title}
    </div>
    <div className="card-body p-0">
      {items && items.length > 0 ? (
        <ol className="list-group list-group-flush list-group-numbered">
          {items.map((item, idx) => (
            <li key={item._id || idx} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2">
              <span className="text-truncate me-2" style={{ maxWidth: "65%" }}>
                {item.name || "—"}
              </span>
              <span className="badge bg-primary rounded-pill">
                {valueFormatter ? valueFormatter(item.count ?? item.value) : (item.count ?? item.value)}
                {valueLabel && <span className="ms-1 fw-normal opacity-75 small">{valueLabel}</span>}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-center text-muted py-4 small">No data available</div>
      )}
    </div>
  </div>
);

// ── Chart Card wrapper ────────────────────────────────────────────────────────

const ChartCard = ({ title, icon, height = 280, children }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-header bg-white border-bottom fw-bold py-3">
      {icon} {title}
    </div>
    <div className="card-body" style={{ height }}>
      {children}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const RevenueAnalytics = () => {
  const token = localStorage.getItem("token");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");

  const fetchAnalytics = useCallback(async (from, to) => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.dateFrom = from;
      if (to)   params.dateTo   = to;
      const res = await getAnalytics(params, token);
      if (res?.success) {
        setAnalytics(res.data);
      } else {
        toast.error(res?.message || "Failed to load analytics.");
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAnalytics("", ""); }, [fetchAnalytics]);

  const handleApplyFilter = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error("'Date From' must be before 'Date To'.");
      return;
    }
    fetchAnalytics(dateFrom, dateTo);
  };

  const handleClearFilter = () => {
    setDateFrom("");
    setDateTo("");
    fetchAnalytics("", "");
  };

  // ── Chart data builders ───────────────────────────────────────────────────

  const revenueBarData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: "Revenue (₹)",
      data: analytics?.monthlyRevenue || Array(12).fill(0),
      backgroundColor: "rgba(99,102,241,0.7)",
      borderColor: "rgba(99,102,241,1)",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const trends = analytics?.trends || {};

  const usersLineData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: "New Users",
        data: trends.users || Array(12).fill(0),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "New Vendors",
        data: trends.vendors || Array(12).fill(0),
        borderColor: "#fd7e14",
        backgroundColor: "rgba(253,126,20,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const bookingsLineData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: "Bookings",
      data: trends.bookings || Array(12).fill(0),
      borderColor: "#198754",
      backgroundColor: "rgba(25,135,84,0.1)",
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  const paymentsLineData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: "Successful Payments",
      data: trends.payments || Array(12).fill(0),
      borderColor: "#dc3545",
      backgroundColor: "rgba(220,53,69,0.1)",
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  // Booking status pie
  const bookingStatusDist = analytics?.bookingStatusDist || [];
  const bookingPieData = {
    labels: bookingStatusDist.map((e) => e.status),
    datasets: [{
      data: bookingStatusDist.map((e) => e.count),
      backgroundColor: ["#198754","#dc3545","#ffc107","#0d6efd","#6c757d","#0dcaf0"],
      borderWidth: 2,
    }],
  };

  // Payment status doughnut
  const paymentStatusDist = analytics?.paymentStatusDist || [];
  const paymentDoughnutData = {
    labels: paymentStatusDist.map((e) => e.status),
    datasets: [{
      data: paymentStatusDist.map((e) => e.count),
      backgroundColor: ["#198754","#dc3545","#ffc107","#6c757d","#0dcaf0"],
      borderWidth: 2,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, tooltip: {} },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString("en-IN")}` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v) }, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "right" } },
  };

  // ── Summary values ────────────────────────────────────────────────────────

  const summary      = analytics?.summary || {};
  const totalRevenue = analytics?.totalRevenue ?? 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold text-primary mb-0">📊 Revenue & Analytics</h4>
      </div>

      {/* Date range filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-muted">Date From</label>
              <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-muted">Date To</label>
              <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary flex-grow-1" onClick={handleApplyFilter} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Loading…</> : "Apply Filter"}
              </button>
              <button className="btn btn-outline-secondary" onClick={handleClearFilter} disabled={loading}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading analytics data…</p>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ──────────────────────────────────────────────── */}
          <div className="row g-3 mb-4">
            <SummaryCard icon="💰" label="Total Revenue"        value={formatCurrency(totalRevenue)}                          colorClass="bg-success bg-opacity-10 text-success" />
            <SummaryCard icon="👥" label="Total Users"          value={Number(summary.totalUsers   ?? 0).toLocaleString("en-IN")} colorClass="bg-primary bg-opacity-10 text-primary" />
            <SummaryCard icon="🏪" label="Total Vendors"        value={Number(summary.totalVendors ?? 0).toLocaleString("en-IN")} colorClass="bg-warning bg-opacity-10 text-warning" />
            <SummaryCard icon="📋" label="Total Bookings"       value={Number(summary.totalBookings ?? 0).toLocaleString("en-IN")} colorClass="bg-info bg-opacity-10 text-info" />
            <SummaryCard icon="💳" label="Successful Payments"  value={Number(summary.totalPayments ?? 0).toLocaleString("en-IN")} colorClass="bg-danger bg-opacity-10 text-danger" />
          </div>

          {/* ── Row 1: Revenue Bar + Booking Status Pie ────────────────────── */}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <ChartCard title="Monthly Revenue (Current Year)" icon="📈" height={300}>
                <Bar data={revenueBarData} options={barOptions} />
              </ChartCard>
            </div>
            <div className="col-lg-4">
              <ChartCard title="Booking Status Distribution" icon="🥧" height={300}>
                {bookingStatusDist.length > 0
                  ? <Pie data={bookingPieData} options={pieOptions} />
                  : <div className="text-center text-muted pt-5">No booking data</div>}
              </ChartCard>
            </div>
          </div>

          {/* ── Row 2: Users & Vendors Line + Payment Doughnut ─────────────── */}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <ChartCard title="User & Vendor Registrations (Current Year)" icon="👤" height={280}>
                <Line data={usersLineData} options={lineOptions} />
              </ChartCard>
            </div>
            <div className="col-lg-4">
              <ChartCard title="Payment Status Distribution" icon="💳" height={280}>
                {paymentStatusDist.length > 0
                  ? <Doughnut data={paymentDoughnutData} options={pieOptions} />
                  : <div className="text-center text-muted pt-5">No payment data</div>}
              </ChartCard>
            </div>
          </div>

          {/* ── Row 3: Bookings Line + Payments Line ───────────────────────── */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <ChartCard title="Bookings Trend (Current Year)" icon="📅" height={260}>
                <Line data={bookingsLineData} options={lineOptions} />
              </ChartCard>
            </div>
            <div className="col-lg-6">
              <ChartCard title="Payments Trend (Current Year)" icon="💰" height={260}>
                <Line data={paymentsLineData} options={lineOptions} />
              </ChartCard>
            </div>
          </div>

          {/* ── Row 4: Top 5 Lists ──────────────────────────────────────────── */}
          <div className="row g-4">
            <div className="col-lg-6">
              <TopFiveList
                title="Top 5 Services by Bookings"
                icon="🛠️"
                items={analytics?.topServices || []}
                valueLabel="bookings"
              />
            </div>
            <div className="col-lg-6">
              <TopFiveList
                title="Top 5 Vendors by Bookings"
                icon="🏆"
                items={analytics?.topVendors || []}
                valueLabel="bookings"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueAnalytics;

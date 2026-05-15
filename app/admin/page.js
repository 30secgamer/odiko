"use client";

import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("pending");

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/admin/drivers");
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAction = async (id, action) => {
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, action, reason }),
    });

    setSelected(null);
    setReason("");
    fetchDrivers();
  };

  const filteredDrivers = drivers.filter(
    (driver) => driver.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              Driver Verification
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Review and manage all driver onboarding requests
            </p>
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
            {["pending", "approved", "rejected"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                  filter === item
                    ? "bg-black text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div
                key={driver._id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={driver.profilePhoto}
                      alt=""
                      loading="lazy"
                      className="w-14 h-14 rounded-full object-cover border"
                    />

                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        {driver.name}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {driver.vehicleNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        driver.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : driver.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {driver.status}
                    </span>

                    <button
                      onClick={() => setSelected(driver)}
                      className="bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border rounded-2xl p-10 text-center text-zinc-500">
              No drivers found
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

            {/* TOP */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {selected.name}
                </h2>
                <p className="text-sm text-zinc-500">
                  {selected.vehicleNumber}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="text-zinc-400 hover:text-black text-sm"
              >
                Close
              </button>
            </div>

            {/* DOCS */}
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">
              Uploaded Documents
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                selected.license,
                selected.aadhaar,
                selected.rc,
                selected.insurance,
              ].map((img, i) => (
                <a key={i} href={img} target="_blank">
                  <img
                    src={img}
                    alt=""
                    className="h-36 w-full object-cover rounded-2xl border hover:scale-[1.02] transition"
                  />
                </a>
              ))}
            </div>

            {/* SELFIE */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                Live Selfie
              </h3>
              <img
                src={selected.selfie}
                alt=""
                className="w-full h-52 rounded-2xl object-cover border"
              />
            </div>

            {/* REJECT REASON */}
            <textarea
              placeholder="Enter rejection reason (required if rejecting)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-zinc-300 rounded-2xl p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black mb-6"
            />

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAction(selected._id, "approve")}
                className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-semibold hover:bg-green-700 transition"
              >
                Approve
              </button>

              <button
                onClick={() => handleAction(selected._id, "reject")}
                className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
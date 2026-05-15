"use client";

import { useEffect, useState } from "react";


export default function BookingPage() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const [showPickupSuggestions, setShowPickupSuggestions] =
    useState(false);

  const [showDropSuggestions, setShowDropSuggestions] =
    useState(false);

  const [fareData, setFareData] = useState(null);

  const [loadingFare, setLoadingFare] = useState(false);
  const [userLocation, setUserLocation] =
  useState(null);

  const [user, setUser] =
  useState(null);
  const [activeRide, setActiveRide] =
  useState(null);

  // 🚕 FETCH FARE
  const calculateFare = async () => {
    if (!pickup || !drop) return;

    try {
      setLoadingFare(true);

      const res = await fetch("/api/fare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup,
          drop,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed");
        return;
      }

      setFareData(data);

    } catch (err) {
      console.log(err);
    } finally {
      setLoadingFare(false);
    }
  };

 // 📍 SMART LOCATION SUGGESTIONS
const getSuggestions = async (
  query,
  type
) => {

  if (!query || query.length < 2) return;

  try {

    let url = "";

    // 🔥 USE GPS BIAS
    if (userLocation) {

      url =
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=10&countrycodes=in&viewbox=${
          userLocation.lon - 0.15
        },${userLocation.lat + 0.15},${
          userLocation.lon + 0.15
        },${userLocation.lat - 0.15}&bounded=1`;

    } else {

      url =
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=10&countrycodes=in`;

    }

    const res = await fetch(url);

    const data = await res.json();

    const search = query.toLowerCase();

    const sortedResults = data.sort(
      (a, b) => {

        const aName =
          a.display_name.toLowerCase();

        const bName =
          b.display_name.toLowerCase();

        // ✅ STARTS WITH
        const aStarts =
          aName.startsWith(search);

        const bStarts =
          bName.startsWith(search);

        if (aStarts && !bStarts)
          return -1;

        if (!aStarts && bStarts)
          return 1;

        // ✅ FIRST PLACE NAME
        const aFirst =
          aName.split(",")[0];

        const bFirst =
          bName.split(",")[0];

        const aFirstStarts =
          aFirst.startsWith(search);

        const bFirstStarts =
          bFirst.startsWith(search);

        if (
          aFirstStarts &&
          !bFirstStarts
        )
          return -1;

        if (
          !aFirstStarts &&
          bFirstStarts
        )
          return 1;

        return 0;
      }
    );

    if (type === "pickup") {
      setPickupSuggestions(
        sortedResults
      );
    } else {
      setDropSuggestions(
        sortedResults
      );
    }

  } catch (err) {
    console.log(err);
  }
};

  // 🔥 PICKUP SEARCH
  useEffect(() => {
    const timeout = setTimeout(() => {
      getSuggestions(pickup, "pickup");
    }, 400);

    return () => clearTimeout(timeout);
  }, [pickup]);

  // 🔥 DROP SEARCH
  useEffect(() => {
    const timeout = setTimeout(() => {
      getSuggestions(drop, "drop");
    }, 400);

    return () => clearTimeout(timeout);
  }, [drop]);

  // 💰 AUTO CALCULATE FARE
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pickup && drop) {
        calculateFare();
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [pickup, drop]);

  // 👤 FETCH USER
useEffect(() => {

  const fetchUser = async () => {

    try {

      const token =
        localStorage.getItem(
          "userToken"
        );

      // 🚫 NOT LOGGED IN
      if (!token) {

        window.location.href =
          "/user-login";

        return;
      }

      const res = await fetch(
        "/api/user-profile",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        localStorage.removeItem(
          "userToken"
        );

        window.location.href =
          "/user-login";

        return;
      }

      setUser(data.user);

    } catch (err) {

      console.log(err);

    }
  };

  fetchUser();

}, []);

  // 📍 GET REAL USER LOCATION
useEffect(() => {

  navigator.geolocation.getCurrentPosition(
    (position) => {

      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });

    },
    (error) => {
      console.log(error);
    }
  );

}, []);

// 👤 LOAD USER
useEffect(() => {

  const storedUser =
    localStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }

}, []);

useEffect(() => {

  if (!user?.phone) return;

  const fetchRide = async () => {

    try {

      const res = await fetch(
        "/api/rides/user-active",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            passengerPhone:
              user.phone,
          }),
        }
      );

      const data =
        await res.json();

      setActiveRide(data);

    } catch (err) {
      console.log(err);
    }
  };

  fetchRide();

  const interval =
    setInterval(fetchRide, 3000);

  return () =>
    clearInterval(interval);

}, [user]);

// 🚕 BOOK RIDE
const bookRide = async () => {

  try {

    const res = await fetch(
      "/api/book-ride",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          passengerName: user?.name,
passengerPhone: user?.phone,
          pickup,
          drop,

          pickupLat:
            fareData.pickupLat,

          pickupLon:
            fareData.pickupLon,

          dropLat:
            fareData.dropLat,

          dropLon:
            fareData.dropLon,

          distance:
            fareData.distance,

          fare:
            fareData.totalFare,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(
      "Searching nearby drivers..."
    );

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="min-h-screen bg-[#f6f7f9] pb-10">

     {/* HEADER */}
<div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">

  <div className="max-w-md mx-auto h-[74px] px-4 flex items-center justify-between">

    {/* LEFT */}
    <div>

      <p className="text-xs text-gray-500">
        Welcome back
      </p>

      <h1 className="text-[20px] font-bold text-gray-900 mt-[2px]">
        {user?.name || "User"}
      </h1>

    </div>

    {/* PROFILE */}
    <div className="flex items-center gap-3">

      <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold shadow-sm">

        {user?.name
          ?.charAt(0)
          ?.toUpperCase() || "U"}

      </div>

    </div>

  </div>

</div>

      {/* MAIN */}
      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* MAP */}
        <div className="h-[280px] rounded-[30px] overflow-hidden bg-gray-200 relative shadow-sm">

          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />

          {/* PIN */}
          <div className="absolute inset-0 flex items-center justify-center">

            <div className="relative">

              <div className="w-5 h-5 rounded-full bg-black border-4 border-white shadow-xl" />

              <div className="absolute inset-0 animate-ping rounded-full bg-black/30" />

            </div>

          </div>

        </div>

        {/* LOCATION CARD */}
        <div className="bg-white rounded-[30px] border border-gray-200 p-5 shadow-sm">

          <div className="space-y-4">

            {/* PICKUP */}
            <div className="relative">

              <div className="flex gap-3">

                <div className="pt-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                <div className="flex-1">

                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Pickup Location
                  </p>

                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={pickup}
                    onFocus={() =>
                      setShowPickupSuggestions(true)
                    }
                    onChange={(e) =>
                      setPickup(e.target.value)
                    }
                    className="w-full outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400"
                  />

                </div>

              </div>

              {/* PICKUP SUGGESTIONS */}
              {showPickupSuggestions &&
                pickupSuggestions.length > 0 && (
                  <div className="mt-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">

                    {pickupSuggestions
                      .slice(0, 5)
                      .map((place, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPickup(place.display_name);
                            setShowPickupSuggestions(false);
                          }}
                          className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                        >

                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {place.display_name}
                          </p>

                        </button>
                      ))}

                  </div>
                )}

            </div>

            {/* LINE */}
            <div className="ml-[5px] h-6 border-l-2 border-dashed border-gray-300" />

            {/* DROP */}
            <div className="relative">

              <div className="flex gap-3">

                <div className="pt-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                </div>

                <div className="flex-1">

                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Drop Location
                  </p>

                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    value={drop}
                    onFocus={() =>
                      setShowDropSuggestions(true)
                    }
                    onChange={(e) =>
                      setDrop(e.target.value)
                    }
                    className="w-full outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400"
                  />

                </div>

              </div>

              {/* DROP SUGGESTIONS */}
              {showDropSuggestions &&
                dropSuggestions.length > 0 && (
                  <div className="mt-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">

                    {dropSuggestions
                      .slice(0, 5)
                      .map((place, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setDrop(place.display_name);
                            setShowDropSuggestions(false);
                          }}
                          className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                        >

                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {place.display_name}
                          </p>

                        </button>
                      ))}

                  </div>
                )}

            </div>

          </div>

        </div>

        {/* FARE CARD */}
        <div className="bg-[#111111] text-white rounded-[30px] p-5 shadow-sm relative overflow-hidden">

          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-gray-400 mb-2">
                  Estimated Fare
                </p>

                <h1 className="text-5xl font-bold tracking-tight">

                  {loadingFare
                    ? "..."
                    : `₹${fareData?.totalFare || 0}`}

                </h1>

              </div>

              <div className="bg-white/10 px-3 py-1 rounded-full text-xs border border-white/10">
                Auto
              </div>

            </div>

            {/* DETAILS */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">

              <div className="flex items-center justify-between text-sm">

                <p className="text-gray-400">
                  Distance
                </p>

                <p className="font-medium">
                  {fareData?.distance || 0} km
                </p>

              </div>

              <div className="flex items-center justify-between text-sm">

                <p className="text-gray-400">
                  Auto Fare
                </p>

                <p className="font-medium">
                  ₹{fareData?.autoFare || 0}
                </p>

              </div>

              <div className="flex items-center justify-between text-sm">

                <p className="text-gray-400">
                  Platform Fee
                </p>

                <p className="font-medium">
                  ₹{fareData?.platformFee || 0}
                </p>

              </div>

            </div>

          </div>

        </div>

     <button
  onClick={bookRide}
  
  disabled={
  !pickup ||
  !drop ||
  loadingFare ||
  activeRide
}
  className="w-full h-14 rounded-2xl bg-black text-white font-semibold text-[15px] transition-all active:scale-[0.99] disabled:opacity-50"
>

  {loadingFare
    ? "Calculating..."
    : activeRide
  ? activeRide.status ===
    "searching"
    ? "Searching nearby drivers..."
    : `Driver ${
    activeRide.driverName || "assigned"
  } accepted`
  : "Book Auto"}

</button>
{/* ACTIVE RIDE DETAILS */}
{activeRide && (

  <div className="bg-white rounded-[30px] border border-gray-200 p-5 shadow-sm mt-4 space-y-4">

    <h2 className="text-xl font-bold text-gray-900">
      Active Ride
    </h2>

    {/* DRIVER */}
    <div>
      <p className="text-xs text-gray-500">
        Driver
      </p>

      <p className="text-sm font-semibold text-gray-900">
        {activeRide.driverName || "Searching..."}
      </p>
    </div>

    {/* PICKUP */}
    <div>
      <p className="text-xs text-gray-500">
        Pickup
      </p>

      <p className="text-sm font-medium text-gray-900">
        {activeRide.pickup}
      </p>
    </div>

    {/* DROP */}
    <div>
      <p className="text-xs text-gray-500">
        Drop
      </p>

      <p className="text-sm font-medium text-gray-900">
        {activeRide.drop}
      </p>
    </div>

    {/* OTP */}
    {activeRide.driverId && !activeRide.otpVerified && (

      <div className="bg-black text-white rounded-2xl p-5 text-center">

        <p className="text-sm text-gray-300 mb-2">
          Share this OTP with driver
        </p>

        <h1 className="text-5xl font-bold tracking-[10px]">
          {activeRide.otp}
        </h1>

      </div>

    )}

    {/* PICKED UP */}
    {activeRide.otpVerified && (

      <div className="bg-green-100 text-green-700 rounded-2xl p-4 text-center font-semibold">

        Passenger Picked Up Successfully

      </div>

    )}

  </div>

)}

      </div>

    </div>
  );
}
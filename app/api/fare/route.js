import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { pickup, drop } = body;

    if (!pickup || !drop) {
      return NextResponse.json(
        {
          message: "Pickup and drop required",
        },
        { status: 400 }
      );
    }

    // 📍 GET PICKUP COORDINATES
    const pickupRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        pickup
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "WinWaveRideApp/1.0",
        },
      }
    );

    const pickupData = await pickupRes.json();

    // 📍 GET DROP COORDINATES
    const dropRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        drop
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "WinWaveRideApp/1.0",
        },
      }
    );

    const dropData = await dropRes.json();

    if (!pickupData.length || !dropData.length) {
      return NextResponse.json(
        {
          message: "Location not found",
        },
        { status: 404 }
      );
    }

    const pickupLat = pickupData[0].lat;
    const pickupLon = pickupData[0].lon;

    const dropLat = dropData[0].lat;
    const dropLon = dropData[0].lon;

    // 🚗 REAL ROAD ROUTE DISTANCE (OSRM)
    const routeRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${dropLon},${dropLat}?overview=false`
    );

    const routeData = await routeRes.json();

    if (
      !routeData.routes ||
      !routeData.routes.length
    ) {
      return NextResponse.json(
        {
          message: "Unable to calculate route",
        },
        { status: 400 }
      );
    }

    // 📏 DISTANCE IN KM
    const distance =
      routeData.routes[0].distance / 1000;

    // 🚕 AUTO FARE
    let autoFare = 30;

    if (distance > 1.5) {
      autoFare +=
        Math.ceil(distance - 1.5) * 20;
    }

    // 💰 PLATFORM FEE
    const platformFee =
      autoFare <= 100 ? 5 : 10;

    // ✅ TOTAL
    const totalFare =
      autoFare + platformFee;

  return NextResponse.json({
  distance: distance.toFixed(1),

  autoFare,
  platformFee,
  totalFare,

  pickupLat,
  pickupLon,

  dropLat,
  dropLon,
});

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
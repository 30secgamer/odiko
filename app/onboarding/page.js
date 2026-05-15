"use client";

import { useState, useRef, useEffect } from "react";
  import { useRouter } from "next/navigation";



export default function Onboarding() {

  const [loading, setLoading] = useState(false);
  const streamRef = useRef(null);
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("en");
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    vehicleNumber: "",
    profile: null,
    license: null,
    aadhaar: null,
    rc: null,
    insurance: null,
    selfie: null,
  });

  const videoRef = useRef(null);

  const text = {
    en: {
      title: "Driver Verification",
      next: "Next",
      submit: "Submit",
      name: "Full Name",
      vehicle: "Vehicle Number",
      profile: "Profile Photo",
      license: "Driving License",
      aadhaar: "Aadhaar Card",
      rc: "RC Book",
      insurance: "Insurance",
      selfie: "Live Selfie",
    },
    ml: {
      title: "ഡ്രൈവർ സ്ഥിരീകരണം",
      next: "അടുത്തത്",
      submit: "സമർപ്പിക്കുക",
      name: "പേര്",
      vehicle: "വാഹന നമ്പർ",
      profile: "പ്രൊഫൈൽ ഫോട്ടോ",
      license: "ഡ്രൈവിംഗ് ലൈസൻസ്",
      aadhaar: "ആധാർ കാർഡ്",
      rc: "RC ബുക്ക്",
      insurance: "ഇൻഷുറൻസ്",
      selfie: "ലൈവ് സെൽഫി",
    },
  };

  const handleFile = (e, field) => {
    setForm({ ...form, [field]: e.target.files[0] });
  };

  const FileInput = ({ label, field }) => (
    <div className="mb-5">
     <label className="text-sm text-gray-800 font-medium mb-2 block">{label}</label>

      <label className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-black transition">
      <span className="text-sm text-gray-900 font-medium">
  {form[field] ? form[field].name : "Choose file"}
</span>
        <span className="text-xs text-black font-medium">Upload</span>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e, field)}
          className="hidden"
        />
      </label>
    </div>
  );

  // 🎥 START CAMERA
  useEffect(() => {
  if (step === 4 && videoRef.current && !form.selfie) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        streamRef.current = stream; // ✅ store stream
        videoRef.current.srcObject = stream;
      })
      .catch(() => {
        alert("Camera access denied");
      });
  }

  // cleanup when leaving step or unmount
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };
}, [step, form.selfie]);

  // 📸 CAPTURE SELFIE
const captureSelfie = () => {
  const video = videoRef.current;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob((blob) => {
    const file = new File([blob], "selfie.jpg", {
      type: "image/jpeg",
    });

    setForm((prev) => ({
      ...prev,
      selfie: file,
    }));

    // ✅ SAFE STOP (no crash)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, "image/jpeg");
};

  // 🔄 RETAKE
const retakeSelfie = () => {
  // stop old stream if exists
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  setForm((prev) => ({ ...prev, selfie: null }));

  // restart camera
  setTimeout(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
        });
    }
  }, 200);
};

  const canGoNext = () => {
    if (step === 1) return form.name && form.profile;
    if (step === 2) return form.license && form.aadhaar;
    if (step === 3) return form.vehicleNumber && form.rc && form.insurance;
    if (step === 4) return form.selfie;
    return true;
  };

 const handleSubmit = async () => {
  const data = new FormData();
  Object.keys(form).forEach((key) => data.append(key, form[key]));

  const token = localStorage.getItem("token");

  try {
    setLoading(true);

    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");

  } catch {
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          {/* Language */}
          <div className="flex justify-end text-xs mb-4">
            <button onClick={() => setLang("en")} className={`mr-3 ${lang==="en"?"text-black":"text-gray-400"}`}>EN</button>
            <button onClick={() => setLang("ml")} className={`${lang==="ml"?"text-black":"text-gray-400"}`}>ML</button>
          </div>

          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            {text[lang].title}
          </h1>

          {/* Progress */}
          <div className="mb-6">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
              Step {step} of 4
            </p>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                placeholder={text[lang].name}
               className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-5 text-gray-900 placeholder-gray-500 focus:border-black outline-none"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <FileInput label={text[lang].profile} field="profile" />
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <FileInput label={text[lang].license} field="license" />
              <FileInput label={text[lang].aadhaar} field="aadhaar" />
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                placeholder={text[lang].vehicle}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-5 text-gray-900 placeholder-gray-500 focus:border-black outline-none"
                onChange={(e) =>
                  setForm({ ...form, vehicleNumber: e.target.value })
                }
              />
              <FileInput label={text[lang].rc} field="rc" />
              <FileInput label={text[lang].insurance} field="insurance" />
            </>
          )}

          {/* STEP 4 - LIVE SELFIE */}
          {step === 4 && (
            <div className="text-center">
              {!form.selfie ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-56 bg-black rounded-lg object-cover mb-4"
                  />

                  <button
                    onClick={captureSelfie}
                    className="w-full bg-black text-white py-3 rounded-lg"
                  >
                    Capture Selfie
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={URL.createObjectURL(form.selfie)}
                    className="w-full h-56 object-cover rounded-lg mb-4"
                  />

                  <button
                    onClick={retakeSelfie}
                   className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-100 transition"
                  >
                    Retake
                  </button>
                </>
              )}
            </div>
          )}

          {/* BUTTON */}
          {step < 4 ? (
            <button
              disabled={!canGoNext()}
              onClick={() => setStep(step + 1)}
              className={`w-full py-3 rounded-lg text-sm font-medium ${
                canGoNext()
                  ? "bg-black text-white active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {text[lang].next}
            </button>
          ) : (
          <button
  disabled={!canGoNext() || loading}
  onClick={handleSubmit}
  className={`w-full py-3 rounded-lg text-sm font-medium ${
    !canGoNext() || loading
      ? "bg-gray-200 text-gray-400"
      : "bg-black text-white active:scale-[0.98]"
  }`}
>
  {loading ? "Please wait..." : text[lang].submit}
</button>
          )}
        </div>
      </div>
      {loading && (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="flex flex-col items-center">

      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>

      {/* Text */}
      <p className="text-sm text-gray-700 font-medium">
        Creating your account...
      </p>

    </div>

  </div>
)}
    </div>
  );
}
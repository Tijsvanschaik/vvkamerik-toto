"use client";

export default function ClosedBanner() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-red-800 mb-2">
        Voorspellingen zijn gesloten
      </h2>
      <p className="text-red-600">
        De beheerder heeft de voorspellingen gesloten. Je kunt op dit moment geen
        voorspelling meer indienen.
      </p>
      <a
        href="/"
        className="inline-block mt-4 bg-[#1e3a8a] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#2d4fa8] transition-colors"
      >
        Bekijk het dashboard
      </a>
    </div>
  );
}

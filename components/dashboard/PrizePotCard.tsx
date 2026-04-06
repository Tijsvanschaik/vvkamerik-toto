"use client";

interface PrizePotCardProps {
  participantCount: number;
  totalPot: number;
  clubShare: number;
  prize1st: number;
  prize2nd: number;
  prize3rd: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

export default function PrizePotCard({
  participantCount,
  totalPot,
  clubShare,
  prize1st,
  prize2nd,
  prize3rd,
}: PrizePotCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">
          Financieel
        </p>
        <h2 className="text-xl font-bold text-gray-900">Prijzenpot</h2>
      </div>

      <div className="divide-y divide-gray-50">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-base text-gray-500">Deelnemers</span>
          <span className="text-base font-bold text-gray-900">{participantCount}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-base text-gray-500">Totale pot</span>
          <span className="text-base font-bold text-[#1e3a8a]">{fmt(totalPot)}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-base text-gray-500">Naar clubkas</span>
          <span className="text-base font-bold text-gray-600">{fmt(clubShare)}</span>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-300 mb-3">
            Prijzen
          </p>
          <div className="space-y-2">
            {[
              { rank: 1, label: "1e plaats", prize: prize1st, color: "text-yellow-500" },
              { rank: 2, label: "2e plaats", prize: prize2nd, color: "text-gray-400" },
              { rank: 3, label: "3e plaats", prize: prize3rd, color: "text-amber-700" },
            ].map(({ rank, label, prize, color }) => (
              <div key={rank} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black w-5 ${color}`}>{rank}</span>
                  <span className="text-base text-gray-600">{label}</span>
                </div>
                <span className="text-base font-bold text-[#1e3a8a]">{fmt(prize)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

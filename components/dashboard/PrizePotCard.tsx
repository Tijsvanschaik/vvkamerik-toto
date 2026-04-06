"use client";

interface PrizePotCardProps {
  participantCount: number;
  totalPot: number;
  clubShare: number;
  prize1st: number;
  prize2nd: number;
  prize3rd: number;
}

export default function PrizePotCard({
  participantCount,
  totalPot,
  clubShare,
  prize1st,
  prize2nd,
  prize3rd,
}: PrizePotCardProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

  const rows = [
    { label: "Aantal Deelnemers", value: participantCount.toString(), accent: false },
    { label: "Prijspot", value: fmt(totalPot), accent: true },
    { label: "Clubkas", value: fmt(clubShare), accent: true },
    { label: "🥇 1e plaats", value: fmt(prize1st), accent: true },
    { label: "🥈 2e plaats", value: fmt(prize2nd), accent: true },
    { label: "🥉 3e plaats", value: fmt(prize3rd), accent: true },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#2e7d32] px-5 py-4 flex items-center gap-2">
        <span className="text-xl">💰</span>
        <h2 className="text-white font-bold text-lg tracking-wide">Prijzenpot</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-gray-700">{row.label}</span>
            <span className={`text-sm font-bold ${row.accent ? "text-[#2e7d32]" : "text-gray-900"}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

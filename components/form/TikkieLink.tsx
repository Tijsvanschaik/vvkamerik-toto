"use client";

interface TikkieLinkProps {
  url: string;
}

export default function TikkieLink({ url }: TikkieLinkProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
      <p className="text-sm text-blue-800 mb-2">
        Liever betalen via Tikkie?
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2d4fa8] transition-colors text-sm"
      >
        Betaal via Tikkie
      </a>
    </div>
  );
}

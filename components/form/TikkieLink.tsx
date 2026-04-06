"use client";

interface TikkieLinkProps {
  url: string;
}

export default function TikkieLink({ url }: TikkieLinkProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
      <p className="text-sm text-green-800 mb-2">
        Liever betalen via Tikkie?
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
      >
        Betaal via Tikkie
      </a>
    </div>
  );
}

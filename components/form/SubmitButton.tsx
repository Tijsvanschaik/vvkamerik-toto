"use client";

interface SubmitButtonProps {
  loading: boolean;
  entryFee: number;
}

export default function SubmitButton({ loading, entryFee }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary text-white py-4 px-6 rounded-2xl text-lg font-bold hover:bg-primary-light transition-colors disabled:opacity-50 shadow-lg"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          Bezig met verwerken...
        </span>
      ) : (
        `Verstuur & Betaal (€${entryFee.toFixed(2)})`
      )}
    </button>
  );
}

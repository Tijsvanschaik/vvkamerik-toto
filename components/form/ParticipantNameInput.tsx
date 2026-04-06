"use client";

interface ParticipantNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function ParticipantNameInput({
  value,
  onChange,
  error,
}: ParticipantNameInputProps) {
  return (
    <div>
      <label htmlFor="participant-name" className="block text-sm font-medium text-gray-700 mb-1">
        Jouw naam
      </label>
      <input
        id="participant-name"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
        placeholder="Vul je naam in"
        required
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

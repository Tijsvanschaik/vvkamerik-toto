"use client";

interface ParticipantNameInputProps {
  firstName: string;
  lastName: string;
  email: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  errors: Record<string, string>;
}

export default function ParticipantNameInput({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  errors,
}: ParticipantNameInputProps) {
  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
      errors[field] ? "border-red-300 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voornaam <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className={inputClass("first_name")}
            placeholder="Jan"
            autoComplete="given-name"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Achternaam <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className={inputClass("last_name")}
            placeholder="de Vries"
            autoComplete="family-name"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-mailadres <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={inputClass("email")}
          placeholder="jan@example.nl"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Alleen gebruikt om je te contacteren als je gewonnen hebt.
        </p>
      </div>
    </div>
  );
}

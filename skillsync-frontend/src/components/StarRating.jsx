export default function StarRating({
  value = 0,
  count = 0,
  interactive = false,
  onChange,
  size = "sm",
  showCount = true,
}) {
  const roundedValue = Number(value) || 0;
  const sizeClass = size === "lg" ? "text-2xl" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-0.5 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= Math.round(roundedValue);
          const className = active ? "text-amber-400" : "text-gray-300";

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange?.(star)}
                className={`${className} leading-none transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300 rounded`}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            );
          }

          return (
            <span key={star} className={`${className} leading-none`}>
              ★
            </span>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs font-medium text-gray-500">
          {count > 0 ? `${roundedValue.toFixed(1)} (${count})` : "No ratings yet"}
        </span>
      )}
    </div>
  );
}

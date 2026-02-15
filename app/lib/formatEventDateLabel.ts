type EventDateLike = {
  starts_at?: string | null;
  schedule_type?: "datetime" | "date_range" | "undated" | null;
  starts_on?: string | null;
  ends_on?: string | null;
  date_label?: string | null;
};

function formatDateOnly(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatEventDateLabel(event: EventDateLike): string {
  if (event.date_label && event.date_label.trim()) {
    return event.date_label.trim();
  }

  if (event.schedule_type === "date_range") {
    if (event.starts_on && event.ends_on) {
      return `${formatDateOnly(event.starts_on)} - ${formatDateOnly(event.ends_on)}`;
    }
    if (event.starts_on) {
      return `${formatDateOnly(event.starts_on)}-tol`;
    }
  }

  if (event.schedule_type === "undated") {
    return "Idopont hamarosan";
  }

  if (event.starts_at) {
    return formatDateTime(event.starts_at);
  }

  return "Idopont hamarosan";
}


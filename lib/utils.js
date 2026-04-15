export const IDEA_LIMITS = {
  title: 100,
  description: 400,
};

export function getTimestampLabel(timestamp) {
  if (!timestamp) {
    return "Just now";
  }

  const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absoluteSeconds = Math.abs(seconds);

  if (absoluteSeconds < 45) {
    return "Just now";
  }

  const ranges = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const range of ranges) {
    if (absoluteSeconds >= range.seconds) {
      return formatter.format(Math.round(seconds / range.seconds), range.unit);
    }
  }

  return "Just now";
}

export function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

export function buildMessageCountMap(messages) {
  return messages.reduce((accumulator, entry) => {
    accumulator[entry.ideaId] = (accumulator[entry.ideaId] || 0) + 1;
    return accumulator;
  }, {});
}

export function filterIdeas(ideas, searchTerm, selectedFilter) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return ideas.filter((idea) => {
    const matchesSearch =
      !normalizedSearch ||
      [idea.title, idea.description, idea.problem]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));

    const replyCount = idea.replyCount || 0;
    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Active" && replyCount > 0) ||
      (selectedFilter === "Quiet" && replyCount === 0);

    return matchesSearch && matchesFilter;
  });
}

export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

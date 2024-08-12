export function capitalizeText(characters: string) {
  return characters.charAt(0).toUpperCase() + characters.slice(1).toLowerCase();
}

export function statusColor(status: string) {
  switch (status) {
    case "Open":
      return "#4CAF50"; // soft green
    case "Repairing":
      return "#FF9800"; // warm orange
    case "Completed":
      return "#2196F3"; // calm blue
    default:
      return "";
  }
}

export function priorityColor(priority: string) {
  switch (priority) {
    case "Low":
      return "#77e33d"; // light green
    case "Moderate":
      return "#FFC107"; // yellow
    case "Urgent":
      return "#F44336"; // red
    default:
      return "";
  }
}

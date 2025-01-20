export function capitalizeText(characters: string) {
  return characters.charAt(0).toUpperCase() + characters.slice(1).toLowerCase();
}

export function statusColor(status: string) {
  switch (status) {
    case "Ativo":
      return "#4CAF50"; // soft green
    case "Reparando":
      return "#FF9800"; // warm orange
    case "Resolvido":
      return "#2196F3"; // calm blue
    default:
      return "";
  }
}

export function priorityColor(priority: string) {
  switch (priority) {
    case "168h":
      return "#77e33d"; // light green
    case "72h":
      return "#FFC107"; // yelBaixa
    case "24h":
      return "#F44336"; // red
    default:
      return "";
  }
}

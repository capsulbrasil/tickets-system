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
    case "Baixa":
      return "#77e33d"; // light green
    case "Moderada":
      return "#FFC107"; // yelBaixa
    case "Urgente":
      return "#F44336"; // red
    default:
      return "";
  }
}

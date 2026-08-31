export const rotina = [
  { inicio: "05:45", fim: "07:20", nome: "Acordar" },
  { inicio: "07:20", fim: "12:10", nome: "Escola" },
  { inicio: "12:10", fim: "13:30", nome: "Almoço + descanso" },
  { inicio: "13:30", fim: "14:30", nome: "Estudos" },
  { inicio: "14:30", fim: "15:30", nome: "Projeto + lanche" },
  { inicio: "15:30", fim: "16:00", nome: "Se arrumar" },
  { inicio: "16:00", fim: "18:00", nome: "Academia + cardio" },
  { inicio: "18:00", fim: "19:30", nome: "Banho + comida + descanso" },
  { inicio: "19:30", fim: "21:30", nome: "Projeto / lazer" },
  { inicio: "21:30", fim: "22:30", nome: "Relaxar" },
  { inicio: "22:30", fim: "24:00", nome: "Dormir" }
];

export function ehFimDeSemana(data = new Date()) {
  const dia = data.getDay();
  return dia === 0 || dia === 6;
}

export function converterMinutos(horario) {
  const [hora, minuto] = horario.split(":").map(Number);
  return hora * 60 + minuto;
}

export function atividadeAtual(data = new Date()) {
  if (ehFimDeSemana(data)) return -1;

  const minutos = data.getHours() * 60 + data.getMinutes();

  for (let i = 0; i < rotina.length; i++) {
    const inicio = converterMinutos(rotina[i].inicio);
    const fim = converterMinutos(rotina[i].fim);
    if (minutos >= inicio && minutos < fim) return i;
  }

  return -1;
}

/* Frases das notificações*/
export const mensagens = {
  "Acordar": "Bom dia! Levanta que o dia começa agora ☀️",
  "Escola": "Hora da escola. Foco e vai com tudo.",
  "Almoço + descanso": "Hora de almoçar e recarregar as energias.",
  "Estudos": "Hora de estudar. 1h de foco total, você consegue.",
  "Projeto + lanche": "Pausa pro lanche, depois é hora do projeto.",
  "Se arrumar": "Bora se arrumar, a academia te espera.",
  "Academia + cardio": "Hora do treino! Bora suar a camisa 💪",
  "Banho + comida + descanso": "Banho, comida e descanso — você mereceu.",
  "Projeto / lazer": "Hora do projeto ou de relaxar um pouco, escolha sua.",
  "Relaxar": "Desacelera. Faltam só 30 minutinhos pra dormir.",
  "Dormir": "Hora de dormir. Amanhã tem mais 🌙"
};

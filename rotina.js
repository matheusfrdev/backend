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

/* Frases das notificações (Etapa 9 do plano original) */
export const mensagens = {
  "Acordar": "Bom dia! Hora de acordar.",
  "Estudos": "Hora dos estudos.",
  "Projeto + lanche": "Hora do projeto + lanche.",
  "Academia + cardio": "Hora da academia + cardio.",
  "Projeto / lazer": "Hora do projeto / lazer.",
  "Relaxar": "Hora de relaxar.",
  "Dormir": "Hora de dormir."
};

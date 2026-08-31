import "dotenv/config";
import express from "express";
import cors from "cors";
import webpush from "web-push";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { rotina, atividadeAtual, mensagens } from "./rotina.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

/* ==================================================
   WEB PUSH / VAPID
================================================== */

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:seuemail@exemplo.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn(
    "[WARN] Chaves VAPID não configuradas. Web Push não vai funcionar até você gerar e colocar no .env"
  );
}

/* Guarda as inscrições de push em memória.
   Simples de propósito — reinicia zerado quando o servidor reinicia.
   Se quiser persistência, dá pra trocar por um arquivo JSON depois. */
const inscricoes = new Map();

/* Rota simples só pra responder "ok" quando o UptimeRobot (ou qualquer coisa)
   fizer ping na raiz do site, mantendo o servidor acordado no Render. */
app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  inscricoes.set(subscription.endpoint, subscription);
  console.log(`[PUSH] Nova inscrição. Total: ${inscricoes.size}`);
  res.status(201).json({ ok: true });
});

app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  inscricoes.delete(endpoint);
  res.status(200).json({ ok: true });
});

/* Rota só de teste: dispara uma notificação na hora, sem esperar o horário real.
   Protegida por uma senha simples (TEST_SECRET no .env), pra só você poder usar. */
app.post("/test-notification", async (req, res) => {
  const senhaEnviada = req.headers["x-test-secret"];

  if (senhaEnviada !== process.env.TEST_SECRET) {
    return res.status(401).json({ ok: false, erro: "Senha incorreta." });
  }

  await enviarPush("Rotina", "se você recebeu isso, o push está funcionando!");
  res.json({ ok: true, inscricoesNotificadas: inscricoes.size });
});

async function enviarPush(titulo, corpo) {
  const payload = JSON.stringify({ title: titulo, body: corpo });

  for (const [endpoint, subscription] of inscricoes) {
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (erro) {
      console.error(`[PUSH] Falha ao enviar, removendo inscrição: ${erro.statusCode}`);
      inscricoes.delete(endpoint);
    }
  }
}

/* ==================================================
   WEBSOCKET
================================================== */

const clientes = new Set();

wss.on("connection", (socket) => {
  clientes.add(socket);
  console.log(`[WS] Cliente conectado. Total: ${clientes.size}`);

  socket.on("close", () => {
    clientes.delete(socket);
    console.log(`[WS] Cliente desconectado. Total: ${clientes.size}`);
  });
});

function transmitir(evento) {
  const mensagem = JSON.stringify(evento);
  clientes.forEach((socket) => {
    if (socket.readyState === socket.OPEN) {
      socket.send(mensagem);
    }
  });
}

/* ==================================================
   RELÓGIO DA ROTINA
================================================== */

let ultimaAtividadeIndex = null;

async function checarRotina() {
  const indexAtual = atividadeAtual();

  if (indexAtual === ultimaAtividadeIndex) return;
  ultimaAtividadeIndex = indexAtual;

  if (indexAtual === -1) return;

  const atividade = rotina[indexAtual];
  console.log(`[ROTINA] Nova atividade: ${atividade.nome}`);

  transmitir({
    type: "routine_update",
    activity: atividade.nome,
    start: atividade.inicio,
    end: atividade.fim
  });

  const textoNotificacao = mensagens[atividade.nome];
  if (textoNotificacao) {
    await enviarPush("Minha rotina", textoNotificacao);
  }
}

setInterval(checarRotina, 30 * 1000);

/* ==================================================
   INICIALIZAÇÃO
================================================== */

const PORTA = process.env.PORT || 3000;
httpServer.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});

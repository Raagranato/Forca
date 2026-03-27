const { LiveChat } = require("youtube-chat");
const WebSocket = require("ws");

// Cria o servidor invisível (WebSocket) na porta 8080
const wss = new WebSocket.Server({ port: 8080 });
let clients = [];

wss.on("connection", (ws) => {
    console.log("🟢 Jogo da Forca conectou ao bot!");
    clients.push(ws);
    ws.on("close", () => { clients = clients.filter(c => c !== ws); });
});

// Pega o ID da live que você vai digitar no terminal
const liveId = process.argv[2];
if (!liveId) {
    console.log("❌ Erro: Você esqueceu de passar o ID da live!");
    console.log("👉 Exemplo de uso: node yt-bot.js dQw4w9WgXcQ");
    process.exit(1);
}

// Conecta no chat do YouTube
const liveChat = new LiveChat({ liveId: liveId, interval: 500 });

liveChat.on("start", (id) => {
    console.log(`📡 Conectado com sucesso ao chat da live: ${id}`);
});

liveChat.on("chat", (chatItem) => {
    // Junta o texto da mensagem e deixa tudo em maiúsculo
    const mensagem = chatItem.message.map(m => m.text).join("").trim().toUpperCase();
    const autor = chatItem.author.name;

    // Filtro: A mensagem tem exatamente 1 caractere e é uma letra de A a Z?
    if (mensagem.length === 1 && /[A-Z]/.test(mensagem)) {
        console.log(`💬 Voto válido: [${autor}] votou na letra ${mensagem}`);
        
        // Dispara a letra para o navegador (seu index.html no OBS)
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ autor: autor, letra: mensagem }));
            }
        });
    }
});

liveChat.on("error", (err) => {
    console.log("⚠️ Pequeno erro de conexão (tentando novamente):", err.message);
});

liveChat.start()
    .then(() => console.log("🚀 Bot iniciado! Aguardando mensagens do chat..."))
    .catch(err => console.log("❌ Falha ao iniciar:", err.message));
/*TODO: - !w -> full word guess
- !l -> letter guess
- Connect YouTube Live Chat API
*/

var TEMPO_VOTACAO = 15;
var TEMPO_ENTRE_ROUNDS = 5;
var TEMPO_RESULTADO = 2; // segundos mostrando o resultado antes de continuar

var jogo = {
    palavra: "",
    segredo: [],
    tentadas: new Set(),
    erros: 0,
    loopJogo: true,
    votos: new Map(),

    iniciar: function () {
        this.segredo = new Array(this.palavra.length).fill("_");
        this.tentadas.clear();
        this.votos.clear();
        this.erros = 0;
        this.loopJogo = true;
        document.getElementById("mensagem").innerHTML = "";
        document.getElementById("vote-bars").innerHTML = "";
        this.resetarCoracoes();
        atualizarTela();
    },

    resetarCoracoes: function () {
        document.querySelectorAll('.coracao').forEach(c => c.classList.remove('perdido'));
    },

    chuteLetra: function (char, jogador) {
        if (this.tentadas.has(char)) return;

        if (!this.palavra.includes(char)) {
            this.erros++;
            this.tentadas.add(char);
            if (this.erros >= 6) {
                this.loopJogo = false;
                document.getElementById("mensagem").innerHTML = "GAME OVER! WORD WAS: " + this.palavra;
            }
        } else {
            this.tentadas.add(char);
            this.atualizaPalavra(char, jogador);
        }
    },

    atualizaPalavra: function (char, jogador) {
        for (let i = 0; i < this.segredo.length; i++) {
            if (char == this.palavra[i]) this.segredo[i] = char;
        }
        if (this.segredo.join("") == this.palavra) {
            this.loopJogo = false;
            document.getElementById("mensagem").innerHTML = jogador + " FOUND THE WORD!";
            leaderboard.registrarVitoria(jogador);
        }
    },

    chutePalavra: function (chute, jogador) {
        if (this.palavra == chute.toUpperCase()) {
            this.loopJogo = false;
            document.getElementById("mensagem").innerHTML = jogador + " FOUND THE WORD!";
            leaderboard.registrarVitoria(jogador);
        }
    },

    registrarVoto: function (letra) {
        letra = letra.trim().toUpperCase();
        if (letra.length !== 1 || !/[A-Z]/.test(letra)) return;
        this.votos.set(letra, (this.votos.get(letra) || 0) + 1);
        atualizarBarras(); // atualiza visual em tempo real
    },

    letraVencedora: function () {
        let melhorLetra = null;
        let melhorContagem = 0;
        for (let [letra, contagem] of this.votos.entries()) {
            if (contagem > melhorContagem) {
                melhorContagem = contagem;
                melhorLetra = letra;
            }
        }
        this.votos.clear();
        return melhorLetra;
    }
}

// ── Palavra aleatória ────────────────────────────────────────

var palavrasFallback = [
    "ELEPHANT", "BANANA", "JAVASCRIPT", "KEYBOARD", "MONITOR",
    "PENGUIN", "VOLCANO", "RAINBOW", "DIAMOND", "BICYCLE",
    "UMBRELLA", "GUITAR", "DOLPHIN", "PYRAMID", "CACTUS"
];

async function buscarPalavra() {
    setChatStatus("LOADING WORD...");
    try {
        var resposta = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        var dados = await resposta.json();
        var palavra = dados[0].toUpperCase();
        if (palavra.length >= 4 && palavra.length <= 12 && /^[A-Z]+$/.test(palavra)) {
            return palavra;
        }
        return await buscarPalavra();
    } catch (e) {
        var idx = Math.floor(Math.random() * palavrasFallback.length);
        return palavrasFallback[idx];
    }
}

// ── Tela ─────────────────────────────────────────────────────

function atualizarTela() {
    document.getElementById("segredo").innerHTML = jogo.segredo.join(" ");
    ajustarFonteSegredo();

    document.querySelectorAll('.coracao').forEach((c, i) => {
        c.classList.toggle('perdido', i < jogo.erros);
    });

    var tentadasArr = Array.from(jogo.tentadas);
    document.getElementById("letras-usadas").innerHTML =
        tentadasArr.length > 0 ? tentadasArr.join("  ") : "—";
}

function setChatStatus(texto) {
    document.getElementById("chat-status-text").innerHTML = texto;
}

function setCountdown(texto) {
    document.getElementById("countdown").innerHTML = texto;
}

// Atualiza as barras de votos em tempo real
function atualizarBarras() {
    var container = document.getElementById("vote-bars");
    if (jogo.votos.size === 0) { container.innerHTML = ""; return; }

    // Ordena por contagem decrescente, mostra top 8
    var sorted = [...jogo.votos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    var maxVotos = sorted[0][1];

    container.innerHTML = sorted.map(([letra, count], idx) => {
        var altura = Math.max(4, Math.round((count / maxVotos) * 100));
        var lider = idx === 0 ? "leader" : "";
        return `
            <div class="vote-bar-wrap ${lider}">
                <div class="vote-bar-count">${count}</div>
                <div class="vote-bar" style="height:${altura}%"></div>
                <div class="vote-bar-letter">${letra}</div>
            </div>`;
    }).join("");
}

// Flash de resultado antes de chutar
function mostrarResultado(letra) {
    return new Promise((resolve) => {
        var flash = document.getElementById("result-flash");
        document.getElementById("result-letter").innerHTML = letra;
        flash.classList.add("show");
        setTimeout(() => {
            flash.classList.remove("show");
            resolve();
        }, TEMPO_RESULTADO * 1000);
    });
}

// ── Timers ───────────────────────────────────────────────────

function rodadaVotacao() {
    return new Promise((resolve) => {
        var segundos = TEMPO_VOTACAO;
        setChatStatus("VOTE — SEND A LETTER IN CHAT!");
        setCountdown(segundos + "S");

        var tick = setInterval(() => {
            segundos--;
            setCountdown(segundos + "S");
            if (segundos <= 0) {
                clearInterval(tick);
                resolve();
            }
        }, 1000);
    });
}

function countdownEntreRounds() {
    return new Promise((resolve) => {
        var segundos = TEMPO_ENTRE_ROUNDS;
        setCountdown("NEXT ROUND IN " + segundos + "S...");
        setChatStatus("GET READY!");

        var tick = setInterval(() => {
            segundos--;
            setCountdown("NEXT ROUND IN " + segundos + "S...");
            if (segundos <= 0) {
                clearInterval(tick);
                setCountdown("");
                resolve();
            }
        }, 1000);
    });
}

// ── Loop principal ───────────────────────────────────────────

async function loopPrincipal() {
    while (true) {
        jogo.palavra = await buscarPalavra();
        jogo.iniciar();
        setChatStatus("WAITING FOR CHAT...");

        while (jogo.loopJogo) {
            await rodadaVotacao();
            if (!jogo.loopJogo) break;

            var vencedora = jogo.letraVencedora();
            document.getElementById("vote-bars").innerHTML = "";

            if (vencedora) {
                await mostrarResultado(vencedora);
                jogo.chuteLetra(vencedora, "Chat"); // trocar pelo nome do YT depois
                atualizarTela();
            } else {
                setChatStatus("NO VOTES — SKIPPING...");
                await new Promise(r => setTimeout(r, 1500));
            }
        }

        setChatStatus("ROUND OVER!");
        await countdownEntreRounds();
    }
}

loopPrincipal();

// ── Conexão com o Bot do YouTube (WebSocket) ─────────────────
var ws = new WebSocket("ws://localhost:8080");

ws.onopen = function() {
    console.log("🔌 Conectado ao servidor do chat!");
};

ws.onmessage = function(event) {
    var dados = JSON.parse(event.data);
    var letra = dados.letra;
    var jogador = dados.autor;

    // Se o jogo está rodando e a letra ainda não foi tentada, registra o voto!
    if (jogo.loopJogo && !jogo.tentadas.has(letra)) {
        // Usa o map 'votos' que já existe no seu código para a democracia funcionar
        jogo.registrarVoto(letra);
        console.log(jogador + " VOTED FOR " + letra);
    }
};

ws.onclose = function() {
    console.log("❌ Desconectado do servidor do chat.");
};
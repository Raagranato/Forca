/*TODO: - !w -> full word guess
- !l -> letter guess
- Connect YouTube Live Chat API
*/

var TEMPO_VOTACAO = 15;   // segundos por rodada
var TEMPO_ENTRE_ROUNDS = 5; // segundos entre rounds

var jogo = {
    palavra: "chuchu".toUpperCase(),
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
        this.resetarCoracoes();
        atualizarTela();
    },

    resetarCoracoes: function () {
        document.querySelectorAll('.coracao').forEach(c => c.classList.remove('perdido'));
    },

    zeraSet: function () {
        this.tentadas.clear();
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
            if (char == this.palavra[i]) {
                this.segredo[i] = char;
            }
        }
        if (this.segredo.join("") == this.palavra) {
            this.loopJogo = false;
            document.getElementById("mensagem").innerHTML = jogador + " FOUND THE WORD!";
            // leaderboard.registrarVitoria(jogador);
        }
    },

    chutePalavra: function (chute, jogador) {
        if (this.palavra == chute.toUpperCase()) {
            this.loopJogo = false;
            document.getElementById("mensagem").innerHTML = jogador + " FOUND THE WORD!";
            // leaderboard.registrarVitoria(jogador);
        }
    },

    registrarVoto: function (mensagem) {
        var letra = mensagem.trim().toUpperCase();
        if (letra.length !== 1 || !/[A-ZÀ-Ú]/.test(letra)) return;
        if (this.votos.has(letra)) {
            this.votos.set(letra, this.votos.get(letra) + 1);
        } else {
            this.votos.set(letra, 1);
        }
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

// ── Loop principal ──────────────────────────────────────────

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

// Roda uma rodada de votação e retorna uma Promise que resolve quando o tempo acabar
function rodadaVotacao() {
    return new Promise((resolve) => {
        var segundos = TEMPO_VOTACAO;
        setChatStatus("VOTING OPEN — SEND A LETTER!");
        setCountdown("VOTING: " + segundos + "S");

        var tick = setInterval(() => {
            segundos--;
            setCountdown("VOTING: " + segundos + "S");
            if (segundos <= 0) {
                clearInterval(tick);
                resolve();
            }
        }, 1000);
    });
}

// Countdown entre rounds
function countdownEntreRounds() {
    return new Promise((resolve) => {
        var segundos = TEMPO_ENTRE_ROUNDS;
        setCountdown("NEXT ROUND IN " + segundos + "S...");

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

// Loop principal — roda indefinidamente até fechar a aba
async function loopPrincipal() {
    while (true) {
        // Escolhe palavra (por enquanto fixa, depois vira aleatória)
        jogo.palavra = "chuchu".toUpperCase();
        jogo.iniciar();
        setChatStatus("WAITING FOR CHAT...");

        // Fica rodando rodadas enquanto o jogo estiver ativo
        while (jogo.loopJogo) {
            await rodadaVotacao();

            if (!jogo.loopJogo) break;

            // Pega a letra mais votada e chuta
            var vencedora = jogo.letraVencedora();
            if (vencedora) {
                setChatStatus("VOTING RESULT: " + vencedora);
                // Por enquanto usa "Chat" como jogador — depois vem do YT
                jogo.chuteLetra(vencedora, "Chat");
                atualizarTela();
            } else {
                setChatStatus("NO VOTES — SKIPPING...");
            }
        }

        // Round acabou — espera antes do próximo
        setChatStatus("ROUND OVER!");
        await countdownEntreRounds();
    }
}

// Inicia
jogo.iniciar();
loopPrincipal();
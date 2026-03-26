/*TODO: - If chat guesses the full word they win instantly
- Leaderboard for top winners
- !w -> word guess
- !l -> letter guess
*/

var jogo = {
    palavra: "chuchu".toUpperCase(),
    segredo: [],
    tentadas: new Set(),
    erros: 0,
    loopJogo: true,
    votos: new Map(),

    iniciar: function () {
        this.segredo = new Array(this.palavra.length).fill("_");
    },

    zeraSet: function () {
        this.tentadas.clear();
    },

    chuteLetra: function (char, jogador) {
        if (this.tentadas.has(char)) return;

        if (this.palavra.includes(char) == false) {
            this.erros++;
            this.tentadas.add(char);
            if (this.erros >= 6) {
                this.loopJogo = false;
                document.getElementById("mensagem").innerHTML = "GAME OVER! WORD WAS: " + this.palavra;
                this.bloquearInput();
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
            document.getElementById("mensagem").innerHTML = jogador + " FOUND THE WORD!";
            this.loopJogo = false;
            this.bloquearInput();
            // leaderboard.registrarVitoria(jogador);
        }
    },

    chutePalavra: function (chute, jogador) {
        if (this.palavra == chute.toUpperCase()) {
            document.getElementById("mensagem").innerHTML = jogador + " FOUND THE WORD!";
            this.loopJogo = false;
            this.bloquearInput();
            // leaderboard.registrarVitoria(jogador);
        }
    },

    bloquearInput: function () {
        document.getElementById("entrada").disabled = true;
        document.querySelector("button").disabled = true;
    },

    registrarVoto: function (mensagem) {
        var letra = mensagem.trim().toUpperCase();
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

jogo.iniciar();
atualizarTela();

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

function chutar() {
    var entrada = document.getElementById("entrada").value;
    if (!/^[a-zA-ZÀ-ú]$/.test(entrada)) return;
    jogo.chuteLetra(entrada.trim().toUpperCase(), "Player 1"); // trocar pelo nome do YT depois
    atualizarTela();
    document.getElementById("entrada").value = "";
}
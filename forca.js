/*TODO: -Se o cara do chat digitar a palavra inteira ele ganha altomaticamente independente de tudo
-Leaderboard dos ganhadores supremos
-limitar a aceitar somente letras
-!w ->word
-!l  -> letter
*/
//const readline = require('readline');
//const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

var jogo = {

    palavra: "chuchu".toUpperCase(),
    segredo: [],
    tentadas: new Set(),
    erros: 0,
    loopJogo: true,
    votos: new Map(),

    iniciar: function () {
        this.segredo = new Array(this.palavra.length).fill("*");
    },

    zeraSet: function () {
        this.tentadas.clear();
    },

    chuteLetra: function (char) {
        if (this.tentadas.has(char)) {
            console.log("Letra ja usada!");
        }
        else if (this.palavra.includes(char) == false) {
            console.log("Palavra possui nao tem a letra: " + char);
            this.erros++;
            this.tentadas.add(char);
            if (this.erros >= 6) {
                console.log("Fim de Jogo!!")
                this.loopJogo = false;
                //rl.close();
            }
        }
        else {
            console.log("Palavra possui a letra: " + char);
            this.tentadas.add(char);
            this.atualizaPalavra(char);

        }
    },

    atualizaPalavra: function (char) {
        for (let i = 0; i < this.segredo.length; i++) {
            if (char == this.palavra[i]) {
                this.segredo[i] = char;
            }
        }
        if (this.segredo.join("") == this.palavra) {
            document.getElementById("mensagem").innerHTML = "Palavra descoberta!";//html
            //console.log("Palavra descoberta!");//terminal
            leaderboard.registrarVitoria("NomeDoJogador");
            this.loopJogo = false;
            //rl.close();
        }
    },
    chutePalavra: function (chute) {
        if (this.palavra == chute) {
            document.getElementById("mensagem").innerHTML = "Fim de Jogo!! A palavra era: " + this.palavra;
            //console.log("Jogador x acertou a palavra!!");//terminal
            this.loopJogo = false;
            //rl.close();
        }

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
        for (let [letra, contagem] of this.votos.entries()) {//acessa a estruttra e conta qual foi a mais repetida
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

document.getElementById("segredo").innerHTML = jogo.segredo.join(" ")

function chutar() {

    var entrada = document.getElementById("entrada").value;
    if (!/^[a-zA-ZÀ-ú]$/.test(entrada)) {//valida se a entrada de letra é so letras msm
    return;
}
    
    jogo.chuteLetra(entrada.trim().toUpperCase());
    document.getElementById("segredo").innerHTML = jogo.segredo.join(" ");
    document.getElementById("info").innerHTML =
        "Erros: " + jogo.erros + "/6 <br> Letras tentadas: " + Array.from(jogo.tentadas).join(", ");
    document.getElementById("entrada").value = "";//limpa a entrada
    if (!jogo.loopJogo) {
    document.getElementById("entrada").disabled = true;
    document.getElementById("entrada").querySelector("button").disabled = true;
}
}





//Funcoes pra funcionar no terminal
// function pergunta() {
//     //rl.question("Digite: ", (entrada) => {
//         jogo.chuteLetra(entrada.trim().toUpperCase());
//         console.log(jogo.segredo);
//         if (jogo.loopJogo)
//             pergunta();
//     //});
// }

// pergunta();

var ARQUIVO = 'leaderboard_forca';

var leaderboard = {
    dados: {
        geral: [],
        dia: {}
    },

    carregar: function () {
        var salvo = localStorage.getItem(ARQUIVO);
        if (salvo) {
            this.dados = JSON.parse(salvo);
        }
    },

    salvar: function () {
        localStorage.setItem(ARQUIVO, JSON.stringify(this.dados));
    },

    hoje: function () {
        return new Date().toISOString().split('T')[0];
    },

    registrarVitoria: function (nome) {
        // --- Leaderboard Geral ---
        var jogador = this.dados.geral.find(j => j.nome === nome);
        if (jogador) {
            jogador.vitorias++;
        } else {
            this.dados.geral.push({ nome: nome, vitorias: 1 });
        }
        this.dados.geral.sort((a, b) => b.vitorias - a.vitorias);
        this.dados.geral = this.dados.geral.slice(0, 3);

        // --- Leaderboard do Dia ---
        var dia = this.hoje();
        if (!this.dados.dia[dia]) {
            this.dados.dia[dia] = [];
        }
        var jogadorDia = this.dados.dia[dia].find(j => j.nome === nome);
        if (jogadorDia) {
            jogadorDia.vitorias++;
        } else {
            this.dados.dia[dia].push({ nome: nome, vitorias: 1 });
        }
        this.dados.dia[dia].sort((a, b) => b.vitorias - a.vitorias);
        this.dados.dia[dia] = this.dados.dia[dia].slice(0, 3);

        this.salvar();
        this.atualizar();
    },

    atualizar: function () {
        var dia = this.hoje();
        var topDia = this.dados.dia[dia] || [];
        var topGeral = this.dados.geral;

        var htmlDia = "";
        if (topDia.length === 0) {
            htmlDia = "<div class='lb-entry vazio'>NO WINNERS...YET</div>";
        } else {
            topDia.forEach((j, i) => {
                var classe = i === 0 ? "primeiro" : "";
                htmlDia += `<div class='lb-entry ${classe}'><span class='nome'>${i + 1}. ${j.nome}</span><span>${j.vitorias}</span></div>`;
            });
        }
        document.getElementById("lb-dia").innerHTML = htmlDia;

        var htmlGeral = "";
        if (topGeral.length === 0) {
            htmlGeral = "<div class='lb-entry vazio'>NO WINNERS...YET</div>";
        } else {
            topGeral.forEach((j, i) => {
                var classe = i === 0 ? "primeiro" : "";
                htmlGeral += `<div class='lb-entry ${classe}'><span class='nome'>${i + 1}. ${j.nome}</span><span>${j.vitorias}</span></div>`;
            });
        }
        document.getElementById("lb-geral").innerHTML = htmlGeral;
    }
}

leaderboard.carregar();
leaderboard.atualizar();
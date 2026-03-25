// leaderboard.js
// Requer Electron para funcionar (usa o modulo fs do Node.js)
// No navegador puro isso nao funciona - so vai funcionar dentro do Electron

// Acessa o fs do Node.js via Electron
const fs = require('fs');
const ARQUIVO = 'leaderboard.json';

var leaderboard = {

    dados: {
        geral: [],  // [{nome, vitorias}]
        dia: {}     // {"2026-03-25": [{nome, vitorias}]}
    },

    // Carrega o arquivo ao iniciar
    carregar: function () {
        try {
            if (fs.existsSync(ARQUIVO)) {
                const conteudo = fs.readFileSync(ARQUIVO, 'utf-8');
                this.dados = JSON.parse(conteudo);
            }
        } catch (e) {
            console.log("Erro ao carregar leaderboard: " + e);
        }
    },

    // Salva no arquivo
    salvar: function () {
        try {
            fs.writeFileSync(ARQUIVO, JSON.stringify(this.dados, null, 2));
        } catch (e) {
            console.log("Erro ao salvar leaderboard: " + e);
        }
    },

    // Retorna a data de hoje no formato "YYYY-MM-DD"
    hoje: function () {
        return new Date().toISOString().split('T')[0];
    },

    // Registra uma vitoria para um jogador
    registrarVitoria: function (nome) {
        // --- Leaderboard Geral ---
        var jogador = this.dados.geral.find(j => j.nome === nome);
        if (jogador) {
            jogador.vitorias++;
        } else {
            this.dados.geral.push({ nome: nome, vitorias: 1 });
        }
        // Ordena e mantém só os top 3
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

    // Atualiza o HTML do leaderboard
    atualizar: function () {
        var dia = this.hoje();
        var topDia = this.dados.dia[dia] || [];
        var topGeral = this.dados.geral;

        var html = "<h3>🏆 Top 3 do Dia</h3>";
        if (topDia.length === 0) {
            html += "<p>Ninguem venceu hoje ainda!</p>";
        } else {
            topDia.forEach((j, i) => {
                html += `<p>${i + 1}º ${j.nome} - ${j.vitorias} vitória(s)</p>`;
            });
        }

        html += "<h3>🌟 Top 3 Geral</h3>";
        if (topGeral.length === 0) {
            html += "<p>Leaderboard vazio!</p>";
        } else {
            topGeral.forEach((j, i) => {
                html += `<p>${i + 1}º ${j.nome} - ${j.vitorias} vitória(s)</p>`;
            });
        }

        document.getElementById("leaderboard").innerHTML = html;
    }
}

leaderboard.carregar();
leaderboard.atualizar();

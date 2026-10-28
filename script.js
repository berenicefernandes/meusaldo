
// 1. Encontrar os elementos da página
const formulario = document.getElementById("formulario");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const data = document.getElementById("data");
const filtroMes = document.getElementById("filtro-mes");
const limparFiltro = document.getElementById("limpar-filtro");

const saldoTela = document.getElementById("saldo");
const entradasTela = document.getElementById("entradas");
const despesasTela = document.getElementById("despesas");
const lista = document.getElementById("lista-movimentacoes");

// 2. Carregar os dados salvos no navegador
let movimentacoes = JSON.parse(
    localStorage.getItem("meusaldo-movimentacoes") || "[]"
);

// 3. Colocar a data de hoje no formulário
const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

data.value = `${ano}-${mes}-${dia}`;

// 4. Formatar os valores como dinheiro brasileiro
function formatarDinheiro(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// 5. Salvar as movimentações no navegador
function salvarDados() {
    localStorage.setItem(
        "meusaldo-movimentacoes",
        JSON.stringify(movimentacoes)
    );
}

// 6. Atualizar os totais e a lista na tela
function atualizarTela() {
    let totalEntradas = 0;
    let totalDespesas = 0;
    
const mesSelecionado = filtroMes.value;

const movimentacoesVisiveis = movimentacoes.filter(
    function (movimentacao) {
        return (
            mesSelecionado === "" ||
            movimentacao.data.startsWith(mesSelecionado)
        );
    }
);


    // Somar as receitas e as despesas
    movimentacoesVisiveis.forEach(function (movimentacao) {
        if (movimentacao.tipo === "entrada") {
            totalEntradas += movimentacao.valor;
        } else {
            totalDespesas += movimentacao.valor;
        }
    });

    // Mostrar os resultados
    saldoTela.textContent = formatarDinheiro(
        totalEntradas - totalDespesas
    );
    const saldoAtual = totalEntradas - totalDespesas;

saldoTela.classList.toggle("negativo", saldoAtual < 0);
saldoTela.classList.toggle("positivo", saldoAtual >= 0);

    entradasTela.textContent = formatarDinheiro(totalEntradas);
    despesasTela.textContent = formatarDinheiro(totalDespesas);
    
    // Agrupar despesas por categoria
    const totaisPorCategoria = {};

    movimentacoesVisiveis.forEach(function (movimentacao) {
        if (movimentacao.tipo === "despesa") {
            const categoria = movimentacao.categoria;

            totaisPorCategoria[categoria] =
                (totaisPorCategoria[categoria] || 0) +
                movimentacao.valor;
        }
    });

    // Encontrar a área do gráfico
    const grafico = document.getElementById("grafico-categorias");
    grafico.replaceChildren();

    const categorias = Object.entries(totaisPorCategoria)
        .sort(function (a, b) {
            return b[1] - a[1];
        });

    if (categorias.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhuma despesa neste período.";
        grafico.appendChild(mensagem);
    } else {
        const maiorValor = categorias[0][1];

        categorias.forEach(function ([nome, total]) {
            const linha = document.createElement("div");
            linha.className = "barra-categoria";

            const info = document.createElement("div");
            info.className = "categoria-info";

            const nomeCategoria = document.createElement("span");
            nomeCategoria.textContent = nome;

            const valorCategoria = document.createElement("strong");
            valorCategoria.textContent = formatarDinheiro(total);

            info.append(nomeCategoria, valorCategoria);

            const trilho = document.createElement("div");
            trilho.className = "trilho";

            const barra = document.createElement("div");
            barra.className = "barra";
            barra.style.width = `${(total / maiorValor) * 100}%`;

            trilho.appendChild(barra);
            linha.append(info, trilho);
            grafico.appendChild(linha);
        });
    }


    // Limpar a lista antes de desenhá-la novamente
    lista.replaceChildren();

    if (movimentacoesVisiveis.length === 0) {
        const mensagem = document.createElement("li");
        mensagem.textContent = "Nenhuma movimentação cadastrada ainda.";
        lista.appendChild(mensagem);
        return;
    }

    // Mostrar cada movimentação
    movimentacoesVisiveis.forEach(function (movimentacao) {
        const item = document.createElement("li");
        const titulo = document.createElement("strong");
        const detalhes = document.createElement("p");
        const botaoExcluir = document.createElement("button");

        titulo.textContent = movimentacao.descricao;

        const sinal = movimentacao.tipo === "entrada" ? "+" : "-";

        detalhes.textContent =
            `${sinal} ${formatarDinheiro(movimentacao.valor)} · ` +
            `${movimentacao.categoria} · ${movimentacao.data}`;

        botaoExcluir.textContent = "Excluir";
botaoExcluir.type = "button";
botaoExcluir.className = "botao-excluir";

        botaoExcluir.addEventListener("click", function () {
            movimentacoes = movimentacoes.filter(function (itemAtual) {
                return itemAtual.id !== movimentacao.id;
            });

            salvarDados();
            atualizarTela();
        });

        item.append(titulo, detalhes, botaoExcluir);
        lista.appendChild(item);
    });
}

// 7. Cadastrar uma nova movimentação
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const novaMovimentacao = {
        id: crypto.randomUUID(),
        descricao: descricao.value.trim(),
        valor: Math.round(Number(valor.value) * 100) / 100,
        tipo: tipo.value,
        categoria: categoria.value,
        data: data.value
    };

    if (
        !novaMovimentacao.descricao ||
        !Number.isFinite(novaMovimentacao.valor) ||
        novaMovimentacao.valor <= 0 ||
        !novaMovimentacao.data
    ) {
        alert("Confira a descrição, o valor e a data.");
        return;
    }

    movimentacoes.push(novaMovimentacao);

    salvarDados();
    atualizarTela();
    const item = document.createElement("li");
const titulo = document.createElement("strong");
const detalhes = document.createElement("p");
const botaoExcluir = document.createElement("button");
item.className = `movimentacao ${movimentacao.tipo}`;

    formulario.reset();

    // Voltar a data para hoje após o cadastro
    data.value = `${ano}-${mes}-${dia}`;

    descricao.focus();
});

// 8. Mostrar os dados ao abrir o site
atualizarTela();

console.log("MeuSaldo iniciado com sucesso!");

filtroMes.addEventListener("change", atualizarTela);

limparFiltro.addEventListener("click", function () {
    filtroMes.value = "";
    atualizarTela();
});

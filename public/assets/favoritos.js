const chaveFavoritos = "bananapoint.favoritos.v1";

function carregarFavoritos(){
    const dados = localStorage.getItem(chaveFavoritos);
    if (!dados) return [];

    const favoritos = JSON.parse(dados);
    if (!Array.isArray(favoritos)) {
        throw new Error("Os dados de favoritos salvos não estão no formato esperado.");
    }
    return favoritos;
}

function salvarFavoritos(favoritos){
    localStorage.setItem(chaveFavoritos, JSON.stringify(favoritos));
}

function mostrarErroFavoritos(erro){
    console.error("Não foi possível atualizar a Minha Lista.", erro);
    window.alert("Não foi possível acessar sua lista neste navegador. Verifique as configurações de armazenamento e tente novamente.");
}

function obterDadosDaObra(secao){
    return {
        id: secao.dataset.favoritoId,
        tipo: secao.dataset.favoritoTipo,
        titulo: secao.dataset.favoritoTitulo,
        capa: new URL(secao.dataset.favoritoCapa, document.baseURI).href,
        descricao: secao.dataset.favoritoDescricao || "",
        generos: secao.dataset.favoritoGeneros || "",
        detalhes: new URL(secao.dataset.favoritoDetalhes, document.baseURI).href
    };
}

function atualizarBotoesFavoritos(){
    let favoritos;
    try {
        favoritos = carregarFavoritos();
    } catch (erro) {
        mostrarErroFavoritos(erro);
        favoritos = [];
    }

    document.querySelectorAll("[data-favorito-id]").forEach(secao => {
        const dados = obterDadosDaObra(secao);
        let botao = secao.querySelector("[data-favorito-botao]");
        if (!botao) {
            const acoes = secao.querySelector(".btn-acoes, .btn-selecao");
            if (!acoes) return;
            botao = document.createElement("button");
            botao.type = "button";
            botao.className = "btn-lista";
            botao.dataset.favoritoBotao = "";
            acoes.append(botao);
        }

        const salvo = favoritos.some(item => item.id === dados.id);
        botao.setAttribute("aria-pressed", String(salvo));
        botao.setAttribute("aria-label", `${salvo ? "Remover" : "Adicionar"} ${dados.titulo} ${salvo ? "da" : "à"} Minha Lista`);

        botao.replaceChildren();
        const icone = document.createElement("img");
        icone.src = new URL("../img/icones/icone-lista.png", document.baseURI).href;
        icone.alt = "";
        icone.width = 17;
        botao.append(icone, document.createTextNode(salvo ? "SALVO" : "MINHA LISTA"));
    });
}

function criarCardFavorito(item){
    const card = document.createElement("article");
    card.className = "favorito-card";

    const capa = document.createElement("img");
    capa.className = "favorito-capa";
    capa.src = item.capa;
    capa.alt = `Capa de ${item.titulo}`;

    const conteudo = document.createElement("div");
    conteudo.className = "favorito-conteudo";

    const etiqueta = document.createElement("span");
    etiqueta.className = "favorito-tipo";
    etiqueta.textContent = item.tipo === "anime" ? "Anime" : "Mangá";

    const titulo = document.createElement("h2");
    titulo.textContent = item.titulo;

    const descricao = document.createElement("p");
    descricao.className = "favorito-descricao";
    descricao.textContent = item.descricao;

    const acoes = document.createElement("div");
    acoes.className = "favorito-acoes";

    const detalhes = document.createElement("a");
    detalhes.className = "favorito-abrir";
    detalhes.href = item.detalhes;
    detalhes.textContent = "Ver detalhes";

    const remover = document.createElement("button");
    remover.className = "favorito-remover";
    remover.type = "button";
    remover.dataset.removerFavorito = item.id;
    remover.setAttribute("aria-label", `Remover ${item.titulo} da Minha Lista`);
    remover.textContent = "Remover";

    conteudo.append(etiqueta, titulo);
    if (item.generos) {
        const generos = document.createElement("p");
        generos.className = "favorito-generos";
        generos.textContent = item.generos;
        conteudo.append(generos);
    }
    if (item.descricao) conteudo.append(descricao);
    acoes.append(detalhes, remover);
    conteudo.append(acoes);
    card.append(capa, conteudo);
    return card;
}

function atualizarMinhaLista(){
    const pagina = document.querySelector("[data-pagina-favoritos]");
    if (!pagina) return;

    const conteudo = pagina.querySelector("[data-conteudo-lista]");
    const grade = pagina.querySelector("[data-grade-favoritos]");
    const vazioGeral = pagina.querySelector("[data-lista-vazia]");
    const vazioFiltro = pagina.querySelector("[data-filtro-vazio]");
    const contador = pagina.querySelector("[data-contagem-favoritos]");
    const pesquisa = pagina.querySelector("[data-pesquisa-favoritos]");
    const ordenacao = pagina.querySelector("[data-ordenacao-favoritos]");
    const filtroAtivo = pagina.querySelector("[data-filtro].ativo")?.dataset.filtro || "todos";

    try {
        const todos = carregarFavoritos();
        const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
        const filtrados = todos
            .filter(item => filtroAtivo === "todos" || item.tipo === filtroAtivo)
            .filter(item => !termo || `${item.titulo} ${item.generos} ${item.descricao}`.toLocaleLowerCase("pt-BR").includes(termo))
            .sort((a, b) => ordenacao.value === "nome"
                ? a.titulo.localeCompare(b.titulo, "pt-BR")
                : b.adicionadoEm.localeCompare(a.adicionadoEm));

        contador.textContent = `${todos.length} ${todos.length === 1 ? "obra salva" : "obras salvas"}`;
        conteudo.hidden = todos.length === 0;
        vazioGeral.hidden = todos.length > 0;
        vazioFiltro.hidden = todos.length === 0 || filtrados.length > 0;
        grade.replaceChildren(...filtrados.map(criarCardFavorito));
        grade.hidden = todos.length === 0 || filtrados.length === 0;
    } catch (erro) {
        mostrarErroFavoritos(erro);
        conteudo.hidden = true;
        vazioGeral.hidden = true;
        vazioFiltro.hidden = true;
        grade.hidden = true;
        contador.textContent = "Não foi possível carregar sua lista.";
    }
}

document.addEventListener("click", evento => {
    const botaoFavorito = evento.target.closest("[data-favorito-botao]");
    if (botaoFavorito) {
        const secao = botaoFavorito.closest("[data-favorito-id]");
        if (!secao) return;

        try {
            const obra = obterDadosDaObra(secao);
            const favoritos = carregarFavoritos();
            const indice = favoritos.findIndex(item => item.id === obra.id);
            if (indice >= 0) {
                favoritos.splice(indice, 1);
            } else {
                favoritos.push({...obra, adicionadoEm: new Date().toISOString()});
            }
            salvarFavoritos(favoritos);
            atualizarBotoesFavoritos();
            atualizarMinhaLista();
        } catch (erro) {
            mostrarErroFavoritos(erro);
        }
    }

    const botaoRemover = evento.target.closest("[data-remover-favorito]");
    if (botaoRemover) {
        try {
            const favoritos = carregarFavoritos().filter(item => item.id !== botaoRemover.dataset.removerFavorito);
            salvarFavoritos(favoritos);
            atualizarBotoesFavoritos();
            atualizarMinhaLista();
        } catch (erro) {
            mostrarErroFavoritos(erro);
        }
    }

    const filtro = evento.target.closest("[data-filtro]");
    if (filtro) {
        document.querySelectorAll("[data-filtro]").forEach(botao => {
            const ativo = botao === filtro;
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", String(ativo));
        });
        atualizarMinhaLista();
    }
});

document.addEventListener("input", evento => {
    if (evento.target.matches("[data-pesquisa-favoritos]")) atualizarMinhaLista();
});

document.addEventListener("change", evento => {
    if (evento.target.matches("[data-ordenacao-favoritos]")) atualizarMinhaLista();
});

window.addEventListener("storage", evento => {
    if (evento.key === chaveFavoritos) {
        atualizarBotoesFavoritos();
        atualizarMinhaLista();
    }
});

atualizarBotoesFavoritos();
atualizarMinhaLista();

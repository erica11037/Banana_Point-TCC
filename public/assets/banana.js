const botao = document.getElementById('banana');

  botao.addEventListener('click', () => {
    // Quantidade de elementos que vão cair por clique
    const quantidade = 30; 

    for (let i = 0; i < quantidade; i++) {
      criarClone();
    }
  });

  function criarClone() {
  const clone = document.createElement('div');
  clone.classList.add('clone');

  // Ajuste para a imagem de 900px não passar da borda direita da tela
  const larguraDisponivel = window.innerWidth - 900;
  const posicaoX = Math.random() * larguraDisponivel;
  clone.style.left = `${posicaoX}px`;

  const atraso = Math.random() * 0.5; 
  clone.style.animationDelay = `${atraso}s`;

  document.body.appendChild(clone);

  // Remove após 5 segundos (tempo da animação + margem de segurança)
  setTimeout(() => {
    clone.remove();
  }, 5000);
}

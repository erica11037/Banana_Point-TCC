var cont = 1;
document.getElementById('radio1').checked = true;

setInterval(() => {
    proximaImg();
}, 10000);

function proximaImg() {
    cont++;
    if (cont > 5) {
        cont = 1;
    }
    document.getElementById('radio' + cont).checked = true;
}

// isso aqui atualiza o contador se você clicar nas bolinhas manualmente
document.querySelectorAll('input[name="botao-radio"]').forEach((elem, index) => {
    elem.addEventListener("change", function() {
        cont = index + 1;
    });
});

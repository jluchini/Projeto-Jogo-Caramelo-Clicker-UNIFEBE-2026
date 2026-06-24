let folhas = 0;
let totalFolhasGanhas = 0;
let folhasPorClique = 1;
let combo = 0;
let bonusAtivo = false;
let vitoriaMostrada = false;

let skinAtual = "normal";
let temporizadorParado;

let aguaProgresso = 0;
let fasePlantaAtual = 0;

let ultimoClique = 0;

const TEMPO_BONUS_EXTRA = 250;

const fasesPlanta = [
    { nome: "Muda", limite: 1000, imagem: "imagens/muda-move.gif" },
    { nome: "Arbusto", limite: 3000, imagem: "imagens/arbusto.gif" },
    { nome: "Jovem", limite: 5000, imagem: "imagens/arvore-jovem.gif" },
    { nome: "Crescida", limite: 10000, imagem: "imagens/arvore-adulta.gif" },
    { nome: "Lendária", limite: 20000, imagem: "imagens/arvore-lendaria.gif" }
];

const musicaFundo = new Audio("sons/background-tema.mp3");
musicaFundo.loop = true;
musicaFundo.volume = 0.25;

const somClique = new Audio("sons/agua-click.mp3");
somClique.volume = 0.35;
somClique.loop = true;

const somCompra = new Audio("sons/som-compra.mp3");
somCompra.volume = 0.45;

const somSkin = new Audio("sons/som-skin-nova.mp3");
somSkin.volume = 0.55;

const somVitoria = new Audio("sons/som-vitoria.mp3");
somVitoria.volume = 0.6;

const somEvolucaoPlanta = new Audio("sons/som-planta-crescendo.mp3");
somEvolucaoPlanta.volume = 0.6;

const totalFolhas = document.getElementById("totalFolhas");
const clickPower = document.getElementById("clickPower");
const barraCombo = document.getElementById("barraCombo");
const textoBonus = document.getElementById("textoBonus");
const barraComboContainer = document.querySelector(".barra-combo");

const aguaRegador = document.getElementById("aguaRegador");
const textoRegador = document.getElementById("textoRegador");

const caramelo = document.getElementById("caramelo");
const planta = document.getElementById("planta");

const botaoConfig = document.getElementById("botaoConfig");
const botaoSkins = document.getElementById("botaoSkins");

const menuConfig = document.getElementById("menuConfig");
const menuSkins = document.getElementById("menuSkins");
const botoesFechar = document.querySelectorAll(".fechar");

const volumeMusica = document.getElementById("volumeMusica");
const volumeEfeitos = document.getElementById("volumeEfeitos");

const skins = {
    normal: {
        liberada: true,
        parado: "imagens/gif caramelo.gif",
        regando: "imagens/caramelo-mangueira.gif",
        texto: "🐕 Normal"
    },

    motivado: {
        liberada: false,
        parado: "imagens/gif caramelo.gif",
        regando: "imagens/caramelo-motivado.gif",
        texto: "🦴 Motivado"
    },

    wapp: {
        liberada: false,
        parado: "imagens/gif caramelo.gif",
        regando: "imagens/caramelo-wapp.gif",
        texto: "🌠 Wapp"
    },

    espacial: {
        liberada: false,
        parado: "imagens/gif caramelo.gif",
        regando: "imagens/caramelo-espaço.gif",
        texto: "🛸 Espacial"
    },

    lendario: {
        liberada: false,
        parado: "imagens/gif caramelo.gif",
        regando: "imagens/caramelo-sigma.gif",
        texto: "🎇 Lendário"
    }
};

const upgrades = {
    petisco: {
        elemento: document.getElementById("upgradePetisco"),
        custo: 300,
        ganho: 10,
        compras: 0,
        aumentoCusto: 100
    },

    wapp: {
        elemento: document.getElementById("upgradeWapp"),
        custo: 2500,
        ganho: 40,
        compras: 0,
        aumentoCusto: 100
    },

    arminha: {
        elemento: document.getElementById("upgradeArminha"),
        custo: 9000,
        ganho: 120,
        compras: 0,
        aumentoCusto: 100
    },

    capa: {
        elemento: document.getElementById("upgradeCapa"),
        custo: 15000,
        ganho: 300,
        compras: 0,
        aumentoCusto: 100
    }
};

const totalUpgrades = document.getElementById("totalUpgrades");

document.addEventListener("click", iniciarMusica, { once: true });

function iniciarMusica() {
    musicaFundo.play().catch(() => {
        console.log("A música só inicia após interação do usuário.");
    });
}

function tocarSom(som) {
    som.currentTime = 0;
    som.play().catch(() => { });
}

caramelo.addEventListener("click", clicarCaramelo);

function clicarCaramelo(event) {
    if (somClique.paused) {
        somClique.currentTime = 0;
        somClique.play().catch(() => { });
    }

    clearTimeout(somClique.timerParar);
    somClique.timerParar = setTimeout(() => {
        somClique.pause();
        somClique.currentTime = 0;
    }, 500);

    ultimoClique = Date.now();

    let ganho = folhasPorClique;

    if (bonusAtivo) {
        ganho *= 2;
    }

    folhas += ganho;
    totalFolhasGanhas += ganho;
    aguaProgresso += ganho;
    combo += 5;

    if (combo > 100) {
        combo = 100;
    }

    if (!caramelo.classList.contains("estado-regando")) {
        aplicarVisualCaramelo("regando");
    }
    caramelo.classList.add("clicando");

    clearTimeout(temporizadorParado);

    temporizadorParado = setTimeout(() => {
        aplicarVisualCaramelo("parado");
    }, 500);

    criarFolhaVoando(event.clientX, event.clientY, ganho);

    verificarFasePlanta();
    verificarSkinsPorCheckpoint();
    verificarVitoria();
    atualizarTela();
}

function atualizarTela() {
    totalFolhas.textContent = Math.floor(folhas);

    clickPower.textContent = "+" + folhasPorClique;

    if (totalUpgrades) {
        totalUpgrades.textContent = Object.values(upgrades)
            .reduce((total, upgrade) => total + upgrade.compras, 0);
    }

    barraCombo.style.height = combo + "%";

    atualizarRegador();
    atualizarLoja();
    atualizarBonusVisual();
}

function atualizarBonusVisual() {
    const tempoSemClique = Date.now() - ultimoClique;

    if (combo >= 100 || (bonusAtivo && tempoSemClique < TEMPO_BONUS_EXTRA)) {
        bonusAtivo = true;
        barraComboContainer.classList.add("bonus");
        textoBonus.classList.add("ativo");
    } else {
        bonusAtivo = false;
        barraComboContainer.classList.remove("bonus");
        textoBonus.classList.remove("ativo");
    }
}

function atualizarRegador() {
    const faseAtual = fasesPlanta[fasePlantaAtual];

    let porcentagem = (aguaProgresso / faseAtual.limite) * 100;

    if (porcentagem > 100) {
        porcentagem = 100;
    }

    aguaRegador.style.transform = "none";
    aguaRegador.parentElement.style.height = porcentagem + "%";

    textoRegador.textContent = Math.floor(aguaProgresso) + " / " + faseAtual.limite;
}

function atualizarLoja() {
    Object.values(upgrades).forEach((upgrade) => {

        const textoCusto =
            upgrade.elemento.querySelector("strong");

        const textoCompras =
            upgrade.elemento.querySelector(".qtd-upgrade");

        if (textoCusto) {
            textoCusto.textContent =
                formatarFolhas(upgrade.custo) + " folhas";
        }

        if (textoCompras) {
            textoCompras.textContent = upgrade.compras;
        }

        if (folhas >= upgrade.custo) {
            upgrade.elemento.classList.remove("indisponivel");
        } else {
            upgrade.elemento.classList.add("indisponivel");
        }
    });
}

function formatarFolhas(valor) {
    return Math.floor(valor).toLocaleString("pt-BR");
}

function criarFolhaVoando(x, y, ganho) {
    const folha = document.createElement("span");
    folha.classList.add("folha-voando");
    folha.textContent = "+ " + ganho + " 🍃";

    folha.style.left = x + "px";
    folha.style.top = y + "px";

    document.body.appendChild(folha);

    setTimeout(() => {
        folha.remove();
    }, 1000);
}

function verificarFasePlanta() {
    const faseAtual = fasesPlanta[fasePlantaAtual];

    if (aguaProgresso >= faseAtual.limite) {
        aguaProgresso = 0;

        if (fasePlantaAtual < fasesPlanta.length - 1) {
            fasePlantaAtual++;

            tocarSom(somEvolucaoPlanta);

            planta.animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(1.15)" },
                    { transform: "scale(1)" }
                ],
                {
                    duration: 500
                });

            planta.src = fasesPlanta[fasePlantaAtual].imagem;

            planta.className = "";
            planta.classList.add("planta-" + fasePlantaAtual);
        }
    }
}

function verificarSkinsPorCheckpoint() {
    if (totalFolhasGanhas >= 10000) {
        trocarSkinAutomaticamente("lendario");
    }
    else if (totalFolhasGanhas >= 5000) {
        trocarSkinAutomaticamente("espacial");
    }
    else if (totalFolhasGanhas >= 3000) {
        trocarSkinAutomaticamente("wapp");
    }
    else if (totalFolhasGanhas >= 1000) {
        trocarSkinAutomaticamente("motivado");
    }
}

function comprarUpgrade(upgrade) {
    if (folhas < upgrade.custo) {
        return;
    }

    folhas -= upgrade.custo;
    folhasPorClique += upgrade.ganho;
    upgrade.compras++;
    upgrade.custo += upgrade.aumentoCusto;

    tocarSom(somCompra);

    atualizarTela();
}

upgrades.petisco.elemento.addEventListener("click", () => {
    comprarUpgrade(upgrades.petisco);
});

upgrades.wapp.elemento.addEventListener("click", () => {
    comprarUpgrade(upgrades.wapp);
});

upgrades.arminha.elemento.addEventListener("click", () => {
    comprarUpgrade(upgrades.arminha);
});

upgrades.capa.elemento.addEventListener("click", () => {
    comprarUpgrade(upgrades.capa);
});

setInterval(() => {
    if (combo > 0) {
        combo -= 2;

        if (combo < 0) {
            combo = 0;
        }
    }

    atualizarTela();
}, 300);

function verificarVitoria() {
    if (fasePlantaAtual === fasesPlanta.length - 1 && !vitoriaMostrada) {
        vitoriaMostrada = true;

        tocarSom(somVitoria);

        setTimeout(() => {
            alert("Parabéns! O Caramelo transformou a mudinha na lendária Árvore do Caramelo!");
        }, 200);
    }
}

function trocarSkinAutomaticamente(nomeSkin) {
    if (!nomeSkin) return;

    const skinJaEraLiberada = skins[nomeSkin].liberada;

    liberarSkin(nomeSkin);

    if (!skinJaEraLiberada) {
        skinAtual = nomeSkin;

        tocarSom(somSkin);
        aplicarVisualCaramelo("parado");

        document.querySelectorAll(".skin").forEach((botao) => {
            botao.classList.toggle("selecionada", botao.dataset.skin === nomeSkin);
        });
    }
}

function liberarSkin(nomeSkin) {
    if (!nomeSkin) return;

    skins[nomeSkin].liberada = true;

    const botao = document.querySelector(`[data-skin="${nomeSkin}"]`);

    if (!botao) return;

    botao.classList.remove("bloqueada");
    botao.classList.add("liberada");

    const textoBotao = botao.querySelector("span");

    if (textoBotao) {
        textoBotao.textContent = skins[nomeSkin].texto;
    }
}

function aplicarVisualCaramelo(estado) {
    caramelo.className = "";

    caramelo.classList.add("skin-" + skinAtual);
    caramelo.classList.add("estado-" + estado);

    caramelo.src = skins[skinAtual][estado];
}

document.querySelectorAll(".skin").forEach((botao) => {
    botao.addEventListener("click", () => {
        const nomeSkin = botao.dataset.skin;

        if (!skins[nomeSkin].liberada) {
            alert("Essa skin ainda está bloqueada!");
            return;
        }

        skinAtual = nomeSkin;

        aplicarVisualCaramelo("parado");

        document.querySelectorAll(".skin").forEach((b) => {
            b.classList.remove("selecionada");
        });

        botao.classList.add("selecionada");
    });
});

botaoConfig.addEventListener("click", () => {
    menuConfig.classList.remove("escondido");
});

botaoSkins.addEventListener("click", () => {
    menuSkins.classList.remove("escondido");
});

botoesFechar.forEach((botao) => {
    botao.addEventListener("click", () => {
        menuConfig.classList.add("escondido");
        menuSkins.classList.add("escondido");
    });
});

if (volumeMusica) {
    volumeMusica.addEventListener("input", () => {
        musicaFundo.volume = volumeMusica.value / 100;
    });
}

if (volumeEfeitos) {
    volumeEfeitos.addEventListener("input", () => {
        const volume = volumeEfeitos.value / 100;

        somClique.volume = volume;
        somCompra.volume = volume;
        somSkin.volume = volume;
        somVitoria.volume = volume;
    });
}

aplicarVisualCaramelo("parado");

planta.src = fasesPlanta[fasePlantaAtual].imagem;
planta.classList.add("planta-0");

document.querySelector(`[data-skin="${skinAtual}"]`)?.classList.add("selecionada");

atualizarTela();
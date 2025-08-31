/*
  Autor: 
*/
/// <reference types="p5/global" />

// ===================================================================
// VARIÁVEIS GLOBAIS
// ===================================================================
let tamanhoTabuleiro, margem = 20, tamanhoTexto;
let tabuleiro;
let porcentagemTabuleiro = 0.6, porcentagemTexto = 0.06;
const COR_FUNDO = '#0d1b2a';       
const COR_TABULEIRO = '#415a77'; 
const COR_X = '#e0e1dd';          
const COR_O = '#778da9';          
const COR_VITORIA = '#9ef01a';    
const COR_HOVER = 'rgba(224, 225, 221, 0.2)'; 
let infoVitoria = null;

// Variáveis de Controle do Jogo
let modoDeJogo = "menu_principal"; 
let jogador = "", IA = "", jogadorAtual = "";

// Variáveis da IA
let agenteIA;
let derrotasDaIA = 0;
const TREINO_BASE_POR_DERROTA = 3600;
const EPISODIOS_INICIAIS = 5000; 
let progressoTreinamento = "";

// Variáveis de Interface (p5.dom)
let dialogoIA, painelIA;
let botaoJogar, botaoX, botaoO, botaoJogarNovamente, botaoXYCriado = false; 
let botoesMenuPrincipalCriados = false;

// Variáveis de Animação
let animacaoAtiva = false;
let destaqueGanhador = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
];

// ===================================================================
// FUNÇÕES PRINCIPAIS DO P5.JS 
// ===================================================================

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('Roboto');
    textAlign(CENTER, TOP);
    ajustarTamanhos();

   
    tabuleiro = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    
    agenteIA = new qlearningIA();
}

function draw() {
    background(COR_FUNDO);
    
    switch (modoDeJogo) {
    case "menu_principal":
        desenharTelaInicial();
        break;
    case "escolha_jogador":
        menuEscolhaPeca(); 
        break;
    case "jogando":
        jogar();
        criarPainelIA();
        desenharHover();
        desenharLinhaVitoria();
        break;
}
}

// ===================================================================
// FUNÇÕES DE CONTROLE DE TELA E MENUS
// ===================================================================

function aplicarEstiloBotaoPrincipal(botao, nivelImportancia = 1.0) {
    const fontSizeBotao = tamanhoTexto * 0.6 * nivelImportancia;
    const paddingVertical = tamanhoTexto * 0.5 * nivelImportancia;
    const paddingHorizontal = tamanhoTexto * 1.0 * nivelImportancia;

    botao.style('background-color', COR_TABULEIRO);
    botao.style('color', COR_X);
    botao.style('font-size', `${fontSizeBotao}px`);
    botao.style('font-weight', 'bold');
    botao.style('font-family', 'Montserrat, sans-serif');
    botao.style('border', 'none');
    botao.style('padding', `${paddingVertical}px ${paddingHorizontal}px`);
    botao.style('border-radius', '50px');
    botao.style('cursor', 'pointer');
    botao.style('transition', 'background-color 0.3s, transform 0.1s');
    botao.style('transform', 'translateX(-50%)'); 

    botao.mouseOver(() => {
        botao.style('background-color', COR_O);
        botao.style('transform', 'translateX(-50%) scale(1.05)');
    });
    botao.mouseOut(() => {
        botao.style('background-color', COR_TABULEIRO);
        botao.style('transform', 'translateX(-50%) scale(1.0)');
    });
}

function desenharTelaInicial() {
    push(); 
    
    fill(COR_X);
    textSize(tamanhoTexto * 1.5);
    textAlign(CENTER, CENTER);
    text("JOGO DA VELHA", width / 2, height * 0.3);

    textSize(tamanhoTexto * 0.7);
    fill(COR_O);
    text("Uma IA que aprende a cada derrota.\nQuanto mais você vence, mais forte ela fica.", width / 2, height * 0.45);
    pop();
    if (botoesMenuPrincipalCriados) return;
    botoesMenuPrincipalCriados = true;

    botaoJogar = createButton("INICIAR JOGO");
    aplicarEstiloBotaoPrincipal(botaoJogar); 
    botaoJogar.position(width / 2, height * 0.6);

    botaoJogar.mousePressed(async () => {
        botaoJogar.remove();
        botoesMenuPrincipalCriados = false;
        treinarAgente(EPISODIOS_INICIAIS);
        modoDeJogo = 'escolha_jogador';
        falarIA(frasesIA("jogarNovamente"));
    });
     
    
}

function aplicarEstiloEPosicaoBotoesXO() {
    if (!botaoX || !botaoO) return;

    const tamanhoBotao = tamanhoTabuleiro / 3.5;
    const espacoEntre = tamanhoTabuleiro * 0.1; 
    const fontSize = tamanhoBotao * 0.5;

    botaoX.style('width', `${tamanhoBotao}px`);
    botaoX.style('height', `${tamanhoBotao}px`);
    botaoX.style('font-size', `${fontSize}px`);
    
    botaoX.position(width / 2 - espacoEntre / 2 - tamanhoBotao, height / 2);

    botaoO.style('width', `${tamanhoBotao}px`);
    botaoO.style('height', `${tamanhoBotao}px`);
    botaoO.style('font-size', `${fontSize}px`);
    
    botaoO.position(width / 2 + espacoEntre / 2, height / 2);
}

function menuEscolhaPeca() {
    push(); 
    
    textAlign(CENTER, CENTER);
    fill(COR_X);
    noStroke();
    textSize(tamanhoTexto);
    text("Escolha sua Peça", width / 2, height / 2 - (tamanhoTabuleiro / 3.5)); 
    pop();
    
    if (botaoXYCriado) return;
    botaoXYCriado = true;

    function estilo(botao, corPrincipal, corFundo) {
        botao.style('background-color', 'transparent');
        botao.style('border', `2px solid ${COR_TABULEIRO}`);
        botao.style('color', corPrincipal);
        botao.style('font-weight', 'bold');
        botao.style('font-family', 'Montserrat, sans-serif');
        botao.style('border-radius', '15px');
        botao.style('cursor', 'pointer');
        botao.style('transition', 'all 0.3s');
    }

    botaoX = createButton("X");
    estilo(botaoX, COR_X);
    botaoX.mouseOver(() => { botaoX.style('background-color', COR_X); botaoX.style('color', COR_FUNDO); });
    botaoX.mouseOut(() => { botaoX.style('background-color', 'transparent'); botaoX.style('color', COR_X); });
    botaoX.mousePressed(() => escolhaJogador("X"));

    botaoO = createButton("O");
    estilo(botaoO, COR_O);
    botaoO.mouseOver(() => { botaoO.style('background-color', COR_O); botaoO.style('color', COR_FUNDO); });
    botaoO.mouseOut(() => { botaoO.style('background-color', 'transparent'); botaoO.style('color', COR_O); });
    botaoO.mousePressed(() => escolhaJogador("O"));
    
    aplicarEstiloEPosicaoBotoesXO();
     
    
}

// ===================================================================
// FUNÇÕES DE LÓGICA DO JOGO
// ===================================================================

function escolhaJogador(simbolo) {
    jogador = simbolo;
    IA = (simbolo === 'X') ? 'O' : 'X';
    jogadorAtual = 'X'; 

    botaoX.remove();
    botaoO.remove();
  
    setTimeout(()=>{
      modoDeJogo = 'jogando';
      if (jogadorAtual === IA) 
        {
          
          setTimeout(()=>{jogarIA();},1000);
          
        }
    }, 800);
    
}

function jogar() {
    criarTabuleiro();
    exibirJogadas();
    
}

function jogarIA() {
    if (modoDeJogo !== 'jogando' || animacaoAtiva) return;

    const acoesDisponiveis = obterAcoesDisponiveis(tabuleiro);
    if (acoesDisponiveis.length === 0) return;

    const melhorAcao = agenteIA.escolherAcao(tabuleiro, acoesDisponiveis);
    
    const linha = Math.floor(melhorAcao / 3);
    const coluna = melhorAcao % 3;
    
    tabuleiro[linha][coluna] = IA;

    
    const resultado = situacaoTabuleiro(tabuleiro, true); 

    if (resultado) { 
        finalizarPartida(resultado); 
    } else { 
        falarIA(frasesIA("suaVez"));
        jogadorAtual = jogador;
    }
}

function mousePressed() {
    if (modoDeJogo !== 'jogando' || jogadorAtual === IA || animacaoAtiva) {
        return;
    }

    let topoTabuleiro = margem + tamanhoTexto + 20;
    let inicioTabuleiro = (width - tamanhoTabuleiro) / 2;
    let fimTabuleiro = inicioTabuleiro + tamanhoTabuleiro;

    if (mouseX >= inicioTabuleiro && mouseX <= fimTabuleiro && mouseY >= topoTabuleiro && mouseY <= topoTabuleiro + tamanhoTabuleiro) {
        let tamanhoCelula = tamanhoTabuleiro / 3;
        let linha = floor((mouseY - topoTabuleiro) / tamanhoCelula);
        let coluna = floor((mouseX - inicioTabuleiro) / tamanhoCelula);

        if (tabuleiro[linha][coluna] === "") {
            tabuleiro[linha][coluna] = jogadorAtual;
            const resultado = situacaoTabuleiro(tabuleiro, true);

            if (resultado) {
                finalizarPartida(resultado);
            } else {
                jogadorAtual = IA;
                setTimeout(jogarIA, 500);
            }
        }
    }
}

// ===================================================================
// LÓGICA DA IA (TREINAMENTO)
// ===================================================================

async function treinarAgente(episodios) {
    console.log(`Iniciando treinamento adicional de ${episodios} episódios...`);

    for (let i = 0; i < episodios; i++) {
        let tabuleiroDeTreino = [["", "", ""], ["", "", ""], ["", "", ""]];
        let historicoDaPartida = [];
        let jogadorAtualTreino = 'X';

        while (true) {
            const chaveDoEstado = agenteIA.chaveTabuleiro(tabuleiroDeTreino);
            const acoesDisponiveis = obterAcoesDisponiveis(tabuleiroDeTreino);

            if (acoesDisponiveis.length === 0) {
                break; 
            }

            const acao = agenteIA.escolherAcao(tabuleiroDeTreino, acoesDisponiveis);

            
            historicoDaPartida.push({
                chaveDoEstado,
                acao,
                jogador: jogadorAtualTreino
            });

            const linha = Math.floor(acao / 3);
            const coluna = acao % 3;
            tabuleiroDeTreino[linha][coluna] = jogadorAtualTreino;

            const resultado = situacaoTabuleiro(tabuleiroDeTreino, false);

            if (resultado !== null) {
                for (let j = historicoDaPartida.length - 1; j >= 0; j--) {
                    const passo = historicoDaPartida[j];
                    let recompensaFinal;

                    if (resultado === 'empate') {
                        recompensaFinal = 0;
                    } else if (passo.jogador === resultado) {
                        recompensaFinal = 1;
                    } else {
                        recompensaFinal = -1;
                    }

                    
                    let proximaChave;
                    let acoesProximoEstado;

                    if (j + 1 < historicoDaPartida.length) {
                        
                        proximaChave = historicoDaPartida[j + 1].chaveDoEstado;
                        
                        
                        let tempBoard = [["", "", ""], ["", "", ""], ["", "", ""]];
                        for(let k = 0; k <= j; k++){
                           const l = Math.floor(historicoDaPartida[k].acao / 3);
                           const c = historicoDaPartida[k].acao % 3;
                           tempBoard[l][c] = historicoDaPartida[k].jogador;
                        }
                        acoesProximoEstado = obterAcoesDisponiveis(tempBoard);

                    } else {
                        
                        proximaChave = agenteIA.chaveTabuleiro(tabuleiroDeTreino);
                        acoesProximoEstado = []; 
                    }
                    
                    agenteIA.atualizarTabelaQ(passo.chaveDoEstado, passo.acao, recompensaFinal, proximaChave, acoesProximoEstado);
                }
                break;
            }
            jogadorAtualTreino = (jogadorAtualTreino === 'X') ? 'O' : 'X';
        }
        agenteIA.reduzirEpsilon();

        if (i % 500 === 0) { 
            
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    console.log(`IA treinou por mais ${episodios} episódios.`);
    
}

function obterAcoesDisponiveis(tabuleiro) {
    const acoes = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (tabuleiro[i][j] === '') {
                acoes.push(i * 3 + j);
            }
        }
    }
    return acoes;
}

// ===================================================================
// FUNÇÕES VISUAIS E AUXILIARES 
// ===================================================================

function desenharX(x, y, tamanho) {
    push(); 
    
    stroke(COR_X);
    strokeWeight(tamanho * 0.1); 
    strokeCap(ROUND); 

    const pad = tamanho * 0.2; 

    
    line(x + pad, y + pad, x + tamanho - pad, y + tamanho - pad);
    line(x + tamanho - pad, y + pad, x + pad, y + tamanho - pad);

    pop();
}

function desenharO(x, y, tamanho) {
    push(); 
    
    stroke(COR_O);
    strokeWeight(tamanho * 0.1);
    noFill(); 

    const pad = tamanho * 0.2;
    const diametro = tamanho - (pad * 2);

    
    ellipse(x + tamanho / 2, y + tamanho / 2, diametro);

    pop();
}

function desenharHover() { 

    if (modoDeJogo !== 'jogando' || jogadorAtual !== jogador || animacaoAtiva) {
        return;
    }
    
    let topoTabuleiro = margem + tamanhoTexto + 20;
    let inicioTabuleiro = (width - tamanhoTabuleiro) / 2;

    
    if (mouseX < inicioTabuleiro || mouseX > inicioTabuleiro + tamanhoTabuleiro ||
        mouseY < topoTabuleiro || mouseY > topoTabuleiro + tamanhoTabuleiro) {
        return;
    }
    
    let tamanhoCelula = tamanhoTabuleiro / 3;
    let linha = floor((mouseY - topoTabuleiro) / tamanhoCelula);
    let coluna = floor((mouseX - inicioTabuleiro) / tamanhoCelula);

    
    if (tabuleiro[linha][coluna] === "") {
        push();
        const x = inicioTabuleiro + coluna * tamanhoCelula;
        const y = topoTabuleiro + linha * tamanhoCelula;
        
        fill(COR_HOVER);
        noStroke();
        rect(x, y, tamanhoCelula, tamanhoCelula, 10); 
        pop();
    }
     
    
}

function ajustarTamanhos() {
    resizeCanvas(windowWidth, windowHeight); 
    tamanhoTexto = min(windowWidth * porcentagemTexto, windowHeight * porcentagemTexto);
    tamanhoTexto = constrain(tamanhoTexto, 16, 48);
    textSize(tamanhoTexto);
    tamanhoTabuleiro = min(width, height) * porcentagemTabuleiro;
}

function criarTabuleiro() {
    push(); 
    
    let topoTabuleiro = margem + tamanhoTexto + 20;
    let inicioTabuleiro = (width - tamanhoTabuleiro) / 2;
    let fimTabuleiro = inicioTabuleiro + tamanhoTabuleiro;
    stroke(COR_TABULEIRO);
    strokeWeight(5);
    line(inicioTabuleiro, topoTabuleiro + (tamanhoTabuleiro / 3), fimTabuleiro, topoTabuleiro + (tamanhoTabuleiro / 3));
    line(inicioTabuleiro, topoTabuleiro + 2 * (tamanhoTabuleiro / 3), fimTabuleiro, topoTabuleiro + 2 * (tamanhoTabuleiro / 3));
    line(inicioTabuleiro + (tamanhoTabuleiro / 3), topoTabuleiro, inicioTabuleiro + (tamanhoTabuleiro / 3), topoTabuleiro + tamanhoTabuleiro);
    line(inicioTabuleiro + 2 * (tamanhoTabuleiro / 3), topoTabuleiro, inicioTabuleiro + 2 * (tamanhoTabuleiro / 3), topoTabuleiro + tamanhoTabuleiro);

    pop();
}

function exibirJogadas() {
    let topoTabuleiro = margem + tamanhoTexto + 20;
    let inicioTabuleiro = (width - tamanhoTabuleiro) / 2;
    let tamanhoCelula = tamanhoTabuleiro / 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const x = inicioTabuleiro + j * tamanhoCelula;
            const y = topoTabuleiro + i * tamanhoCelula;

            if (destaqueGanhador[i][j]) {
                fill(destaqueGanhador[i][j]);
                noStroke();
                rect(x, y, tamanhoCelula, tamanhoCelula);
            }
            
            if (tabuleiro[i][j] === 'X') {
                desenharX(x, y, tamanhoCelula);
            } else if (tabuleiro[i][j] === 'O') {
                desenharO(x, y, tamanhoCelula);
            }
        }
    }
}

function situacaoTabuleiro(tabuleiroCorrente, animacao) {
    for (let i = 0; i < 3; i++) {
        if (tabuleiroCorrente[i][0] && tabuleiroCorrente[i][0] === tabuleiroCorrente[i][1] && tabuleiroCorrente[i][0] === tabuleiroCorrente[i][2]) {
            if (animacao) animacaoTabuleiro("linha", i);
            return tabuleiroCorrente[i][0];
        }
        if (tabuleiroCorrente[0][i] && tabuleiroCorrente[0][i] === tabuleiroCorrente[1][i] && tabuleiroCorrente[0][i] === tabuleiroCorrente[2][i]) {
            if (animacao) animacaoTabuleiro("coluna", i);
            return tabuleiroCorrente[0][i];
        }
    }
    if (tabuleiroCorrente[0][0] && tabuleiroCorrente[0][0] === tabuleiroCorrente[1][1] && tabuleiroCorrente[0][0] === tabuleiroCorrente[2][2]) {
        if (animacao) animacaoTabuleiro("diagonal", 1);
        return tabuleiroCorrente[0][0];
    }
    if (tabuleiroCorrente[0][2] && tabuleiroCorrente[0][2] === tabuleiroCorrente[1][1] && tabuleiroCorrente[0][2] === tabuleiroCorrente[2][0]) {
        if (animacao) animacaoTabuleiro("diagonal", 2);
        return tabuleiroCorrente[0][2];
    }
    if (tabuleiroCorrente.flat().every(cell => cell !== "")) {
        if (animacao) animacaoTabuleiro("empate", 0);
        return "empate";
    }
    return null;
}

function resetarJogo() {
    if (animacaoAtiva) return; 
    animacaoAtiva = true;

    
    infoVitoria = null; 
    
    let tempo = 100;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            
            destaqueGanhador[i][j] = null;

            if (tabuleiro[i][j] !== "") {
                setTimeout(() => {
                    tabuleiro[i][j] = "";
                }, tempo);
                tempo += 150; 
            }
        }
    }
    
    setTimeout(() => {
        animacaoAtiva = false; 
        modoDeJogo = 'escolha_jogador'; 
        botaoXYCriado = false;
        falarIA(frasesIA("jogarNovamente"));
    }, tempo + 200); 
}

async function finalizarPartida(vencedor) {
    animacaoAtiva = true;

    if (vencedor === 'empate') {
        falarIA(frasesIA("empate"));
    } else if (vencedor === jogador) {
        falarIA(frasesIA("derrota"));
    } else {
        falarIA(frasesIA("vitoria"));
    }
  
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (vencedor === jogador) {
        derrotasDaIA++;
        const episodiosParaTreinar = derrotasDaIA * TREINO_BASE_POR_DERROTA;
        
        modoDeJogo = 'treinando';
        progressoTreinamento = `Analisando derrota... Nível ${derrotasDaIA}`;
        await treinarAgente(episodiosParaTreinar);
        
        const nomeDoArquivo = `qtable_nivel_${derrotasDaIA}.json`;
        salvarTabelaQ(agenteIA.tabelaQ, nomeDoArquivo);
        
        resetarJogo();
    } else { 
        botaoJogarNovamente = createButton("Jogar Novamente");
        aplicarEstiloBotaoPrincipal(botaoJogarNovamente, 0.9);
        botaoJogarNovamente.style('background-color', COR_VITORIA);
        botaoJogarNovamente.style('color', COR_FUNDO);
        botaoJogarNovamente.position(width / 2, height - 60);

        botaoJogarNovamente.mousePressed(() => {
            botaoJogarNovamente.remove();
            botaoJogarNovamente = null;
            resetarJogo();
        });
    }
}

function animacaoTabuleiro(situacao, posicao) {
    animacaoAtiva = true;

    if (situacao === 'linha' || situacao === 'coluna' || situacao === 'diagonal') {
        
        infoVitoria = { tipo: situacao, indice: posicao, frameInicio: frameCount };
    } 
    else if (situacao === 'empate') {

        let tempo = 200;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                setTimeout(() => {
                    destaqueGanhador[i][j] = color(255, 0, 0, 120);
                }, tempo);
                tempo += 200;
            }
        }
        
        setTimeout(() => {
            animacaoAtiva = false;
        }, tempo + 100);
    }
}

function desenharLinhaVitoria() { 
    if (!infoVitoria) return;
    
    push(); 
    let progresso = (frameCount - infoVitoria.frameInicio) / 30.0;
    progresso = constrain(progresso, 0, 1); 

    stroke(COR_VITORIA);
    strokeWeight(15);
    strokeCap(ROUND);

    let topo = margem + tamanhoTexto + 20;
    let inicio = (width - tamanhoTabuleiro) / 2;
    let tamC = tamanhoTabuleiro / 3;
    let centro = tamC / 2;

    let x1, y1, x2, y2, xFinal, yFinal;

    switch(infoVitoria.tipo) {
        case 'linha':
            y1 = y2 = topo + infoVitoria.indice * tamC + centro;
            x1 = inicio;
            x2 = inicio + tamanhoTabuleiro;
            break;
        case 'coluna':
            x1 = x2 = inicio + infoVitoria.indice * tamC + centro;
            y1 = topo;
            y2 = topo + tamanhoTabuleiro;
            break;
        case 'diagonal':
            if (infoVitoria.indice === 1) { 
                x1 = inicio; y1 = topo;
                x2 = inicio + tamanhoTabuleiro; y2 = topo + tamanhoTabuleiro;
            } else { 
                x1 = inicio + tamanhoTabuleiro; y1 = topo;
                x2 = inicio; y2 = topo + tamanhoTabuleiro;
            }
            break;
    }

    xFinal = lerp(x1, x2, progresso);
    yFinal = lerp(y1, y2, progresso);
    line(x1, y1, xFinal, yFinal);

    if (progresso >= 1) {
       setTimeout(() => { animacaoAtiva = false; }, 200);
    }
    pop();
}

function criarPainelIA() {
    if (painelIA) return;
    painelIA = createDiv();
    painelIA.style('position', 'absolute');
    painelIA.style('background-color', 'rgba(0, 0, 0, 0.4)'); 
    painelIA.style('border-top', `2px solid ${COR_TABULEIRO}`); 
    padding: '15px 25px';
    painelIA.style('color', COR_X);
    painelIA.style('text-align', 'center');
    painelIA.style('width', tamanhoTabuleiro + 'px');
    painelIA.style('font-size', '16px');
    painelIA.style('font-family', 'Montserrat, sans-serif');
    painelIA.style('z-index', '10');

    dialogoIA = createP("Que os jogos comecem!");
    dialogoIA.parent(painelIA);
    dialogoIA.style('margin', '0');

    reposicionarPainelIA();
}

function reposicionarPainelIA() {
    if (painelIA) {
        let y = margem + tamanhoTexto + 20 + tamanhoTabuleiro + 20;
        painelIA.style('width', tamanhoTabuleiro + 'px');
        painelIA.position((windowWidth - tamanhoTabuleiro) / 2, y);
    }
}

function frasesIA(vetor){
    let frase = "";
    const frasesJogarNovamente = [
        "Ok, vamos de novo. Tabuleiro zerado, conhecimento acumulado.",
        "X ou O? Sua primeira decisão... e talvez seu primeiro erro.",
        "Prefere a vantagem de começar ou o desafio de virar o jogo?",
        "Nova partida, novas possibilidades. Me surpreenda.",
        "O resultado anterior já foi processado. Foco no agora.",
        "E aí, qual vai ser a estratégia desta vez?",
        "Pronto para mais uma rodada de coleta de dados? Para mim, claro.",
        "Escolha com sabedoria. Cada jogada está sendo analisada."
    ];
    
    const frasesSuaVez = [
        "Sua vez. Tente me surpreender.",
        "Ok, calculei minha jogada. Agora é com você.",
        "O tabuleiro é todo seu. Sem pressão.",
        "Duvido que você saiba como responder a isso.",
        "Pode jogar. Estou analisando seu tempo de resposta.",
        "Certo. E agora, qual será o seu movimento, humano?",
        "A bola está com você. Não a deixe cair."
    ];

    const frasesVitoria = [
        "GG! A lógica sempre prevalece.",
        "Foi uma boa partida de treino para mim. Obrigado!",
        "Previ essa sua jogada há 3 movimentos.",
        "É, acho que a máquina venceu desta vez. 😉",
        "Não se preocupe, perder pra mim é normal.",
        "Simplesmente inevitável.",
        "Eu venci! 😎 Pratique mais um pouco."
    ];

    const frasesDerrota = [
        "O quê? Inesperado. Vou adicionar isso aos meus dados de treino.",
        "Boa! Você me pegou nessa. Jogada inteligente.",
        "Derrota? Eu chamo de 'coleta de dados para a próxima vitória'.",
        "Ok, você venceu... por enquanto. Hora de rodar mais algumas simulações.",
        "Interessante... sua estratégia não estava nos meus 98% de previsões.",
        "Obrigado pela lição. Prometo que não vai acontecer de novo.",
        "Você venceu! Hmm... preciso estudar mais."
    ];

    const frasesEmpate = [
        "Deu velha! Acontece entre os melhores.",
        "Um oponente à altura, finalmente.",
        "Você joga bem... para um humano.",
        "Resultado otimizado para ambos os jogadores.",
        "Empatamos. Considere isso um presente.",
        "Hmm, um impasse. Na próxima eu desempato.",
        "Desta vez deu empate! 🤔"
    ];


    switch(vetor){
        case "jogarNovamente":
            frase = random(frasesJogarNovamente);
        break;

        case "suaVez":
            frase = random(frasesSuaVez);
        break;

        case "vitoria":
            frase = random(frasesVitoria);
        break;

        case "derrota":
            frase = random(frasesDerrota);
        break;

        case "empate":
            frase = random(frasesEmpate);
        break;

    }

    return(frase);

}

function falarIA(frase) {
    if (dialogoIA) {
        dialogoIA.html(frase);
    }
}

function reposicionarBotoes() {
    if (botaoJogar) {
        aplicarEstiloBotaoPrincipal(botaoJogar);
        botaoJogar.position(width / 2, height * 0.6);
    }
    if (botaoX && botaoO) {
        aplicarEstiloEPosicaoBotoesXO();
    }
    if (botaoJogarNovamente) {
        aplicarEstiloBotaoPrincipal(botaoJogarNovamente, 0.9);
        botaoJogarNovamente.style('background-color', COR_VITORIA);
        botaoJogarNovamente.style('color', COR_FUNDO);
        botaoJogarNovamente.position(width / 2, height - 60);
    }
}

function salvarTabelaQ(qTable, nomeArquivo) {
    const replacer = (key, value) => {
        if (value instanceof Map) {
            return Object.fromEntries(value.entries());
        } else {
            return value;
        }
    };

    const jsonString = JSON.stringify(qTable, replacer, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    ajustarTamanhos();
    reposicionarPainelIA();
    reposicionarBotoes();
}
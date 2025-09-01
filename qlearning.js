class qlearningIA{

    constructor(alpha = 0.1, gamma = 0.9, epsilon = 1.0){

        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.decaimentoEpsilon = 0.9995;
        this.minimoEpsilon = 0.1;

        this.tabelaQ = new Map();

    }

    chaveTabuleiro(tabuleiro){
        return tabuleiro.flat().map(celula => celula || '_').join('');
    }

    obterValorQ(chaveTabuleiro,acao){

        if(!this.tabelaQ.has(chaveTabuleiro)){

            this.tabelaQ.set(chaveTabuleiro,new Map());

        }

        const pontuacao = this.tabelaQ.get(chaveTabuleiro).get(acao);

        return pontuacao || 0.0;

    }

    reduzirEpsilon(){

        if(this.epsilon > this.minimoEpsilon){

            this.epsilon *= this.decaimentoEpsilon;

        }

    }

    atualizarTabelaQ(chaveTabuleiro,acao,recompensa, proximaChaveDoEstado, acoesDoProximoEstado){

        const valorQAntigo = this.obterValorQ(chaveTabuleiro,acao);

        let proximoValorQMaximo = 0;

        if (acoesDoProximoEstado.length > 0) {
            
            const proximosValoresQ = acoesDoProximoEstado.map(proximaAcao =>
                this.obterValorQ(proximaChaveDoEstado, proximaAcao)
            );
    
            proximoValorQMaximo = Math.max(...proximosValoresQ);
        }

        const novoValorQ = valorQAntigo + this.alpha * (recompensa + this.gamma * proximoValorQMaximo - valorQAntigo);

        this.tabelaQ.get(chaveTabuleiro).set(acao, novoValorQ);


    }

escolherAcao(tabuleiro, acoesDisponiveis) {
    const chaveTabuleiro = this.chaveTabuleiro(tabuleiro);

    if (Math.random() < this.epsilon) {
        
        const indexAleatorio = Math.floor(Math.random() * acoesDisponiveis.length);
        return acoesDisponiveis[indexAleatorio];

    } else {
        let melhorAcao = -1;
        let maiorValorQ = -Infinity;

        for (const acao of acoesDisponiveis) {
            const valorQ = this.obterValorQ(chaveTabuleiro, acao);
            if (valorQ > maiorValorQ) {
                maiorValorQ = valorQ;
                melhorAcao = acao;
            }
        }
        
        if (melhorAcao === -1) {
            const indexAleatorio = Math.floor(Math.random() * acoesDisponiveis.length);
            return acoesDisponiveis[indexAleatorio];
        }

        return melhorAcao;
    }
}

}


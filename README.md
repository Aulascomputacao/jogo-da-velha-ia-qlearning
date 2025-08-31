# 🤖 Jogo da Velha com IA de Aprendizado por Reforço

Este projeto é uma implementação web do clássico Jogo da Velha, com um oponente de Inteligência Artificial que utiliza o algoritmo de **Q-Learning** para aprender e melhorar seu jogo de forma autônoma.

## 🎯 Objetivo

O objetivo principal deste projeto é demonstrar a aplicação prática de algoritmos de **Aprendizado por Reforço (Reinforcement Learning)** em um ambiente de jogo simples. A IA não possui regras pré-programadas de como jogar; em vez disso, ela desenvolve suas próprias estratégias através de treinamento, com um foco especial em um sistema de **"aprendizado por derrota"**, onde melhora seu desempenho a cada vez que perde para um jogador humano.

## ✨ Funcionalidades

* **Interface Gráfica Responsiva:** Desenhada com a biblioteca `p5.js`, a interface se adapta a diferentes tamanhos de tela, com elementos visuais dinâmicos.
* **IA com Q-Learning:** O oponente é controlado por um agente que toma decisões baseadas em uma Tabela Q, refinada através de treinamento contínuo.
* **Aprendizado por Derrota:** A IA executa um ciclo de treinamento adicional a cada vez que é derrotada pelo jogador, tornando-se progressivamente mais desafiadora.
* **Treinamento Inicial:** Ao iniciar o jogo, a IA passa por um treinamento básico para garantir que ela não comece com conhecimento zero.
* **Análise do Aprendizado:** A cada ciclo de treinamento pós-derrota, o jogo permite o download da Tabela Q em um arquivo `.json`, servindo como uma "prova material" da evolução do cérebro da IA.
* **Design Polido:** Interface com tema escuro, fontes customizadas, botões estilizados e animações de feedback para uma experiência de usuário mais agradável.

## 🚀 Tecnologias Utilizadas

* **JavaScript (ES6+)**
* **p5.js:** Biblioteca principal para o desenho no canvas, interatividade e gerenciamento do loop de jogo.
* **p5.dom.js:** Extensão da `p5.js` utilizada para a criação e manipulação de elementos HTML, como os botões.
* **HTML5 & CSS:** Para a estrutura da página e estilização dos elementos via JavaScript.
* **Node.js & npm (Ambiente de Desenvolvimento):** Utilizados para gerenciar as dependências do projeto e rodar um servidor local.

## ⚙️ Como Executar

Este projeto utiliza o Node.js e o npm para gerenciar suas dependências.

1.  **Clone o Repositório:**
    ```bash
    git clone https://[URL_DO_SEU_REPOSITORIO_NO_GITHUB]
    ```

2.  **Instale as Dependências:**
    Navegue até a pasta do projeto no seu terminal e execute o comando:
    ```bash
    npm install
    ```
    Este comando irá ler o arquivo `package.json` e baixar todas as ferramentas necessárias para a pasta `node_modules`.

3.  **Inicie o Servidor de Desenvolvimento:**
    O `package.json` geralmente contém um script para iniciar o projeto. O comando mais comum é:
    ```bash
    npm start
    ```
    Isso deve iniciar um servidor local e abrir o jogo automaticamente no seu navegador.

> **Nota Importante:** Lembre-se de criar um arquivo `.gitignore` na raiz do seu projeto e adicionar a linha `node_modules` dentro dele para evitar enviar essa pasta gigante para o GitHub.

## 🧠 Estrutura e Funcionamento

O código é dividido em duas partes lógicas principais: o agente da IA e o controlador do jogo.

### `qlearningIA.js` - O Cérebro da IA

Este arquivo contém a classe `qlearningIA`, que encapsula toda a lógica do agente de aprendizado:

* **`constructor`**: Inicializa a IA com seus hiperparâmetros (taxa de aprendizado `alpha`, fator de desconto `gamma`, e taxa de exploração `epsilon`) e cria a `tabelaQ`.
* **`escolherAcao()`**: O método de decisão. Com base no `epsilon`, decide entre fazer uma jogada aleatória (exploração) ou consultar a `tabelaQ` para escolher a melhor jogada conhecida (explotação).
* **`atualizarValorQ()`**: O método de aprendizado. Implementa a fórmula do Q-Learning para atualizar a pontuação de uma jogada com base na recompensa (`+1` por vitória, `-1` por derrota, `0` por empate) obtida no final de uma partida simulada.

### `sketch.js` - O Controlador do Jogo

Este arquivo é o coração do projeto, responsável por toda a interação, lógica e renderização do jogo.

* **Máquina de Estados (`modoDeJogo`)**: O fluxo do jogo é controlado pela variável `modoDeJogo`, que alterna entre os estados `menu_principal`, `escolha_jogador` e `jogando`. A função `draw()` direciona o que deve ser desenhado na tela a cada momento.
* **Treinamento (`treinarAgente`)**: É a "academia" da IA. Esta função simula milhares de partidas da IA contra si mesma para preencher a `tabelaQ` com experiência. Ela é chamada no início do jogo e a cada derrota da IA.
* **Lógica de Jogo (`jogarIA`, `mousePressed`, `finalizarPartida`)**: Gerenciam os turnos, validam as jogadas, verificam os resultados e acionam o ciclo de aprendizado.

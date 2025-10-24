[Read in English (en-US)](./README.md)

# Excel Expert AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um assistente com inteligência artificial que fornece respostas de especialista para suas perguntas sobre Excel. Obtenha soluções claras, práticas e completas, desde fórmulas simples até macros avançadas em VBA, tudo com o poder da API Google Gemini.

<!-- Adicione uma captura de tela ou GIF da aplicação aqui -->

## ✨ Principais Funcionalidades

-   **Ajuda Inteligente em Excel**: Faça qualquer pergunta sobre Excel e receba respostas de nível profissional.
-   **Geração de Fórmulas e VBA**: Obtenha macros VBA personalizadas e fórmulas complexas adaptadas às suas necessidades.
-   **Análise de Planilhas**: Faça o upload de seus arquivos `.xlsx`, `.xls` ou `.csv` para que a IA analise e forneça insights.
-   **Voz para Texto**: Use seu microfone para fazer perguntas diretamente (em português do Brasil).
-   **Destaque de Sintaxe**: Blocos de código para fórmulas do Excel e VBA são elegantemente destacados para facilitar a leitura.
-   **Exportação de Dados CSV**: Gere dados com base em suas solicitações e baixe-os como um arquivo `.csv`.
-   **Histórico de Chat Persistente**: Suas conversas são salvas automaticamente no navegador e podem ser revisitadas ou excluídas.
-   **Design Responsivo**: Uma interface limpa, moderna e totalmente responsiva que funciona em qualquer dispositivo.

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Modelo de IA**: [Google Gemini API](https://ai.google.dev/) (`gemini-flash-lite-latest`)
-   **Processamento de Planilhas**: [SheetJS (xlsx)](https://sheetjs.com/)
-   **Dependências**: Servidas via CDN com `importmap` para uma configuração sem necessidade de build.

## 🚀 Como Começar

Este projeto está configurado para rodar diretamente no navegador sem uma etapa de build, graças ao `importmap`. No entanto, para lidar com a chave de API de forma segura, é necessário um servidor de desenvolvimento local com suporte a variáveis de ambiente.

### Pré-requisitos

-   Um navegador web moderno (Chrome, Firefox, Safari, Edge).
-   Uma chave de API do Google Gemini. Você pode obter uma no [Google AI Studio](https://aistudio.google.com/app/apikey).

### Configuração do Ambiente Local

As chamadas à API Gemini falharão sem uma chave de API. Siga estes passos para uma configuração local adequada:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/excel-expert-ai.git
    cd excel-expert-ai
    ```

2.  **Crie um arquivo de ambiente:**
    Este projeto espera que a chave da API esteja disponível como uma variável de ambiente global. Para desenvolvimento local com uma ferramenta como o [Vite](https://vitejs.dev/), você pode criar um arquivo chamado `.env.local` na raiz do projeto:
    ```
    VITE_API_KEY=SUA_CHAVE_DE_API_GEMINI_AQUI
    ```
    *Observação: Você precisará ajustar `services/geminiService.ts` para ler a chave de `import.meta.env.VITE_API_KEY` em vez de `process.env.API_KEY` para que essa configuração funcione com o Vite.*

3.  **Instale um servidor de desenvolvimento (ex: Vite):**
    ```bash
    npm install -g vite
    ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    vite
    ```
    O Vite iniciará um servidor local e injetará as variáveis de ambiente, permitindo que a aplicação acesse sua chave de API. Abra a URL fornecida no seu terminal.

## ⚙️ Como Funciona

-   **Frontend**: A interface do usuário é uma aplicação de página única (SPA) construída com componentes React, gerenciando o estado das conversas, status de carregamento e entrada do usuário.
-   **Serviço Gemini (`services/geminiService.ts`)**: Este é o núcleo da interação com a IA.
    -   Ele inicializa o cliente da IA do Google Gemini.
    -   Inclui uma **instrução de sistema** detalhada que prepara o modelo para atuar como um especialista experiente em Excel em português, garantindo respostas consistentes e de alta qualidade.
    -   Gerencia o streaming das respostas do chat para uma sensação de tempo real.
-   **Manipulação de Arquivos**: Quando um usuário faz o upload de uma planilha, a biblioteca `xlsx` a processa no lado do cliente. O conteúdo é convertido para o formato CSV e adicionado ao início do prompt do usuário, dando contexto à IA para a consulta.
-   **Estado e Histórico**: O componente `App.tsx` gerencia o estado da aplicação. Todas as conversas são armazenadas no `localStorage` do navegador, permitindo que as sessões sejam persistidas.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

---
Feito por **Eleandro**

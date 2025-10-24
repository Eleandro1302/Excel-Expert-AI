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

Este projeto foi desenhado para rodar diretamente em qualquer navegador moderno, sem necessidade de instalação ou processos de build.

### Pré-requisitos

-   Um navegador web moderno (Chrome, Firefox, Safari, Edge).
-   Uma chave de API do Google Gemini. Você pode obter uma gratuitamente no [Google AI Studio](https://aistudio.google.com/app/apikey).

### Como Usar

1.  Abra o arquivo `index.html` no seu navegador ou acesse o link da aplicação.
2.  Ao iniciar o aplicativo pela primeira vez, uma janela solicitará que você insira sua chave de API do Gemini.
3.  Cole sua chave no campo e clique em "Salvar e Continuar".
4.  Pronto! Agora você pode começar a fazer perguntas. Sua chave fica salva no armazenamento local do seu navegador para futuras visitas. Você pode alterá-la a qualquer momento usando o botão "Gerenciar Chave de API" na barra lateral.

## ⚙️ Como Funciona

-   **Frontend**: A interface do usuário é uma aplicação de página única (SPA) construída com componentes React, gerenciando o estado das conversas, status de carregamento e entrada do usuário.
-   **Gerenciamento da Chave de API**: O aplicativo solicita a chave de API do Gemini ao usuário no primeiro uso e a armazena de forma segura no `localStorage` do navegador. Isso permite que o aplicativo seja totalmente do lado do cliente e hospedado em qualquer plataforma estática.
-   **Serviço Gemini (`services/geminiService.ts`)**: Este é o núcleo da interação com a IA.
    -   Ele inicializa o cliente da IA do Google Gemini usando a chave de API armazenada.
    -   Inclui uma **instrução de sistema** detalhada que prepara o modelo para atuar como um especialista experiente em Excel em português, garantindo respostas consistentes e de alta qualidade.
    -   Gerencia o streaming das respostas do chat para uma sensação de tempo real.
-   **Manipulação de Arquivos**: Quando um usuário faz o upload de uma planilha, a biblioteca `xlsx` a processa no lado do cliente. O conteúdo é convertido para o formato CSV e adicionado ao início do prompt do usuário, dando contexto à IA para a consulta.
-   **Estado e Histórico**: O componente `App.tsx` gerencia o estado da aplicação. Todas as conversas também são armazenadas no `localStorage` do navegador, permitindo que as sessões sejam persistidas.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

---
Feito por **Eleandro**

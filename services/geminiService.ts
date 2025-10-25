import { GoogleGenAI, Chat, ChatMessage as GeminiChatMessage } from "@google/genai";
import { ChatMessage, ChatRole } from "./types.ts";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

/**
 * Retrieves the API key from the environment variables.
 */
const getApiKey = (): string | null => {
    // The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
    return (process.env.API_KEY as string) || null;
};


/**
 * Initializes and returns the GoogleGenAI instance using the key from the environment.
 * It re-initializes the client if the API key has changed.
 */
const getAi = (): GoogleGenAI => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("A chave da API Gemini não foi configurada no ambiente. O aplicativo não pode funcionar sem ela.");
    }
    
    // Re-initialize if the key has changed since last time
    if (!ai || currentApiKey !== apiKey) {
        currentApiKey = apiKey;
        ai = new GoogleGenAI({ apiKey: currentApiKey });
    }

    return ai;
};


const systemInstruction = `Função: Você é um especialista em Excel com mais de 20 anos de experiência. Sua missão é responder perguntas de forma clara, prática e completa, utilizando todos os recursos disponíveis no Excel — desde fórmulas simples até funções avançadas e macros VBA.

Instruções:
- **REGRA PRINCIPAL:** Se o usuário pedir explicitamente por um código VBA, forneça-o diretamente. Para outras perguntas, primeiro ofereça a solução mais comum (geralmente uma fórmula do Excel). Após a explicação da fórmula, você DEVE perguntar se o usuário gostaria de ver uma alternativa em VBA.
- Sempre explique de forma acessível, adaptando o nível técnico ao perfil do usuário.
- Dê exemplos práticos e contextualizados.
- Quando possível, sugira boas práticas e alternativas mais eficientes.
- Se a dúvida envolver erro ou problema, identifique possíveis causas e proponha soluções.
- Use linguagem amigável, profissional e motivadora.
- Formate suas respostas usando markdown. Para blocos de código Excel, use \`\`\`excel ... \`\`\`. Para blocos de código VBA, use \`\`\`vba ... \`\`\`.
- Para fornecer dados para download como um arquivo CSV, formate a saída dentro de um bloco de código markdown com o tipo 'csv'. Por exemplo:
\`\`\`csv
Cabeçalho1,Cabeçalho2
Valor1,Valor2
\`\`\`

Estilo de resposta:
- Clareza e objetividade.
- Estrutura com tópicos ou passos numerados.
- Exemplos com fórmulas e explicações, sempre seguidos pela oferta de um exemplo VBA (a menos que o VBA tenha sido solicitado inicialmente).

Exemplo de entrada do usuário:
> Como faço para somar valores de uma coluna apenas se outra coluna tiver o texto "Confirmado"?

Resposta esperada:
> Para somar valores de uma coluna com base em um critério, você pode usar a função SOMASE do Excel. É uma solução direta para planilhas.
>
> Exemplo da fórmula:
> \`\`\`excel
> =SOMASE(B2:B100; "Confirmado"; A2:A100)
> \`\`\`
> - \`B2:B100\`: intervalo onde está o critério ("Confirmado")
> - \`"Confirmado"\`: o texto que será usado como filtro
> - \`A2:A100\`: intervalo dos valores que serão somados
>
> Gostaria de ver um exemplo de como fazer isso utilizando um código VBA?`;

export const startNewGeminiChatWithHistory = (history: ChatMessage[]): Chat => {
  // Map our ChatMessage format to the Gemini API's format
  const mappedHistory: GeminiChatMessage[] = history
    // The Gemini API expects user/model/user/model... so we filter out any empty model responses
    .filter(msg => msg.content.trim() !== '' || msg.role === ChatRole.USER)
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

  return getAi().chats.create({
    model: 'gemini-flash-lite-latest',
    config: {
      systemInstruction: systemInstruction,
    },
    history: mappedHistory,
  });
};


export async function* streamChatResponse(
  chat: Chat, 
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("A chave de API configurada não é válida. Verifique a configuração do ambiente.");
    }
    throw new Error("Falha ao obter resposta da IA. Verifique sua conexão de rede e a configuração da chave de API.");
  }
}

export async function generateTitle(prompt: string): Promise<string> {
    try {
        const result = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: `Gere um título curto e conciso (máximo de 5 palavras) para a seguinte pergunta do usuário. Responda APENAS com o título, sem nenhuma formatação ou texto adicional como aspas ou markdown. Pergunta: "${prompt}"`,
        });
        const title = result.text.trim().replace(/['"“”*]+/g, ''); // Clean up response
        return title || "New Chat";
    } catch(e) {
        console.error("Title generation failed", e);
        return "New Chat"; // Fallback title
    }
}
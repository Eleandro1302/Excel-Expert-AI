
export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

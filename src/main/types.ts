export interface Session {
  id: string;
  createdAt: Date;
  moves: Array<{ from: string; to: string }>;
}

export interface Config {
  enabledCategories: string[];
}


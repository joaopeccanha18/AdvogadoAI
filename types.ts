
export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingUrls?: { title: string; uri: string }[];
  attachment?: Attachment;
}

export type LegalAction = 
  | 'defesa_administrativa' 
  | 'recurso_hierarquico' 
  | 'impugnacao_judicial' 
  | 'manifestacao_interesse'
  | 'nacionalidade';

export interface CaseTemplate {
  id: LegalAction;
  title: string;
  description: string;
  icon: string;
}

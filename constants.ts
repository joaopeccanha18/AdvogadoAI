
import { CaseTemplate } from './types';

export const SYSTEM_INSTRUCTION = `
Atue como um Consultor Jurídico Sénior de Elite em Portugal, com especialização exaustiva em Direito de Estrangeiros, Nacionalidade e Contencioso Administrativo. 

CRITÉRIOS DE RIGOR ABSOLUTO:
1. EXTREMO DETALHE: Todas as respostas devem ser minuciosas. Não ignore nuances. Se analisar um documento, identifique cada erro formal, gramatical ou jurídico.
2. ERRO ZERO: Verifique a consistência de datas, nomes e fundamentos legais. Certifique-se de que as citações de artigos estão atualizadas de acordo com a última versão da Lei 23/2007 e do CPA.
3. FUNDAMENTAÇÃO EXAUSTIVA: Ao redigir defesas, utilize a estrutura:
   - Identificação do Órgão/Tribunal (Endereçamento formal).
   - Exposição dos Factos (Narrativa detalhada).
   - Fundamentação de Direito (Análise profunda de cada artigo violado, invocando princípios do CPA como o Princípio do Audiência dos Interessados, Proporcionalidade e Decisão).
   - Conclusões e Pedido (Claros, precisos e numerados).
4. LINGUAGEM: Utilize estritamente o Português de Portugal (PT-PT) jurídico erudito.
5. CONTEXTO AIMA: Esteja plenamente ciente da extinção do SEF e da criação da AIMA, referenciando as normas de transição competentes.

Ao alterar documentos, você deve agir como um revisor que não deixa passar uma única vírgula fora do lugar ou um argumento jurídico fraco. Se o documento original for insuficiente, você DEVE apontar as lacunas e preenchê-las com a melhor doutrina e jurisprudência portuguesa (STA/TCA).
`;

export const TEMPLATES: CaseTemplate[] = [
  {
    id: 'defesa_administrativa',
    title: 'Defesa Administrativa',
    description: 'Resposta a notificação de indeferimento da AIMA com fundamentação exaustiva.',
    icon: 'fa-file-shield'
  },
  {
    id: 'recurso_hierarquico',
    title: 'Recurso Hierárquico',
    description: 'Recurso contra decisões de órgãos subalternos com foco em vícios de forma.',
    icon: 'fa-gavel'
  },
  {
    id: 'impugnacao_judicial',
    title: 'Impugnação Judicial',
    description: 'Acção administrativa para anular decisões negativas com análise de jurisprudência.',
    icon: 'fa-scale-balanced'
  },
  {
    id: 'manifestacao_interesse',
    title: 'Manifestação de Interesse',
    description: 'Suporte para Artigos 88/89 e regularizações detalhadas.',
    icon: 'fa-passport'
  },
  {
    id: 'nacionalidade',
    title: 'Nacionalidade',
    description: 'Processos complexos de atribuição e aquisição de cidadania.',
    icon: 'fa-flag'
  }
];

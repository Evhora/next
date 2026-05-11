import type { Question } from "../proto/v1/question_pb";
import { Phase } from "../proto/v1/session_pb";

export const QUESTION_BANK: Question[] = [
  // CHILDHOOD
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "childhood-1",
    phase: Phase.CHILDHOOD,
    prompt: "Que atividade você fazia quando criança que te fazia esquecer o tempo?",
    placeholder: "Ex: ficava horas desenhando, jogando, lendo...",
    followUpHint: "O que especificamente nessa atividade te prendia tanto?",
    order: 1,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "childhood-2",
    phase: Phase.CHILDHOOD,
    prompt: "Que adulto você admirava quando tinha 10 anos e por quê?",
    placeholder: "Pode ser alguém da família, personagem, atleta...",
    followUpHint: "Que qualidade nessa pessoa te chamava mais atenção?",
    order: 2,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "childhood-3",
    phase: Phase.CHILDHOOD,
    prompt: "Se pudesse voltar e passar um dia perfeito com 8 anos de idade, o que você estaria fazendo?",
    placeholder: "Descreva o dia inteiro...",
    followUpHint: "O que tornaria esse dia perfeito, especificamente?",
    order: 3,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "childhood-4",
    phase: Phase.CHILDHOOD,
    prompt: "O que você queria ser quando crescesse? E por que essa profissão?",
    placeholder: "Astronauta, veterinária, artista...",
    followUpHint: "Qual parte desse sonho ainda faz sentido hoje?",
    order: 4,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "childhood-5",
    phase: Phase.CHILDHOOD,
    prompt: "Qual brincadeira ou jogo você amava tanto que insistia para os outros participarem?",
    placeholder: "Descreva a brincadeira e o que a tornava especial...",
    followUpHint: "O que havia de único nessa experiência que você precisava compartilhar?",
    order: 5,
  },

  // ENVY
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "envy-1",
    phase: Phase.ENVY,
    prompt: "Que tipo de conquista alheia faz você sentir uma pontada — mesmo que você não admita para ninguém?",
    placeholder: "Pode ser de um colega, alguém nas redes sociais...",
    followUpHint: "O que especificamente nessa conquista te afeta?",
    order: 1,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "envy-2",
    phase: Phase.ENVY,
    prompt: "Quem você segue nas redes que te inspira E incomoda ao mesmo tempo?",
    placeholder: "Descreva o perfil ou tipo de pessoa...",
    followUpHint: "O que eles têm ou fazem que você secretamente quer?",
    order: 2,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "envy-3",
    phase: Phase.ENVY,
    prompt: "Qual notícia de sucesso de alguém do seu passado te fez sentir algo difícil de nomear?",
    placeholder: "Um ex-colega, alguém que você conhecia...",
    followUpHint: "Que caminho de vida essa pessoa seguiu que te chama atenção?",
    order: 3,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "envy-4",
    phase: Phase.ENVY,
    prompt: "Se você pudesse acordar amanhã vivendo a vida de outra pessoa — mantendo seus valores — de quem seria?",
    placeholder: "Pode ser real ou fictícia...",
    followUpHint: "Que parte específica da vida dessa pessoa você quer?",
    order: 4,
  },

  // ENERGY
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "energy-1",
    phase: Phase.ENERGY,
    prompt: "Quais atividades te deixam animado só de pensar que vai fazer?",
    placeholder: "Descreva as atividades que te energizam...",
    followUpHint: "O que nessas atividades te dá energia?",
    order: 1,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "energy-2",
    phase: Phase.ENERGY,
    prompt: "Em que tipo de conversa você perde completamente a noção do tempo?",
    placeholder: "Sobre qual tema, com que tipo de pessoa...",
    followUpHint: "O que essa conversa tem que te prende tanto?",
    order: 2,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "energy-3",
    phase: Phase.ENERGY,
    prompt: "Que problema do mundo, quando você lê sobre ele, te dá uma vontade forte de fazer algo?",
    placeholder: "Desigualdade, saúde, educação, meio ambiente...",
    followUpHint: "O que especificamente nesse problema te move?",
    order: 3,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "energy-4",
    phase: Phase.ENERGY,
    prompt: "Quando foi a última vez que você estava tão focado que até esqueceu de comer? O que estava fazendo?",
    placeholder: "Descreva a situação...",
    followUpHint: "O que havia nessa tarefa que te absorveu completamente?",
    order: 4,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "energy-5",
    phase: Phase.ENERGY,
    prompt: "Que habilidade sua — mesmo que óbvia para você — as pessoas sempre comentam ou pedem ajuda?",
    placeholder: "Algo que parece fácil para você mas difícil para outros...",
    followUpHint: "Como você se sente quando usa essa habilidade?",
    order: 5,
  },

  // MONEY
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "money-1",
    phase: Phase.MONEY,
    prompt: "Se você tivesse 10 milhões de reais agora, o que faria no primeiro mês? E depois?",
    placeholder: "Seja específico — o que realmente faria...",
    followUpHint: "Depois que resolvesse o básico, o que ocuparia seus dias?",
    order: 1,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "money-2",
    phase: Phase.MONEY,
    prompt: "Em que você gasta dinheiro sem culpa, mesmo quando está apertado?",
    placeholder: "Livros, experiências, equipamentos...",
    followUpHint: "Por que especificamente esses gastos valem para você?",
    order: 2,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "money-3",
    phase: Phase.MONEY,
    prompt: "Que tipo de trabalho você faria de graça se não precisasse de dinheiro?",
    placeholder: "Descreva o trabalho, não a causa...",
    followUpHint: "O que nesse trabalho tornaria a troca justa mesmo sem pagamento?",
    order: 3,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "money-4",
    phase: Phase.MONEY,
    prompt: "Qual é o estilo de vida que, quando você imagina, soa como 'isso é tudo que eu preciso'?",
    placeholder: "Descreva o dia a dia, não o dinheiro...",
    followUpHint: "Que elemento desse estilo de vida é inegociável para você?",
    order: 4,
  },

  // PAIN
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "pain-1",
    phase: Phase.PAIN,
    prompt: "Qual foi o momento mais difícil da sua vida? O que você aprendeu que só ele podia ensinar?",
    placeholder: "Pode compartilhar o quanto quiser...",
    followUpHint: "Como essa experiência mudou o que você valoriza?",
    order: 1,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "pain-2",
    phase: Phase.PAIN,
    prompt: "Que problema você passou que te faz querer que ninguém mais passe pelo mesmo?",
    placeholder: "Descreva o problema, não precisa ser dramático...",
    followUpHint: "O que você faria para ajudar alguém nessa situação hoje?",
    order: 2,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "pain-3",
    phase: Phase.PAIN,
    prompt: "Onde você sente que desperdiçou anos da sua vida? O que te impediu de seguir outro caminho?",
    placeholder: "Seja honesto — esse espaço é seguro...",
    followUpHint: "O que esse tempo 'perdido' te mostrou sobre o que realmente importa?",
    order: 3,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "pain-4",
    phase: Phase.PAIN,
    prompt: "Que crítica você mais recebe que te incomoda profundamente — mas no fundo sabe que tem alguma verdade?",
    placeholder: "Não precisa concordar 100%, mas alguma parte ressoa...",
    followUpHint: "O que essa crítica aponta sobre quem você quer ser?",
    order: 4,
  },

  // DEATH
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "death-1",
    phase: Phase.DEATH,
    prompt: "Que frase você gostaria que dissessem sobre você no seu funeral?",
    placeholder: "Não o que diriam hoje — o que você quer que digam...",
    followUpHint: "Que vida precisaria viver para merecer essas palavras?",
    order: 1,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "death-2",
    phase: Phase.DEATH,
    prompt: "Com 85 anos olhando para trás, qual arrependimento te doeria mais se acontecesse?",
    placeholder: "Não tentei, não falei, não mudei...",
    followUpHint: "O que precisaria acontecer nos próximos anos para evitar esse arrependimento?",
    order: 2,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "death-3",
    phase: Phase.DEATH,
    prompt: "Que legado — concreto, não poético — você quer deixar? Para quem?",
    placeholder: "Uma obra, uma mudança, uma geração impactada...",
    followUpHint: "Por que especificamente para essas pessoas ou área?",
    order: 3,
  },
  {
    $typeName: "modules.discovery.proto.v1.Question",
    id: "death-4",
    phase: Phase.DEATH,
    prompt: "Se soubesse que tem 5 anos de vida, o que mudaria amanhã?",
    placeholder: "Seja honesto sobre o que realmente mudaria...",
    followUpHint: "O que essa resposta revela sobre suas prioridades reais?",
    order: 4,
  },
];

export const QUESTIONS_BY_ID = new Map<string, Question>(
  QUESTION_BANK.map((q) => [q.id, q]),
);

export const QUESTIONS_BY_PHASE = new Map<Phase, Question[]>();
for (const q of QUESTION_BANK) {
  const existing = QUESTIONS_BY_PHASE.get(q.phase) ?? [];
  QUESTIONS_BY_PHASE.set(q.phase, [...existing, q]);
}

export const PHASE_ORDER: Phase[] = [
  Phase.CHILDHOOD,
  Phase.ENVY,
  Phase.ENERGY,
  Phase.MONEY,
  Phase.PAIN,
  Phase.DEATH,
];

export const firstQuestionForPhase = (phase: Phase): Question | undefined =>
  QUESTIONS_BY_PHASE.get(phase)?.[0];

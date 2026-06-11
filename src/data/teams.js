const teams = {
  // Group A
  MEXICO: { name: 'México', code: 'MX', group: 'A', rank: 15 },
  AFRICA_SUL: { name: 'África do Sul', code: 'ZA', group: 'A', rank: 60 },
  COREIA_SUL: { name: 'Coreia do Sul', code: 'KR', group: 'A', rank: 23 },
  REP_TCHECA: { name: 'República Tcheca', code: 'CZ', group: 'A', rank: 36 },

  // Group B
  CANADA: { name: 'Canadá', code: 'CA', group: 'B', rank: 40 },
  BOSNIA: { name: 'Bósnia e Herzegovina', code: 'BA', group: 'B', rank: 58 },
  CATAR: { name: 'Catar', code: 'QA', group: 'B', rank: 49 },
  SUICA: { name: 'Suíça', code: 'CH', group: 'B', rank: 14 },

  // Group C
  BRASIL: { name: 'Brasil', code: 'BR', group: 'C', rank: 5 },
  MARROCOS: { name: 'Marrocos', code: 'MA', group: 'C', rank: 12 },
  HAITI: { name: 'Haiti', code: 'HT', group: 'C', rank: 82 },
  ESCOCIA: { name: 'Escócia', code: 'GB-SCT', group: 'C', rank: 34 },

  // Group D
  USA: { name: 'Estados Unidos', code: 'US', group: 'D', rank: 11 },
  PARAGUAI: { name: 'Paraguai', code: 'PY', group: 'D', rank: 52 },
  AUSTRALIA: { name: 'Austrália', code: 'AU', group: 'D', rank: 27 },
  TURQUIA: { name: 'Turquia', code: 'TR', group: 'D', rank: 29 },

  // Group E
  ALEMANHA: { name: 'Alemanha', code: 'DE', group: 'E', rank: 9 },
  CURACAO: { name: 'Curaçao', code: 'CW', group: 'E', rank: 90 },
  COSTA_MARFIM: { name: 'Costa do Marfim', code: 'CI', group: 'E', rank: 38 },
  EQUADOR: { name: 'Equador', code: 'EC', group: 'E', rank: 31 },

  // Group F
  HOLANDA: { name: 'Holanda', code: 'NL', group: 'F', rank: 6 },
  JAPAO: { name: 'Japão', code: 'JP', group: 'F', rank: 17 },
  SUECIA: { name: 'Suécia', code: 'SE', group: 'F', rank: 26 },
  TUNISIA: { name: 'Tunísia', code: 'TN', group: 'F', rank: 33 },

  // Group G
  BELGICA: { name: 'Bélgica', code: 'BE', group: 'G', rank: 8 },
  EGITO: { name: 'Egito', code: 'EG', group: 'G', rank: 35 },
  IRA: { name: 'Irã', code: 'IR', group: 'G', rank: 21 },
  NOVA_ZELANDIA: { name: 'Nova Zelândia', code: 'NZ', group: 'G', rank: 104 },

  // Group H
  ESPANHA: { name: 'Espanha', code: 'ES', group: 'H', rank: 3 },
  CABO_VERDE: { name: 'Cabo Verde', code: 'CV', group: 'H', rank: 66 },
  ARABIA: { name: 'Arábia Saudita', code: 'SA', group: 'H', rank: 53 },
  URUGUAI: { name: 'Uruguai', code: 'UY', group: 'H', rank: 16 },

  // Group I
  FRANCA: { name: 'França', code: 'FR', group: 'I', rank: 2 },
  SENEGAL: { name: 'Senegal', code: 'SN', group: 'I', rank: 19 },
  IRAQUE: { name: 'Iraque', code: 'IQ', group: 'I', rank: 59 },
  NORUEGA: { name: 'Noruega', code: 'NO', group: 'I', rank: 44 },

  // Group J
  ARGENTINA: { name: 'Argentina', code: 'AR', group: 'J', rank: 1 },
  ARGELIA: { name: 'Argélia', code: 'DZ', group: 'J', rank: 30 },
  AUSTRIA: { name: 'Áustria', code: 'AT', group: 'J', rank: 25 },
  JORDANIA: { name: 'Jordânia', code: 'JO', group: 'J', rank: 70 },

  // Group K
  PORTUGAL: { name: 'Portugal', code: 'PT', group: 'K', rank: 7 },
  RD_CONGO: { name: 'RD Congo', code: 'CD', group: 'K', rank: 64 },
  UZBEQUISTAO: { name: 'Uzbequistão', code: 'UZ', group: 'K', rank: 74 },
  COLOMBIA: { name: 'Colômbia', code: 'CO', group: 'K', rank: 22 },

  // Group L
  INGLATERRA: { name: 'Inglaterra', code: 'GB-ENG', group: 'L', rank: 4 },
  CROACIA: { name: 'Croácia', code: 'HR', group: 'L', rank: 13 },
  GANA: { name: 'Gana', code: 'GH', group: 'L', rank: 61 },
  PANAMA: { name: 'Panamá', code: 'PA', group: 'L', rank: 45 },
};

export function getFlagUrl(code, size = 24) {
  if (!code) return '';
  if (code === 'GB-SCT') return `https://flagcdn.com/${size > 24 ? 'w40' : 'w20'}/gb-sct.png`;
  if (code === 'GB-ENG') return `https://flagcdn.com/${size > 24 ? 'w40' : 'w20'}/gb-eng.png`;
  return `https://flagcdn.com/${size > 24 ? 'w40' : 'w20'}/${code.toLowerCase()}.png`;
}

export const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const stageLabels = {
  group: 'Fase de Grupos',
  round32: 'Oitavas de Final (32)',
  round16: 'Oitavas de Final (16)',
  quarter: 'Quartas de Final',
  semi: 'Semifinal',
  third: 'Disputa de 3º Lugar',
  final: 'Grande Final',
};

export default teams;

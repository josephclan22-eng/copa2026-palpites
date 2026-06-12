const blockedWords = [
  'caralho', 'porra', 'puta', 'puto', 'merda', 'bosta', 'cuzao', 'cusão',
  'fdp', 'filho da puta', 'filha da puta', 'vai tomar no cu', 'vtnc',
  'arrombado', 'arrombada', 'babaca', 'boceta', 'buceta', 'bunda',
  'cacete', 'caga', 'cagão', 'cagona', 'caralho', 'cornão', 'corna',
  'crl', 'cu', 'desgraça', 'desgraca', 'foda', 'fode', 'fodão',
  'fodendo', 'fuder', 'fodeu', 'fodido', 'fodida', 'fodase', 'foda-se',
  'guei', 'gay', 'idiota', 'imbecil', 'jumento', 'lixo', 'otário', 'otaria',
  'pau no cu', 'pau', 'pica', 'porra', 'pqp', 'puta que pariu', 'puta merda',
  'putaria', 'puto', 'safado', 'safada', 'tarado', 'tarada', 'tefode',
  'vadia', 'vadio', 'vagabundo', 'vagabunda', 'viado', 'viadinho',
  'xota', 'xana', 'xoxota', 'xibiu', 'rola', 'rola',
  'broxa', 'brocha', 'chupar', 'chupa', 'chupeta',
  'grelo', 'grelinho', 'pentelho', 'pentelha',
  'pinto', 'pintinho', 'bucetao', 'bucetão',
  'corno', 'corna', 'chifrudo', 'chifruda',
  'escroto', 'escrota', 'esculhambado', 'esculhambada',
  'mija', 'mijar', 'mijo', 'peido', 'peidar', 'peidado',
  'punheta', 'punheteiro', 'siririca', 'bater punheta',
  'putinha', 'putinho', 'prostituta', 'prostituto',
  'piranha', 'piranhão', 'piranhona',
  'cachorra', 'cachorro', 'vaca', 'boi',
  'retardado', 'retardada', 'mongol', 'mongoloide',
  'drogado', 'drogada', 'noia', 'noiado', 'noiada',
  'macaco', 'macaca', 'negrinha', 'negrinhas',
  'criolo', 'crioula', 'crioulo',
  'alemão', 'alemã', 'japa', 'japonesa', 'japonês',
  'veado', 'veadinha', 'baitola', 'bichinha', 'bichona',
  'traveco', 'travesti', 'travecão',
  'assassino', 'assassina', 'bandido', 'bandida',
  'ladrão', 'ladra', 'ladroa', 'ladrona',
  'nojento', 'nojenta', 'nojeira',
  'arregão', 'arregona', 'cagao', 'cagona',
  'incompetente', 'inutil', 'inútil', 'burro', 'burra',
  'burrão', 'burrona', 'analfabeto', 'analfabeta',
  'pilantra', 'pilantrão', 'pilantrona',
  'canalha', 'canalhão', 'canalhona',
  'safado', 'safada', 'semvergonha', 'sem vergonha',
  'diabo', 'inferno', 'demo', 'demonio', 'demônio',
]

export function containsProfanity(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return blockedWords.some(word => {
    const w = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const regex = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(lower)
  })
}

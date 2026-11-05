interface SevenSegmentDisplayProps {
  /** Digitos, `-` ou espaco; o que nao for desenhavel vira celula apagada. */
  readonly text: string;
  /** Valor real em texto para leitor de tela (o desenho e so visual). */
  readonly label?: string;
  readonly unit?: string;
}

type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

/** Cada segmento e um hexagono fino na celula de 10 x 18. */
const SEGMENT_POINTS: Readonly<Record<Segment, string>> = {
  a: '1,1 2,0 8,0 9,1 8,2 2,2',
  b: '9,1 10,2 10,8 9,9 8,8 8,2',
  c: '9,9 10,10 10,16 9,17 8,16 8,10',
  d: '1,17 2,16 8,16 9,17 8,18 2,18',
  e: '1,9 2,10 2,16 1,17 0,16 0,10',
  f: '1,1 2,2 2,8 1,9 0,8 0,2',
  g: '1,9 2,8 8,8 9,9 8,10 2,10',
};
const SEGMENTS = Object.keys(SEGMENT_POINTS) as Segment[];

const LIT: Readonly<Record<string, string>> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abdeg',
  '3': 'abcdg',
  '4': 'bcfg',
  '5': 'acdfg',
  '6': 'acdefg',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
};

const MIN_CELLS = 4;
const CELL_WIDTH = 10;
const CELL_GAP = 3;
const CELL_HEIGHT = 18;

/**
 * Mostrador de 7 segmentos em SVG proprio: painel escuro com digitos vermelhos de LED (cor fixa, igual nos dois temas, sem relacao com alerta),
 * segmentos apagados com pouca opacidade. Alinhado a direita, com no minimo 4 celulas.
 */
export function SevenSegmentDisplay({ text, label, unit }: SevenSegmentDisplayProps) {
  const chars = [...text.padStart(MIN_CELLS, ' ')];
  const width = chars.length * (CELL_WIDTH + CELL_GAP) - CELL_GAP;
  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-neutral-900 px-2 py-1 text-red-500">
      {label !== undefined && <span className="sr-only">{label}</span>}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${width} ${CELL_HEIGHT}`}
        className="h-8 w-auto"
        focusable="false"
      >
        {chars.map((char, index) => {
          const lit = LIT[char] ?? '';
          return (
            <g
              key={index}
              data-char={char}
              transform={`translate(${index * (CELL_WIDTH + CELL_GAP)} 0)`}
            >
              {SEGMENTS.map((segment) => {
                const on = lit.includes(segment);
                return (
                  <polygon
                    key={segment}
                    data-segment={segment}
                    data-lit={on}
                    points={SEGMENT_POINTS[segment]}
                    fill="currentColor"
                    className={on ? undefined : 'opacity-15'}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      {unit !== undefined && (
        <span aria-hidden="true" className="text-xs font-medium">
          {unit}
        </span>
      )}
    </span>
  );
}

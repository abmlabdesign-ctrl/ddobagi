/**
 * 한글 → 로마자 (국어의 로마자 표기법, 발음 기준).
 *
 * 미션 문장의 모든 낱말에 발음 툴팁을 띄우기 위한 기기 안 변환입니다. 서버도
 * 사전도 없이 규칙만으로 하므로 범위를 정해 둡니다.
 *  - 연음(값이 → gapsi, 주말에는 → jumareneun)
 *  - 비음화(합니다 → hamnida, 국물 → gungmul)
 *  - 유음화(신라 → silla, 설날 → seollal)와 ㄹ의 ㄴ 되기(심리 → simni)
 *  - 받침 ㅎ + ㄱ·ㄷ·ㅈ 거센소리(좋다 → jota), 받침 ㅎ + 모음은 탈락(좋아 → joa)
 * 구개음화(같이 → gachi)처럼 낱말마다 다른 예외는 다루지 않습니다. 데이터에
 * `romanization`이 적힌 낱말은 언제나 그 값이 우선입니다.
 */

const INITIALS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const VOWELS = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];

// 받침 번호(0 = 없음): ㄱ ㄲ ㄳ ㄴ ㄵ ㄶ ㄷ ㄹ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅁ ㅂ ㅄ ㅅ ㅆ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ
const F = {
  none: 0, g: 1, kk: 2, gs: 3, n: 4, nj: 5, nh: 6, d: 7, l: 8, lg: 9, lm: 10, lb: 11,
  ls: 12, lt: 13, lp: 14, lh: 15, m: 16, b: 17, bs: 18, s: 19, ss: 20, ng: 21, j: 22,
  ch: 23, k: 24, t: 25, p: 26, h: 27,
} as const;

// 초성 번호: ㄱ0 ㄲ1 ㄴ2 ㄷ3 ㄸ4 ㄹ5 ㅁ6 ㅂ7 ㅃ8 ㅅ9 ㅆ10 ㅇ11 ㅈ12 ㅉ13 ㅊ14 ㅋ15 ㅌ16 ㅍ17 ㅎ18
const I = { g: 0, n: 2, d: 3, r: 5, m: 6, b: 7, s: 9, ss: 10, silent: 11, j: 12, ch: 14, k: 15, t: 16, p: 17, h: 18 } as const;

/** 받침이 다음 음절의 빈 초성(ㅇ)으로 넘어갈 때: [남는 받침, 넘어가는 초성]. */
const LIAISON: Record<number, [number, number]> = {
  [F.g]: [F.none, I.g],
  [F.kk]: [F.none, 1],
  [F.gs]: [F.g, I.s],
  [F.n]: [F.none, I.n],
  [F.nj]: [F.n, I.j],
  [F.nh]: [F.none, I.n],
  [F.d]: [F.none, I.d],
  [F.l]: [F.none, I.r],
  [F.lg]: [F.l, I.g],
  [F.lm]: [F.l, I.m],
  [F.lb]: [F.l, I.b],
  [F.ls]: [F.l, I.s],
  [F.lt]: [F.l, I.t],
  [F.lp]: [F.l, I.p],
  [F.lh]: [F.none, I.r],
  [F.m]: [F.none, I.m],
  [F.b]: [F.none, I.b],
  [F.bs]: [F.b, I.s],
  [F.s]: [F.none, I.s],
  [F.ss]: [F.none, I.ss],
  [F.j]: [F.none, I.j],
  [F.ch]: [F.none, I.ch],
  [F.k]: [F.none, I.k],
  [F.t]: [F.none, I.t],
  [F.p]: [F.none, I.p],
  [F.h]: [F.none, I.silent],
};

/** 받침의 대표음: k · n · t · l · m · p · ng. */
function finalSound(final: number): '' | 'k' | 'n' | 't' | 'l' | 'm' | 'p' | 'ng' {
  switch (final) {
    case F.none:
      return '';
    case F.g: case F.kk: case F.gs: case F.lg: case F.k:
      return 'k';
    case F.n: case F.nj: case F.nh:
      return 'n';
    case F.l: case F.lb: case F.ls: case F.lt: case F.lh:
      return 'l';
    case F.m: case F.lm:
      return 'm';
    case F.b: case F.bs: case F.lp: case F.p:
      return 'p';
    case F.ng:
      return 'ng';
    default:
      return 't';
  }
}

type Syllable = { initial: string; vowel: string; final: number; initialIndex: number };

const isHangul = (code: number) => code >= 0xac00 && code <= 0xd7a3;

/** 한 낱말(띄어쓰기 단위)을 로마자로. 한글이 아닌 글자는 그대로 둡니다. */
function romanizeWord(word: string): string {
  const parts: (Syllable | string)[] = [];
  for (const char of word) {
    const code = char.charCodeAt(0);
    if (!isHangul(code)) {
      parts.push(char);
      continue;
    }
    const offset = code - 0xac00;
    const initialIndex = Math.floor(offset / 588);
    parts.push({
      initialIndex,
      initial: INITIALS[initialIndex],
      vowel: VOWELS[Math.floor((offset % 588) / 28)],
      final: offset % 28,
    });
  }

  // 1) 연음: 받침 + 빈 초성
  for (let i = 0; i < parts.length - 1; i += 1) {
    const here = parts[i];
    const next = parts[i + 1];
    if (typeof here === 'string' || typeof next === 'string') continue;
    if (next.initialIndex !== I.silent || here.final === F.none || here.final === F.ng) continue;
    const [stays, moves] = LIAISON[here.final];
    here.final = stays;
    next.initialIndex = moves;
    next.initial = INITIALS[moves];
  }

  // 2) 받침 소리와 다음 초성이 만날 때
  let out = '';
  for (let i = 0; i < parts.length; i += 1) {
    const here = parts[i];
    if (typeof here === 'string') {
      out += here;
      continue;
    }
    const prev = i > 0 ? parts[i - 1] : null;
    const prevSound = prev && typeof prev !== 'string' ? finalSound(prev.final) : '';
    const prevFinal = prev && typeof prev !== 'string' ? prev.final : F.none;

    let initial = here.initial;
    if (here.initialIndex === I.r) {
      // ㄹ: ㄴ·ㄹ 받침 뒤는 l(ㄹㄹ), 다른 받침 뒤는 n, 모음 사이는 r
      if (prevSound === 'l' || prevSound === 'n') initial = 'l';
      else if (prevSound) initial = 'n';
    } else if (here.initialIndex === I.n && prevSound === 'l') {
      initial = 'l';
    } else if (prevFinal === F.h || prevFinal === F.nh || prevFinal === F.lh) {
      // 받침 ㅎ + ㄱ·ㄷ·ㅈ → 거센소리
      if (here.initialIndex === I.g) initial = 'k';
      else if (here.initialIndex === I.d) initial = 't';
      else if (here.initialIndex === I.j) initial = 'ch';
    }
    out += initial + here.vowel;

    let sound: string = finalSound(here.final);
    const next = parts[i + 1];
    if (next && typeof next !== 'string') {
      const nasalNext = next.initialIndex === I.n || next.initialIndex === I.m;
      // 비음화: k·t·p + ㄴ·ㅁ → ng·n·m, ㄹ 앞에서도 같은 비음이 된다
      if (nasalNext || next.initialIndex === I.r) {
        if (sound === 'k') sound = 'ng';
        else if (sound === 't') sound = 'n';
        else if (sound === 'p') sound = 'm';
      }
      // 유음화: ㄴ + ㄹ → ll
      if (sound === 'n' && next.initialIndex === I.r) sound = 'l';
      // 받침 ㅎ은 뒤 자음과 합쳐지거나(거센소리) 사라진다
      if ((here.final === F.h) && (next.initialIndex === I.g || next.initialIndex === I.d || next.initialIndex === I.j)) {
        sound = '';
      }
      if (here.final === F.nh || here.final === F.lh) {
        if (next.initialIndex === I.g || next.initialIndex === I.d || next.initialIndex === I.j) {
          sound = here.final === F.nh ? 'n' : 'l';
        }
      }
    }
    out += sound;
  }
  return out;
}

/** 문장 또는 낱말을 로마자로. 띄어쓰기는 그대로 둡니다. */
export function romanize(text: string): string {
  return text
    .split(/(\s+)/)
    .map((part) => (/\s/.test(part) ? part : romanizeWord(part)))
    .join('');
}

/** 한글이 한 글자라도 있는지 — 툴팁을 띄울 낱말인지 가른다. */
export const hasHangul = (text: string) => /[가-힣]/.test(text);

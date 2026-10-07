import { conversations } from '@/data/conversations';
import { missions } from '@/data/missions';
import { levelCheckQuestion } from '@/data/skills';

import { catalogKey } from './key';

/**
 * Every English learning-aid string a catalog can translate, keyed the way
 * catalogs are (`catalogKey`). App UI — buttons, labels, titles — is not here:
 * it stays in English.
 *
 * `scripts/i18n-check.mjs` reads this to list what each language is missing.
 */
export function learningStrings(): string[] {
  const out: string[] = [levelCheckQuestion.english];

  for (const script of conversations) {
    for (const turn of script.turns) {
      out.push(turn.english);
      turn.hintWords?.forEach((word) => out.push(word.english));
      if (turn.mistake) {
        out.push(turn.mistake.suggested.english, turn.mistake.why);
      }
    }
  }

  for (const mission of missions) {
    for (const question of mission.questions) {
      if (question.type === 'speak') {
        out.push(question.english, question.feedback.explanation);
      } else if (question.type === 'write') {
        out.push(question.prompt, question.explanation, ...(question.blankNotes ?? []));
      } else {
        out.push(question.promptEnglish, question.explanation);
      }
    }
  }

  return [...new Set(out.map(catalogKey).filter(Boolean))];
}

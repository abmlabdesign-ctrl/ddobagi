import { levelCheckSkills, skillLabels, skillOrder } from '@/data/skills';
import type { Mistake, SkillId, Stats, StatsPeriod } from '@/data/types';
import type { ActivityEntry } from '@/store/AppStore';

/**
 * MY-2 from the learner's own record.
 *
 * Where it starts: the level-check result, so a new learner's chart is a flat
 * line at their starting point rather than someone else's history.
 * How it moves: each period's skill score blends the previous one with that
 * period's measured accuracy (mission first tries, roleplay corrections said
 * right). A skill with nothing measured in a period carries over unchanged.
 * Blending keeps one bad mission from crashing a score.
 */
const PERIODS = 6;
/** How much of a period's accuracy moves the score. */
const WEIGHT = 0.5;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Bucket = { start: number; end: number; label: string; rangeLabel: string };

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The last six weeks (Monday start) or months, oldest first, ending with the current one. */
function buckets(period: StatsPeriod, now: Date): Bucket[] {
  const out: Bucket[] = [];
  for (let back = PERIODS - 1; back >= 0; back -= 1) {
    if (period === 'weekly') {
      const monday = startOfDay(now);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - back * 7);
      const next = new Date(monday);
      next.setDate(monday.getDate() + 7);
      const week = Math.ceil(monday.getDate() / 7);
      const month = MONTHS_SHORT[monday.getMonth()];
      out.push({
        start: monday.getTime(),
        end: next.getTime(),
        // `Sep 4` on the chart, `Sep, week 4` on the stepper — the comps' format.
        label: `${month} ${week}`,
        rangeLabel: `${month}, week ${week}`,
      });
    } else {
      const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
      const next = new Date(first.getFullYear(), first.getMonth() + 1, 1);
      out.push({
        start: first.getTime(),
        end: next.getTime(),
        label: MONTHS_SHORT[first.getMonth()],
        rangeLabel: MONTHS_LONG[first.getMonth()],
      });
    }
  }
  return out;
}

const average = (values: number[]) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export function buildStats(
  period: StatsPeriod,
  activity: ActivityEntry[],
  mistakes: Mistake[],
  now = new Date(),
): Stats & { measured: boolean } {
  const ranges = buckets(period, now);
  const baseline = Object.fromEntries(
    levelCheckSkills.map((entry) => [entry.skill, entry.score]),
  ) as Record<SkillId, number>;

  // Anything before the chart's window already shaped where it starts.
  let running = { ...baseline };
  for (const entry of activity) {
    if (entry.at < ranges[0].start) running = blend(running, [entry]);
  }

  const trend = ranges.map((range) => {
    const inRange = activity.filter((entry) => entry.at >= range.start && entry.at < range.end);
    running = blend(running, inRange);
    const skills = skillOrder.map((skill) => ({ skill, score: running[skill] }));
    return {
      label: range.label,
      rangeLabel: range.rangeLabel,
      score: average(skills.map((entry) => entry.score)),
      skills,
    };
  });

  const current = trend[trend.length - 1];
  const previous = trend[trend.length - 2];
  const unit = period === 'weekly' ? 'this week' : 'this month';

  const deltas = current.skills.map((entry, index) => ({
    skill: entry.skill,
    delta: entry.score - previous.skills[index].score,
    score: entry.score,
  }));
  const gain = [...deltas].sort((a, b) => b.delta - a.delta)[0];
  const weakest = [...current.skills].sort((a, b) => a.score - b.score)[0];
  const openOnWeakest = mistakes.filter(
    (mistake) => !mistake.fixed && mistake.skill === weakest.skill,
  ).length;

  const currentRange = ranges[ranges.length - 1];
  const measured = activity.some(
    (entry) => entry.at >= currentRange.start && entry.at < currentRange.end,
  );

  return {
    period,
    heading: period === 'weekly' ? "This week's overall score" : "This month's overall score",
    score: current.score,
    rangeLabel: current.rangeLabel,
    trendLabel: period === 'weekly' ? 'Last 6 weeks' : 'Last 6 months',
    trend,
    biggestGain:
      gain.delta > 0
        ? {
            skill: gain.skill,
            delta: gain.delta,
            note: `${skillLabels[gain.skill]} went from ${gain.score - gain.delta} to ${gain.score} ${unit}.`,
          }
        : {
            skill: gain.skill,
            delta: 0,
            note: measured
              ? `No skill moved up ${unit} yet. Keep going — gains show once a skill gets steady practice.`
              : `Finish a roleplay or mission ${unit} to see what moves.`,
          },
    practiceNext: {
      skill: weakest.skill,
      note:
        openOnWeakest > 0
          ? `${skillLabels[weakest.skill]} is your lowest at ${weakest.score}, with ${openOnWeakest} mistake${openOnWeakest === 1 ? '' : 's'} still open.`
          : `${skillLabels[weakest.skill]} is your lowest at ${weakest.score}.`,
    },
    measured,
  };
}

function blend(scores: Record<SkillId, number>, entries: ActivityEntry[]) {
  const next = { ...scores };
  for (const skill of skillOrder) {
    const mine = entries.filter((entry) => entry.skill === skill);
    const total = mine.reduce((sum, entry) => sum + entry.total, 0);
    if (total === 0) continue;
    const accuracy = (mine.reduce((sum, entry) => sum + entry.correct, 0) / total) * 100;
    next[skill] = Math.round(next[skill] * (1 - WEIGHT) + accuracy * WEIGHT);
  }
  return next;
}

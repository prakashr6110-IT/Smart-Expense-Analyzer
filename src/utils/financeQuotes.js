/**
 * Finora daily wisdom — original money-mindset lines shown in the post-login
 * welcome ritual. Each entry carries a theme label so the screen reads like a
 * branded product moment rather than a generic quote widget.
 */
export const FINORA_QUOTES = [
  {
    theme: 'On awareness',
    text: 'Every rupee you spend leaves a trail. Read it, and you already know where you are going.',
  },
  {
    theme: 'On discipline',
    text: 'Do not save what is left after spending. Spend what is left after saving.',
  },
  {
    theme: 'On habits',
    text: 'Small expenses sink savings the same way small leaks sink ships.',
  },
  {
    theme: 'On freedom',
    text: 'A budget is not a limit on your freedom. It is the plan that buys it.',
  },
  {
    theme: 'On momentum',
    text: 'Wealth begins the day your spending gets a name.',
  },
  {
    theme: 'On trade-offs',
    text: 'The real price of a want is never the tag. It is the goal you delay to have it.',
  },
  {
    theme: 'On consistency',
    text: 'Do not count your money only at month end. Count it each time it moves.',
  },
  {
    theme: 'On direction',
    text: 'Knowing exactly where you stand is the first step to knowing where you can go.',
  },
];

/**
 * One quote per calendar day, stable across reloads so the greeting feels
 * intentional instead of random.
 */
export const getQuoteOfDay = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return FINORA_QUOTES[dayOfYear % FINORA_QUOTES.length];
};

/** Time-of-day salutation for the personalized greeting. */
export const getDaypart = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Slovak counts take three forms: one, two to four, and five or more. Picking by
 * `count === 1` alone gives "2 fotografií", which reads as a typo.
 */
export function plural(count: number, one: string, few: string, many: string): string {
    if (count === 1) return one;
    return count >= 2 && count <= 4 ? few : many;
}

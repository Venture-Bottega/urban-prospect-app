// src/utils/score.js
// Single source of truth — weights are defined in weights.json and read by both
// the Python ETL (process_data.py) and this file.
import DEFAULT_WEIGHTS_JSON from '../data/weights.json'
export const DEFAULT_WEIGHTS = DEFAULT_WEIGHTS_JSON

export function computeScore(neighborhood, weights) {
    const indicators = neighborhood.indicators || []
    const get = key => {
        const ind = indicators.find(i => i.key === key)
        return ind?.score ?? 0
    }
    const imd    = get('imperviousnessDensity')
    const tcd    = get('treeCoverDensity')
    const pop    = get('populationGrowth')
    const access = get('accessibilityCity')

    return (
        (weights.imd    / 100) * (100 - imd) +
        (weights.tcd    / 100) * tcd          +
        (weights.pop    / 100) * pop          +
        (weights.access / 100) * access
    )
}

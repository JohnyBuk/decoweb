export function getJson() {
    let json = { strategies: [] };
    strategies_list.forEach(strategy => json.strategies.push(strategy.getJson()));
    return json;
}
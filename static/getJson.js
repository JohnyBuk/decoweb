export function getJson() {
    let json = { strategies: [] };
    strategiesList.forEach(strategy => json.strategies.push(strategy.getJson()));
    return json;
}
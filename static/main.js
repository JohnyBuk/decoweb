import { renderStrategies } from './renderStrategies.js';
import { chart_config } from './chart_config.js';
import { Strategy } from './strategy.js';
import { getJson } from './getJson.js';
import { colors } from './colors.js';

window.strategies_element = document.getElementById('strategies');
window.strategies_list = [];
strategies_list.push(new Strategy);

const chart = new Chart(document.getElementById('dive-profile'), chart_config);
renderStrategies();

document.getElementById('plan-dive').onclick = () => {
	let json = getJson();
	json['target-depth'] = document.getElementById('target-depth').value;
	json['bottom-time'] = document.getElementById('bottom-time').value;

	fetch('/plan-dive', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(json)
	}).then(response => response.json()).then(data => {
		chart.data.datasets = [];

		data.forEach((strategy, i) => {
			const strategy_data = {
				data: strategy,
				label: 'Strategy ' + (i + 1),
				borderColor: colors[i],
				backgroundColor: colors[i]
			};
			chart.data.datasets.push(strategy_data);
		});
		chart.update();
	});
}



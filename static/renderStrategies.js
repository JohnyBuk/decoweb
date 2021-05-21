import { Strategy } from './strategy.js';

export function renderStrategies() {
	strategies_element.innerHTML = '';
	let i = 1;

	strategies_list.forEach(strategy => {
		let brnRemoveStrategy = document.createElement('button');
		brnRemoveStrategy.className = 'btn btn-light text-primary';
		brnRemoveStrategy.innerText = 'Remove strategy';
		brnRemoveStrategy.onclick = () => { removeStrategy(strategy); renderStrategies(); };

		strategies_element.appendChild(strategy.render(i++, brnRemoveStrategy));
	});


	let brnAddStrategy = document.createElement('button');
	brnAddStrategy.className = 'btn btn-primary';
	brnAddStrategy.innerText = '+Add strategy';
	brnAddStrategy.onclick = () => { strategies_list.push(new Strategy); renderStrategies(); };
	strategies_element.appendChild(brnAddStrategy);
}

function removeStrategy(strategy) {
	if (strategies_list.length === 1) return;
	const index = strategies_list.indexOf(strategy);
	if (index !== -1)
		strategies_list.splice(index, 1);
}

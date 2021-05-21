import { Strategy } from './strategy.js';

export function renderStrategies() {
	strategiesElement.innerHTML = '';

	strategiesList.forEach((strategy, i) => {
		let brnRemoveStrategy = document.createElement('button');
		brnRemoveStrategy.className = 'btn btn-light text-primary';
		brnRemoveStrategy.innerText = 'Remove strategy';
		brnRemoveStrategy.onclick = () => { removeStrategy(strategy); renderStrategies(); };

		strategiesElement.appendChild(strategy.render(i + 1, brnRemoveStrategy));
	});


	let brnAddStrategy = document.createElement('button');
	brnAddStrategy.className = 'btn btn-primary';
	brnAddStrategy.innerText = '+Add strategy';
	brnAddStrategy.onclick = () => { strategiesList.push(new Strategy); renderStrategies(); };
	strategiesElement.appendChild(brnAddStrategy);
}

function removeStrategy(strategy) {
	if (strategiesList.length === 1) return;
	const index = strategiesList.indexOf(strategy);
	if (index !== -1)
		strategiesList.splice(index, 1);
}

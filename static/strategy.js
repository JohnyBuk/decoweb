import { Gas } from './gas.js';
import { renderStrategies } from './renderStrategies.js';

export class Strategy {
	constructor() {
		this.gases = [];
		this.gases.push(new Gas);
	}

	getJson() {
		let json = [];
		this.gases.forEach(gas => json.push(gas.getJson()));
		return json;
	}

	removeGas(gas) {
		if (this.gases.length === 1) return;
		const index = this.gases.indexOf(gas);
		if (index !== -1)
			this.gases.splice(index, 1);
	}

	renderGases() {
		let divGases = document.createElement('div');

		this.gases.forEach((gas, i) => {
			let btnRemoveGas = document.createElement('button');
			btnRemoveGas.className = 'btn btn-primary';
			btnRemoveGas.innerText = 'Remove gas';
			btnRemoveGas.onclick = () => { this.removeGas(gas); renderStrategies(); };
			divGases.appendChild(gas.render(i + 1, btnRemoveGas));
		});

		return divGases;
	}

	render(id, btnRemove) {
		let divCard = document.createElement('div');
		divCard.className = 'card bg-primary';
		divCard.style = 'margin-bottom: 1.5rem';

		let divCardBody = document.createElement('div');
		divCardBody.className = 'card-body';
		divCard.appendChild(divCardBody);

		let header = document.createElement('h3');
		header.className = 'text-white';
		header.innerText = 'Strategy ' + id;
		divCardBody.appendChild(header);
		divCardBody.appendChild(this.renderGases());

		let divRow = document.createElement('div');
		divRow.className = 'row';
		divCardBody.appendChild(divRow);

		let divColLeft = document.createElement('div');
		divColLeft.className = 'col-md-6';
		divColLeft.appendChild(btnRemove);
		divRow.appendChild(divColLeft);

		let divColRight = document.createElement('div');
		divColRight.className = 'col-md-6';
		divRow.appendChild(divColRight);

		let divColRightBody = document.createElement('div');
		divColRightBody.className = 'text-end';
		divColRight.appendChild(divColRightBody);

		let btnAddGas = document.createElement('button');
		btnAddGas.className = 'btn btn-light text-primary';
		btnAddGas.innerText = 'Add gas';
		btnAddGas.onclick = () => { this.gases.push(new Gas); renderStrategies() };
		divColRightBody.appendChild(btnAddGas);

		return divCard;
	}
}
export class Gas {
	constructor() {
		this.oxygen = 21;
		this.helium = 0;
	}

	oxygenLabel() {
		return 'Oxygen ' + this.oxygen + ' %';
	}

	heliumLabel() {
		return 'Helium ' + this.helium + ' %';
	}

	getJson() {
		return { oxygen: this.oxygen, helium: this.helium };
	}

	render(id, btnRemoveGas) {
		let divCard = document.createElement('div');
		divCard.className = 'card';
		divCard.style = 'margin-bottom: 1.5rem';

		let divCardBody = document.createElement('div');
		divCardBody.className = 'card-body';
		divCard.appendChild(divCardBody);

		let divRow = document.createElement('div');
		divRow.className = 'row';
		divCardBody.appendChild(divRow);

		let divColLeft = document.createElement('div');
		divColLeft.className = 'col-md-6';
		divRow.appendChild(divColLeft);

		let header = document.createElement('h4');
		header.className = 'text-primary';
		header.innerText = 'Gas ' + id;
		divColLeft.appendChild(header);

		let oxygenLbl = document.createElement('label');
		oxygenLbl.className = 'form-label';
		oxygenLbl.innerText = this.oxygenLabel();
		divColLeft.appendChild(oxygenLbl);

		let oxygenSlider = document.createElement('input');
		oxygenSlider.oninput = () => { this.oxygen = oxygenSlider.value; oxygenLbl.innerText = this.oxygenLabel(); };
		oxygenSlider.value = this.oxygen;
		oxygenSlider.className = 'form-range';
		oxygenSlider.type = 'range';
		divColLeft.appendChild(oxygenSlider);

		let divColRight = document.createElement('div');
		divColRight.className = 'col-md-6';
		divRow.appendChild(divColRight);

		let divColRightBody = document.createElement('div');
		divColRightBody.className = 'text-end';
		divColRightBody.appendChild(btnRemoveGas);
		divColRight.appendChild(divColRightBody);

		let heliumLbl = document.createElement('label');
		heliumLbl.className = 'form-label';
		heliumLbl.innerText = this.heliumLabel();
		divColRight.appendChild(heliumLbl);

		let heliumSlider = document.createElement('input');
		heliumSlider.oninput = () => { this.helium = heliumSlider.value; heliumLbl.innerText = this.heliumLabel(); };
		heliumSlider.value = this.helium;
		heliumSlider.className = 'form-range';
		heliumSlider.type = 'range';
		divColRight.appendChild(heliumSlider);

		return divCard;
	}
}

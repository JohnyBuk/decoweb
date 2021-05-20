$(function () {
	const config = {
		type: 'scatter',
		data: {
			datasets: [],
		},
		options: {
			showLine: true,
			scales: {
				y: {
					reverse: true
				}
			}
		}
	};

	const colors = [
		"blue", "#25CCF7", "#FD7272", "#54a0ff", "#00d2d3",
		"#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e",
		"#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50",
		"#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6",
		"#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d",
		"#55efc4", "#81ecec", "#74b9ff", "#a29bfe", "#dfe6e9",
		"#00b894", "#00cec9", "#0984e3", "#6c5ce7", "#ffeaa7",
		"#fab1a0", "#ff7675", "#fd79a8", "#fdcb6e", "#e17055",
		"#d63031", "#feca57", "#5f27cd", "#54a0ff", "#01a3a4"
	];

	class Gas {
		constructor() {
			this.oxygen = 21;
			this.helium = 0;
		}

		oxygenLabel() {
			return "Oxygen " + this.oxygen + " %";
		}

		heliumLabel() {
			return "Helium " + this.helium + " %";
		}

		getJson() {
			return { oxygen: this.oxygen, helium: this.helium };
		}

		render(id, btnRemoveGas) {
			let divCard = document.createElement('div');
			divCard.className = "card";
			divCard.style = "margin-bottom: 1.5rem";

			let divCardBody = document.createElement('div');
			divCardBody.className = "card-body";
			divCard.appendChild(divCardBody);

			let divRow = document.createElement('div');
			divRow.className = "row";
			divCardBody.appendChild(divRow);

			let divColLeft = document.createElement('div');
			divColLeft.className = "col-md-6";
			divRow.appendChild(divColLeft);

			let header = document.createElement('h4');
			header.className = "text-primary";
			header.innerText = "Gas " + id;
			divColLeft.appendChild(header);

			let oxygenLbl = document.createElement('label');
			oxygenLbl.className = "form-label";
			oxygenLbl.innerText = this.oxygenLabel();
			divColLeft.appendChild(oxygenLbl);

			let oxygenSlider = document.createElement('input');
			oxygenSlider.oninput = () => { this.oxygen = oxygenSlider.value; oxygenLbl.innerText = this.oxygenLabel(); };
			oxygenSlider.value = this.oxygen;
			oxygenSlider.className = "form-range";
			oxygenSlider.type = "range";
			divColLeft.appendChild(oxygenSlider);

			let divColRight = document.createElement('div');
			divColRight.className = "col-md-6";
			divRow.appendChild(divColRight);

			let divColRightBody = document.createElement('div');
			divColRightBody.className = "text-end";
			divColRightBody.appendChild(btnRemoveGas);
			divColRight.appendChild(divColRightBody);

			let heliumLbl = document.createElement('label');
			heliumLbl.className = "form-label";
			heliumLbl.innerText = this.heliumLabel();
			divColRight.appendChild(heliumLbl);

			let heliumSlider = document.createElement('input');
			heliumSlider.oninput = () => { this.helium = heliumSlider.value; heliumLbl.innerText = this.heliumLabel(); };
			heliumSlider.value = this.helium;
			heliumSlider.className = "form-range";
			heliumSlider.type = "range";
			divColRight.appendChild(heliumSlider);

			return divCard;
		}
	}

	class Strategy {
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
			let i = 1;

			this.gases.forEach(gas => {
				let btnRemoveGas = document.createElement('button');
				btnRemoveGas.className = "btn btn-primary";
				btnRemoveGas.innerText = "Remove gas";
				btnRemoveGas.onclick = () => { this.removeGas(gas); renderStrategies(); };
				divGases.appendChild(gas.render(i++, btnRemoveGas));
			});

			return divGases;
		}

		render(id, btnRemove) {
			let divCard = document.createElement('div');
			divCard.className = "card bg-primary";
			divCard.style = "margin-bottom: 1.5rem";

			let divCardBody = document.createElement('div');
			divCardBody.className = "card-body";
			divCard.appendChild(divCardBody);

			let header = document.createElement('h3');
			header.className = "text-white";
			header.innerText = "Strategy " + id;
			divCardBody.appendChild(header);
			divCardBody.appendChild(this.renderGases());

			let divRow = document.createElement('div');
			divRow.className = "row";
			divCardBody.appendChild(divRow);

			let divColLeft = document.createElement('div');
			divColLeft.className = "col-md-6";
			divColLeft.appendChild(btnRemove);
			divRow.appendChild(divColLeft);

			let divColRight = document.createElement('div');
			divColRight.className = "col-md-6";
			divRow.appendChild(divColRight);

			let divColRightBody = document.createElement('div');
			divColRightBody.className = "text-end";
			divColRight.appendChild(divColRightBody);

			let btnAddGas = document.createElement('button');
			btnAddGas.className = "btn btn-light text-primary";
			btnAddGas.innerText = "Add gas";
			btnAddGas.onclick = () => { this.gases.push(new Gas); renderStrategies() };
			divColRightBody.appendChild(btnAddGas);

			return divCard;
		}
	}

	function removeStrategy(strategy) {
		if (strategies.length === 1) return;
		const index = strategies.indexOf(strategy);
		if (index !== -1)
			strategies.splice(index, 1);

	}

	const chart = new Chart($('canvas'), config);
	const element = document.getElementById("strategies");

	let strategies = [];
	strategies.push(new Strategy);
	renderStrategies();

	function getJson() {
		let json = { strategies: [] };
		strategies.forEach(strategy => json.strategies.push(strategy.getJson()));
		return json;
	}

	function renderStrategies() {
		element.innerHTML = "";
		let i = 1;

		strategies.forEach(strategy => {
			let brnRemoveStrategy = document.createElement('button');
			brnRemoveStrategy.className = "btn btn-light text-primary";
			brnRemoveStrategy.innerText = "Remove strategy";
			brnRemoveStrategy.onclick = () => { removeStrategy(strategy); renderStrategies(); };

			element.appendChild(strategy.render(i++, brnRemoveStrategy));
		});


		let brnAddStrategy = document.createElement('button');
		brnAddStrategy.className = "btn btn-primary";
		brnAddStrategy.innerText = "+Add strategy";
		brnAddStrategy.onclick = () => { strategies.push(new Strategy); renderStrategies(); };
		element.appendChild(brnAddStrategy);
	}

	$('#plan-dive').click(function () {
		json = getJson();
		json["target-depth"] = document.getElementById('target-depth').value;
		json["bottom-time"] = document.getElementById('bottom-time').value;
		$.ajax({
			url: '/plan-dive',
			contentType: "application/json",
			type: 'POST',
			data: JSON.stringify(json),
			success: function (response) {
				let data = JSON.parse(response);
				chart.data.datasets = [];

				data.forEach((strategy, i) => chart.data.datasets.push({ data: strategy, label: "Dataset " + (i + 1), borderColor: colors[i], backgroundColor: colors[i] }));
				chart.update();
			},
			error: function (error) {
				console.log(error);
			}
		});
	});
});
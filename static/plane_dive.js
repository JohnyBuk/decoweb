$(function () {
	const config = {
		type: 'scatter',
		data: {
			datasets: [{
				label: 'Dive profile',
				data: [],
				backgroundColor: 'blue',
				borderColor: 'blue',
			}],
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

	class Gass {
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

		render(id, btnRemoveGass) {
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
			header.innerText = "Gass " + id;
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
			divColRightBody.appendChild(btnRemoveGass);
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
			this.gasses = [];
			this.gasses.push(new Gass);
		}

		getJson() {
			let json = [];
			this.gasses.forEach(gass => json.push(gass.getJson()));
			return json;
		}

		removeGass(gass) {
			if (this.gasses.length === 1) return;
			const index = this.gasses.indexOf(gass);
			if (index !== -1)
				this.gasses.splice(index, 1);
		}

		renderGasses() {
			let divGasses = document.createElement('div');
			let i = 1;

			this.gasses.forEach(gass => {
				let btnRemoveGass = document.createElement('button');
				btnRemoveGass.className = "btn btn-primary";
				btnRemoveGass.innerText = "Remove gass";
				btnRemoveGass.onclick = () => { this.removeGass(gass); renderStrategies(); };
				divGasses.appendChild(gass.render(i++, btnRemoveGass));
			});

			return divGasses;
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
			divCardBody.appendChild(this.renderGasses());

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

			let btnAddGass = document.createElement('button');
			btnAddGass.className = "btn btn-light text-primary";
			btnAddGass.innerText = "Add gass";
			btnAddGass.onclick = () => { this.gasses.push(new Gass); renderStrategies() };
			divColRightBody.appendChild(btnAddGass);

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
		strategies.forEach(strategy => json.strategies.push(strategy.get_json()));
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
		json["target_depth"] = document.getElementById('target_depth').value;
		json["bottom_time"] = document.getElementById('bottom_time').value;
		$.ajax({
			url: '/plane_dive',
			contentType: "application/json",
			type: 'POST',
			data: JSON.stringify(json),
			success: function (response) {
				let data = JSON.parse(response);
				chart.data.datasets[0].data = data;
				chart.update();
			},
			error: function (error) {
				console.log(error);
			}
		});
	});
});
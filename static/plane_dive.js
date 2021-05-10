$(function () {
	addGass = function (i) {
		console.log(i);
		strategies.get(i).insertGass(new Gass);
		renderStrategies(element, strategies);
	}

	removeGass = function (strategy_key, gass_key) {
		strategies.get(strategy_key).removeGass(gass_key);
		renderStrategies(element, strategies);
	}

	addStrategy = function () {
		const key = Math.random();
		strategies.set(key, new Strategy(new Gass, key)); // TODO check id not in strategies
		renderStrategies(element, strategies);
	}

	removeStrategy = function (strategy_key) {
		if (strategies.size > 1) {
			strategies.delete(strategy_key);
			renderStrategies(element, strategies);
		}
	}

	const chart = new Chart($('canvas'), config);
	const element = document.getElementById("strategies");

	let strategies = new Map();
	addStrategy();
	addStrategy();
	addStrategy();

	renderStrategies(element, strategies);

	$('#plan-dive').click(function () {
		console.log();
		let data = $('form').serialize() + "&oxygen=" + document.getElementById('customRange1').value;
		console.log(data);
		$.post("/plane_dive", data, function (response) {
			let data = JSON.parse(response);
			chart.data.datasets[0].data = data;
			chart.update();
		});
	});
});

function renderStrategies(element, strategies) {
	element.innerHTML = "";
	let i = 1;

	strategies.forEach((strategy, key) => {
		let brn_remove_strategy = document.createElement('button');
		brn_remove_strategy.className = "btn btn-light text-primary";
		brn_remove_strategy.innerHTML = "Remove strategy";
		brn_remove_strategy.onclick = () => { strategies.delete(key); renderStrategies(element, strategies); };
		element.appendChild(strategy.render2(key, brn_remove_strategy));
	});

	let brn_add_strategy = document.createElement('button');
	brn_add_strategy.className = "btn btn-primary";
	brn_add_strategy.innerHTML = "+Add strategy";
	brn_add_strategy.onclick = () =>  addStrategy();
	element.appendChild(brn_add_strategy);

}

class Gass {
	constructor() {
		this.oxygen = 21;
		this.helium = 0;
	}

	render(strategy_id, gas_id, id) {
		return `<div class="card">
					<div class="card-body">
						<div class="row">
							<div class="col-md-6">
								<h4 class=" text-primary">Gass ${gas_id}</h4>
								<label for="customRange1" class="form-label">Oxygen </label>
								<output>${this.oxygen} %</output>
								<input type="range" value="${this.oxygen}" class="form-range" id="customRange1" oninput="this.previousElementSibling.value = this.value + ' %'">
							</div>

							<div class="col-md-6">
								<div  class="text-end">
									<button class="btn btn-primary" onClick="removeGass(${strategy_id}, ${gas_id})">Remove gass</button>
								</div>
								<label for="customRange1" class="form-label">Helium </label>
								<output>${this.helium} %</output>
								<input type="range" value="${this.helium}" class="form-range" id="customRange1"  oninput="this.previousElementSibling.value = this.value + ' %'">
							</div>
						</div>
					</div>
				</div>
				<br>`;
	}
}

class Strategy {
	constructor(gass, id) {
		this.gasses = new Map();
		this.insertGass(gass);
		this.id = id
	}

	insertGass(gass) {
		this.gasses.set(Math.random(), gass); // TODO check id not in strategies
	};

	removeGass(id) {
		if (this.gasses.size > 1) {
			this.gasses.delete(id);
		}
	}

	renderGasses() {
		let gasses = "";
		let i = 0;
		this.gasses.forEach((gass, key) => gasses += gass.render(this.id, key, ++i));
		return gasses;
	}

	render2(id, btn_remove) {
		let div_card = document.createElement('div');
		div_card.className = "card bg-primary";
		div_card.style = "margin-bottom: 1.5rem";

		let card_body = document.createElement('div');
		card_body.className = "card-body";
		div_card.appendChild(card_body);

		let header = document.createElement('h3');
		header.className = "text-white";
		header.innerHTML = "Strategy " + id;
		card_body.appendChild(header);

		let div_row = document.createElement('div');
		div_row.className = "row";
		card_body.appendChild(div_row);

		let div_col_left = document.createElement('div');
		div_col_left.className = "col-md-6";
		div_col_left.appendChild(btn_remove);
		div_row.appendChild(div_col_left);


		let div_col_right = document.createElement('div');
		div_col_right.className = "col-md-6";
		div_row.appendChild(div_col_right);

		let div_col_right_body = document.createElement('div');
		div_col_right_body.className = "text-end";
		div_col_right.appendChild(div_col_right_body);

		let brn_add_gass = document.createElement('button');
		brn_add_gass.className = "btn btn-light text-primary";
		brn_add_gass.innerHTML = "Add gass";
		div_col_right_body.appendChild(brn_add_gass);

		return div_card;
	}

	render(index) {
		return `<div class="card bg-primary">
					<div class="card-body">
						<h3 class="text-white">Strategy ${this.id}</h3>
						${this.renderGasses()}
						<div class="row">
							<div class="col-md-6">
								<button class="btn btn-light text-primary" onClick="removeStrategy(${this.id})">Remove strategy</button>
							</div>
							<div class="col-md-6">
								<div  class="text-end">
									<button class="btn btn-light text-primary" onclick="addGass(${this.id})">Add gass</button>
								</div>
							</div>
						</div>
					</div >
				</div >
				<br>`;
	}
}

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
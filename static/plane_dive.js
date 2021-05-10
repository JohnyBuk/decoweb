$(function () {
	addGass = function (i) {
		console.log(i);
		strategies.get(i).insertGass(new Gass);
		renderStrategies(element, strategies);
	}

	removeGass = function (s, g) {
		console.log("strategy", s);
		console.log("gass", g);
		strategies.get(s).removeGass(g);
		renderStrategies(element, strategies);
	}

	addStrategy = function () {
		let id = Math.random();
		strategies.set(id, new Strategy(new Gass, id)); // TODO check id not in strategies
		renderStrategies(element, strategies);
	}

	removeStrategy = function (i) {
		if (strategies.size > 1) {
			strategies.delete(i);
			renderStrategies(element, strategies);
		}
	}

	const chart = new Chart($('canvas'), config);
	const element = document.getElementById("strategies");

	let strategies = new Map();
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
	let html = "";
	strategies.forEach((strategy, index) => html += strategy.render(index));
	html += `<div class="text-end">
				<button class="btn btn-primary" onClick="addStrategy()">+Add strategy</button>
			</div>`;
	element.innerHTML = html;
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
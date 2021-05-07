$(function () {
	addGass = function (i) {
		strategies[i].insertGass(new Gass);
		renderStrategies(element, strategies);
	}

	addStrategy = function () {
		strategies.push(new Strategy(new Gass));
		renderStrategies(element, strategies);
	}

	const chart = new Chart($('canvas'), config);
	const strategies = [new Strategy(new Gass)];
	const element = document.getElementById("strategies");
	renderStrategies(element, strategies);

	$('#plan-dive').click(function () {
		$.post("/plane_dive", $('form').serialize(), function (response) {
			let data = JSON.parse(response);
			chart.data.datasets[0].data = data;
			chart.update();
		});
	});
});

function renderStrategies(element, strategies) {
	let html = "";
	strategies.forEach((strategy, index) => html += strategy.render(index));
	html += `<div  class="text-end">
				<button class="btn btn-primary" onClick="addStrategy()">+Add strategy</button>
			</div>`;
	element.innerHTML = html;
}

class Gass {
	constructor() {
		this.oxygen = 21;
		this.helium = 0;
	}

	render(index) {
		return `<div class="card">
					<div class="card-body">
						<div class="row">
							<h4 class=" text-primary">Gass ${index}</h4>

							<div class="col-md-6">
								<label for="customRange1" class="form-label">Oxygen </label>
								<output>${this.oxygen} %</output>
								<input type="range" value="${this.oxygen}" class="form-range" id="customRange1" oninput="this.previousElementSibling.value = this.value + ' %'">
							</div>
							<div class="col-md-6">
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
	constructor(gass) {
		this.gasses = [];
		this.insertGass(gass);
	}

	insertGass(gass) { this.gasses.push(gass); };
	renderGasses() {
		let gasses = "";
		this.gasses.forEach((gass, index) => gasses += gass.render(index + 1));
		return gasses;
	}

	render(index) {
		return `<div class="card bg-primary">
					<div class="card-body">
						<h3 class="text-white">Strategy ${index + 1}</h3>
						${this.renderGasses()}
						<div  class="text-end">
							<button class="btn btn-light text-primary" onclick="addGass(${index})">+Add gass</button>
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
$(function () {
	const data = {
		datasets: [{
			label: 'Dive profile',
			data: [],
			backgroundColor: 'blue',
			borderColor: 'blue',
		}],
	};

	const config = {
		type: 'scatter',
		data: data,
		options: {
			showLine: true,
			scales: {
				x: {
				}, y: {
					reverse: true
				}
			}
		}
	};

	let chart = new Chart($('canvas'), config);
	let strategies = [new Strategy(new Gass), new Strategy(new Gass)];

	strategies[0].insertGass(new Gass);
	strategies[1].insertGass(new Gass);
	strategies[1].insertGass(new Gass);
	renderStrategies(document.getElementById("strategies"), strategies);


	$('button').click(function () {
		$.post("/plane_dive", $('form').serialize(), function (response) {
			let data = JSON.parse(response);
			chart.data.datasets[0].data = data;
			chart.update();
		});
	});
});

function renderStrategies(element, strategies) {
	let html = "";
	strategies.forEach((strategy, index) => html += strategy.render(index + 1));
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
							<h4 class=" text-primary">Mixture ${index}</h4>

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
						<h3 class="text-white">Strategy ${index}</h3>
						${this.renderGasses()}
					</div >
				</div >
				<br>`;
	}
}

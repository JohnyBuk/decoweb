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

	let s = new Strategy(new Gass);
	s.insertGass(new Gass);
	s.insertGass(new Gass);
	document.getElementById("strategies").innerHTML = s.render();

	$('button').click(function () {
		$.post("/plane_dive", $('form').serialize(), function (response) {
			let data = JSON.parse(response);
			chart.data.datasets[0].data = data;
			chart.update();
		});
	});
});


class Gass {
	render(index) {
		return `<div class="card">
					<div class="card-body">
						<div class="row">
							<h4 class=" text-primary">Mixture ${index}</h4>

							<div class="col-md-6">
								<label for="customRange1" class="form-label">Oxygen percentage</label>
								<input type="range" class="form-range" id="customRange1">
							</div>
							<div class="col-md-6">
								<label for="customRange1" class="form-label">Helium percentage</label>
								<input type="range" class="form-range" id="customRange1">

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

	render() {
		return `<div class="card bg-primary">
					<div class="card-body">
						<h3 class="text-white">Strategy 1</h3>
						${this.renderGasses()}
					</div >
				</div >
				<br>`;
	}
}

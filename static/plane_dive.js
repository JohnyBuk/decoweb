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

		oxygen_label() {
			return "Oxygen " + this.oxygen + " %";
		}

		helium_label() {
			return "Helium " + this.helium + " %";
		}

		render(id, btn_remove_gass) {
			let div_card = document.createElement('div');
			div_card.className = "card";
			div_card.style = "margin-bottom: 1.5rem";

			let card_body = document.createElement('div');
			card_body.className = "card-body";
			div_card.appendChild(card_body);

			let div_row = document.createElement('div');
			div_row.className = "row";
			card_body.appendChild(div_row);

			let div_col_left = document.createElement('div');
			div_col_left.className = "col-md-6";
			div_row.appendChild(div_col_left);

			let header = document.createElement('h4');
			header.className = "text-primary";
			header.innerText = "Gass " + id;
			div_col_left.appendChild(header);

			let oxygen_lbl = document.createElement('label');
			oxygen_lbl.className = "form-label";
			oxygen_lbl.innerText = this.oxygen_label();
			div_col_left.appendChild(oxygen_lbl);

			let oxygen_slider = document.createElement('input');
			oxygen_slider.oninput = () => { this.oxygen = oxygen_slider.value; oxygen_lbl.innerText = this.oxygen_label(); };
			oxygen_slider.value = this.oxygen;
			oxygen_slider.className = "form-range";
			oxygen_slider.type = "range";
			div_col_left.appendChild(oxygen_slider);

			let div_col_right = document.createElement('div');
			div_col_right.className = "col-md-6";
			div_row.appendChild(div_col_right);

			let div_col_right_body = document.createElement('div');
			div_col_right_body.className = "text-end";
			div_col_right_body.appendChild(btn_remove_gass);
			div_col_right.appendChild(div_col_right_body);

			let helium_lbl = document.createElement('label');
			helium_lbl.className = "form-label";
			helium_lbl.innerText = this.helium_label();
			div_col_right.appendChild(helium_lbl);

			let helium_slider = document.createElement('input');
			helium_slider.oninput = () => { this.helium = helium_slider.value; helium_lbl.innerText = this.helium_label(); };
			helium_slider.value = this.helium;
			helium_slider.className = "form-range";
			helium_slider.type = "range";
			div_col_right.appendChild(helium_slider);

			return div_card;
		}
	}

	class Strategy {
		constructor() {
			this.gasses = [];
			this.gasses.push(new Gass);
		}

		removeGass(gass) {
			if (this.gasses.length === 1) return;
			const index = this.gasses.indexOf(gass);
			if (index !== -1)
				this.gasses.splice(index, 1);
		}

		renderGasses() {
			let div_gasses = document.createElement('div');
			let i = 1;

			this.gasses.forEach(gass => {
				let btn_remove_gass = document.createElement('button');
				btn_remove_gass.className = "btn btn-primary";
				btn_remove_gass.innerText = "Remove gass";
				btn_remove_gass.onclick = () => { this.removeGass(gass); renderStrategies(); };
				div_gasses.appendChild(gass.render(i++, btn_remove_gass));
			});

			return div_gasses;
		}

		render(id, btn_remove) {
			let div_card = document.createElement('div');
			div_card.className = "card bg-primary";
			div_card.style = "margin-bottom: 1.5rem";

			let card_body = document.createElement('div');
			card_body.className = "card-body";
			div_card.appendChild(card_body);

			let header = document.createElement('h3');
			header.className = "text-white";
			header.innerText = "Strategy " + id;
			card_body.appendChild(header);
			card_body.appendChild(this.renderGasses());

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

			let btn_add_gass = document.createElement('button');
			btn_add_gass.className = "btn btn-light text-primary";
			btn_add_gass.innerText = "Add gass";
			btn_add_gass.onclick = () => { this.gasses.push(new Gass); renderStrategies() };
			div_col_right_body.appendChild(btn_add_gass);

			return div_card;
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

	function renderStrategies() {
		element.innerHTML = "";
		let i = 1;

		strategies.forEach(strategy => {
			let brn_remove_strategy = document.createElement('button');
			brn_remove_strategy.className = "btn btn-light text-primary";
			brn_remove_strategy.innerText = "Remove strategy";
			brn_remove_strategy.onclick = () => { removeStrategy(strategy); renderStrategies(); };

			element.appendChild(strategy.render(i++, brn_remove_strategy));
		});

		let brn_add_strategy = document.createElement('button');
		brn_add_strategy.className = "btn btn-primary";
		brn_add_strategy.innerText = "+Add strategy";
		brn_add_strategy.onclick = () => { strategies.push(new Strategy); renderStrategies(); };
		element.appendChild(brn_add_strategy);
	}

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
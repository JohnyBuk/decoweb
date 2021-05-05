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

	var chart = new Chart($('canvas'), config);

	$('button').click(function (e) {
		$.post("/plane_dive", $('form').serialize(), function (response) {
			var data = JSON.parse(response);
			chart.data.datasets[0].data = data;
			chart.update();
		});
	});
});


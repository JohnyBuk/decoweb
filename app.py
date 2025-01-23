import numpy as np
import flask
import decotengu
from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app)

@app.route("/plan-dive", methods=["POST"])
def plane_dive_endpoint():
    data = flask.request.json
    print(data)
    result = plan_dive(data)
    result = flask.json.dumps(result, indent=2)
    # print(result)
    return result


def plan_dive(data):
    target_depth = int(data["target-depth"])
    bottom_time = int(data["bottom-time"])
    result = []

    for strategy in data["strategies"]:
        engine = decotengu.create()
        for gass in strategy["gasses"]:
            oxygen = int(gass["oxygen"])
            helium = int(gass["helium"])
            if not engine._gas_list:  # no gas in engine
                engine.add_gas(0, oxygen, helium)

            else:
                preasure = 1.6 / (oxygen / 100.0)

                switch_depth = (engine._to_depth(preasure) // 3) * 3
                if target_depth > switch_depth:
                    engine.add_gas(switch_depth, oxygen, helium)

        profile = engine.calculate(target_depth, bottom_time)

        time = []
        depth = []

        for step in profile:
            time.append(round(step.time, 1))
            depth.append(round(engine._to_depth(step.abs_p)))
            print(step)

        time, depth = fill_missing_values(time, depth)
        result.append({"time": time, "depth": depth, "strategy": strategy["uuid"]})
    return create_dataset(result)


def fill_missing_values(data_x, data_y, step=0.1):
    time = []
    depth = []
    for [[x0, x1], [y0, y1]] in zip(zip(data_x, data_x[1:]), zip(data_y, data_y[1:])):
        equidistant_time = np.arange(x0, x1, step).round(1).tolist()
        if len(equidistant_time) == 0:
            continue
        if equidistant_time[-1] == x1:
            equidistant_time.pop()
        time += equidistant_time
        depth += np.interp(equidistant_time, [x0, x1], [y0, y1]).round(1).tolist()
    
    if depth[-1] != 0:
        time.append(time[-1] + step)
        depth.append(0)
    return time, depth


def create_dataset(dives):
    all_strategies = [dive["strategy"] for dive in dives]
    longest_tive = max(dives, key=lambda dive: len(dive["time"]))

    dataset = []
    for t in longest_tive["time"]:
        datapoint = {"time": t}
        for s in all_strategies:
            datapoint[s] = None
        dataset.append(datapoint)

    for dive in dives:
        for depth, datapoint in zip(dive["depth"], dataset):
            datapoint[dive["strategy"]] = depth
    return dataset


if __name__ == "__main__":
    app.run(debug=True)

import flask
import decotengu
import json


app = flask.Flask(__name__)


def preasure_to_depth(preasure):
    return 10.0 * (preasure - 1.0)


def preasure_to_depth(preasure):
    return 10.0 * (preasure - 1.0)


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/plan-dive', methods=['POST'])
def plane_dive():
    data = flask.request.json
    print(json.dumps(data, indent=4))
    target_depth = int(data['target-depth'])
    bottom_time = int(data['bottom-time'])
    oxygen = int(data["strategies"][0][0]['oxygen'])
    helium = int(data["strategies"][0][0]['helium'])

    engine = decotengu.create()

    bob = False

    for strategy in data["strategies"]:
        for gass in strategy:
            oxygen = int(gass["oxygen"])
            helium = int(gass["helium"])
            preasure = 1.6/(oxygen/100)
            switch_depth = preasure_to_depth(preasure)
            print(preasure, switch_depth)

            if bob:
                engine.add_gas(switch_depth, oxygen, helium)
            else:
                engine.add_gas(0, oxygen, helium)
                bob = True

    profile = engine.calculate(target_depth, bottom_time)
    data = []

    for step in profile:
        print(step)
        data.append({"y": preasure_to_depth(step.abs_p), "x": step.time})

    # print(data)

    for stop in engine.deco_table:
        print(stop)

    return flask.json.dumps(data)


if __name__ == "__main__":
    app.run(debug=True)

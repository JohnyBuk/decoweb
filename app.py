import flask
import decotengu


app = flask.Flask(__name__)


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/plan-dive', methods=['POST'])
def plane_dive():
    data = flask.request.json
    print(flask.json.dumps(data, indent=2))
    target_depth = int(data['target-depth'])
    bottom_time = int(data['bottom-time'])


    result = []

    for strategy in data["strategies"]:
        engine = decotengu.create()
        for gass in strategy:
            oxygen = int(gass["oxygen"])
            helium = int(gass["helium"])
            if not engine._gas_list:  # no gas in engine
                engine.add_gas(0, oxygen, helium)

            else:
                preasure = 1.6/(oxygen/100.0)
                
                switch_depth = engine._to_depth(preasure)
                print(preasure, switch_depth)
                if target_depth > switch_depth:
                    engine.add_gas(switch_depth, oxygen, helium)

        print(engine._gas_list)
        profile = engine.calculate(target_depth, bottom_time)

        tt = []
        for step in profile:
            print(step)
            tt.append({"y": engine._to_depth(step.abs_p), "x": step.time})
        result.append(tt)


        for stop in engine.deco_table:
            print(stop)

    result = flask.json.dumps(result, indent=2)
    print(result)
    return result


if __name__ == "__main__":
    app.run(debug=True)

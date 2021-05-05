import flask
import decotengu

engine = decotengu.create()
engine.add_gas(0, 21)

app = flask.Flask(__name__)


def preasure_to_depth(preasure):
    return 10.0 * (preasure - 1.0)


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/plane_dive', methods=['POST'])
def plane_dive():
    target_depth = int(flask.request.form['target_depth'])
    bottom_time = int(flask.request.form['bottom_time'])

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

import numpy as np
import decotengu
from .models import Strategy, Gas


class DivePlanner:
    def plan_dive(self, strategies: list[Strategy]):
        if not len(strategies):
            return {}
        result = [self.plan_strategy(strategy) for strategy in strategies]
        return self.create_dataset(result)

    def plan_strategy(self, strategy: Strategy):
        engine = decotengu.create()
        for gas in strategy.gas_set.all():
            oxygen = int(gas.oxygen)
            helium = int(gas.helium)
            if not engine._gas_list:  # no gas in engine
                engine.add_gas(0, oxygen, helium)
            else:
                preasure = 1.6 / (oxygen / 100.0)
                switch_depth = (engine._to_depth(preasure) // 3) * 3
                if strategy.target_depth > switch_depth:
                    # TODO select travel gas
                    engine.add_gas(switch_depth, oxygen, helium)

        profile = engine.calculate(strategy.target_depth, strategy.bottom_time)

        time = []
        depth = []

        for step in profile:
            time.append(round(step.time, 1))
            depth.append(round(engine._to_depth(step.abs_p)))

        time, depth = self.fill_missing_values(time, depth)
        return {"time": time, "depth": depth, "strategy": strategy.id}

    def fill_missing_values(self, data_x, data_y, step=0.1):
        time = []
        depth = []
        for [[x0, x1], [y0, y1]] in zip(
            zip(data_x, data_x[1:]), zip(data_y, data_y[1:])
        ):
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

    def create_dataset(self, dives):
        all_strategies = [dive["strategy"] for dive in dives]
        longest_tive = max(dives, key=lambda dive: len(dive["time"]))

        dataset = []
        for t in longest_tive["time"]:
            datapoint = {"time": t}
            for s in all_strategies:
                datapoint[s] = 0
            dataset.append(datapoint)

        for dive in dives:
            for depth, datapoint in zip(dive["depth"], dataset):
                datapoint[dive["strategy"]] = depth
        return dataset

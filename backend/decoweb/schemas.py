from ninja import Schema, ModelSchema
from .models import Strategy, Gas


class GasSchemaOut(ModelSchema):
    class Meta:
        model = Gas
        fields = ["id", "strategy", "oxygen", "helium"]


class GasSchemaIn(Schema):
    strategy: int
    oxygen: int = 21
    helium: int = 0


class StrategySchemaOut(ModelSchema):
    class Meta:
        model = Strategy
        fields = ["id", "target_depth", "bottom_time"]

class SrategySchemaIn(Schema):
    target_depth: int = 20
    bottom_time: int = 10

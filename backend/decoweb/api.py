from ninja import NinjaAPI
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404

from .dive_planner import DivePlanner
from .models import Strategy, Gas
from .schemas import GasSchemaOut, GasSchemaIn, StrategySchemaOut, SrategySchemaIn


api = NinjaAPI(title="Decoweb API")


@api.get("/plan-dive")
def plan_dive(request):
    """
    Plan dive strategies
    """
    try:
        strategies = Strategy.objects.filter(gas__isnull=False).distinct()
        dive_profiles = DivePlanner().plan_dive(strategies)
        return dive_profiles
    except Exception as e:
        raise HttpError(500, f"Error: {e}")


@api.get("/strategies", response=list[StrategySchemaOut])
def get_strategies(request, keep_empty=False):
    """
    Get all strategies
    """
    if keep_empty:
        return Strategy.objects.all()
    return Strategy.objects.filter(gas__isnull=False).distinct()


@api.get("/strategies/{id}", response=StrategySchemaOut)
def get_strategy(request, id: int):
    """
    Get strategy
    """
    return get_object_or_404(Strategy, id=id)


@api.post("/strategies", response=StrategySchemaOut)
def create_strategy(request, payload: SrategySchemaIn, empty: bool = True):
    """
    Create new strategy, possibly with default gas (air)
    """
    strategy = Strategy.objects.create(**payload.dict())
    if not empty:
        # create default gas mixture (air)
        strategy.gas_set.create(strategy=strategy)
    return strategy


@api.delete("/strategies/{id}", response=StrategySchemaOut)
def delete_strategy(request, id: int):
    """
    Delete strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    strategy.delete()
    return strategy


@api.put("/strategies/{id}", response=StrategySchemaOut)
def update_strategy(request, id: int, payload: SrategySchemaIn):
    """
    Update strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    strategy.target_depth = payload.target_depth
    strategy.bottom_time = payload.bottom_time
    strategy.save()
    return strategy


@api.get("/strategies/{id}/gasses/", response=list[GasSchemaOut])
def get_strategy_gasses(request, id: int):
    """
    Get all gasses for strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    return strategy.gas_set.all()


@api.get("/gasses", response=list[GasSchemaOut])
def get_gasses(request):
    """
    Get all gasses
    """
    return Gas.objects.all()


@api.get("/gasses/{id}", response=GasSchemaOut)
def get_gas(request, id: int):
    """
    Get gas
    """
    return get_object_or_404(Gas, id=id)


@api.post("/gasses", response=GasSchemaOut)
def create_gas(request, payload: GasSchemaIn):
    """
    Create new gas
    """
    strategy = get_object_or_404(Strategy, id=payload.strategy)
    return Gas.objects.create(
        strategy=strategy, oxygen=payload.oxygen, helium=payload.helium
    )


@api.delete("/gasses/{id}", response=GasSchemaOut)
def delete_gas(request, id: int):
    """
    Delete gas
    """
    gas = get_object_or_404(Gas, id=id)
    gas.delete()
    return gas


@api.put("/gasses/{id}", response=GasSchemaOut)
def update_gas(request, id: int, payload: GasSchemaIn):
    """
    Update gas
    """
    gas = get_object_or_404(Gas, id=id)
    gas.oxygen = payload.oxygen
    gas.helium = payload.helium
    gas.save()
    return gas

from ninja import Router
from ninja.errors import HttpError, AuthorizationError
from django.shortcuts import get_object_or_404

from .dive_planner import DivePlanner
from .models import Strategy, Gas
from .schemas import GasSchemaOut, GasSchemaIn, StrategySchemaOut, SrategySchemaIn


router = Router()


@router.get("/plan-dive")
def plan_dive(request):
    """
    Plan dive strategies
    """
    try:
        if request.user.is_authenticated:
            strategies = Strategy.objects.filter(gas__isnull=False, user=request.user)
            return DivePlanner().plan_dive(strategies)
        elif "strategies" in request.session:
            ids = request.session["strategies"]
            strategies = Strategy.objects.filter(gas__isnull=False, id__in=ids)
            return DivePlanner().plan_dive(strategies)
        else:
            return {}
    except Exception as e:
        raise HttpError(500, f"Error: {e}")


@router.get("/strategies", response=list[StrategySchemaOut])
def get_strategies(request, keep_empty: bool = False):
    """
    Get all strategies
    """
    if request.user.is_authenticated:
        if keep_empty:
            return Strategy.objects.filter(user=request.user)
        return Strategy.objects.filter(user=request.user, gas__isnull=False)
    elif "strategies" in request.session:
        ids = request.session["strategies"]
        if keep_empty:
            return Strategy.objects.filter(id__in=ids)
        return Strategy.objects.filter(id__in=ids, gas__isnull=False)
    return []


@router.get("/strategies/{id}", response=StrategySchemaOut)
def get_strategy(request, id: int):
    """
    Get strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    if request.user.is_authenticated and strategy.user == request.user:
        return strategy
    elif (
        "strategies" in request.session and strategy.id in request.session["strategies"]
    ):
        return strategy
    raise AuthorizationError()


@router.post("/strategies", response=StrategySchemaOut)
def create_strategy(request, payload: SrategySchemaIn, empty: bool = True):
    """
    Create new strategy, possibly with default gas (air)
    """
    strategy = Strategy.objects.create(**payload.dict())
    if not empty:
        # create default gas mixture (air)
        strategy.gas_set.create(strategy=strategy)
    if request.user.is_authenticated:
        strategy.user = request.user
        strategy.save()
    else:
        if "strategies" in request.session:
            request.session["strategies"].append(strategy.id)
        else:
            request.session["strategies"] = [strategy.id]
        request.session.modified = True
    return strategy


@router.delete("/strategies/{id}", response=StrategySchemaOut)
def delete_strategy(request, id: int):
    """
    Delete strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    if request.user.is_authenticated and strategy.user == request.user:
        pass
    elif (
        "strategies" in request.session and strategy.id in request.session["strategies"]
    ):
        pass
    else:
        raise AuthorizationError()
    strategy.delete()
    return strategy


@router.put("/strategies/{id}", response=StrategySchemaOut)
def update_strategy(request, id: int, payload: SrategySchemaIn):
    """
    Update strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    if request.user.is_authenticated and strategy.user == request.user:
        pass
    elif (
        "strategies" in request.session and strategy.id in request.session["strategies"]
    ):
        pass
    else:
        raise AuthorizationError()
    strategy.target_depth = payload.target_depth
    strategy.bottom_time = payload.bottom_time
    strategy.save()
    return strategy


@router.get("/strategies/{id}/gasses/", response=list[GasSchemaOut])
def get_strategy_gasses(request, id: int):
    """
    Get all gasses for strategy
    """
    strategy = get_object_or_404(Strategy, id=id)
    if request.user.is_authenticated and strategy.user == request.user:
        return strategy.gas_set.all()
    elif (
        "strategies" in request.session and strategy.id in request.session["strategies"]
    ):
        return strategy.gas_set.all()
    raise AuthorizationError()


@router.get("/gasses", response=list[GasSchemaOut])
def get_gasses(request):
    """
    Get all gasses
    """
    if request.user.is_authenticated:
        return Gas.objects.filter(strategy__user=request.user)
    elif "strategies" in request.session:
        ids = request.session["strategies"]
        return Gas.objects.filter(strategy__id__in=ids)
    return []


@router.get("/gasses/{id}", response=GasSchemaOut)
def get_gas(request, id: int):
    """
    Get gas
    """
    gas = get_object_or_404(Gas, id=id)
    if request.user.is_authenticated and gas.strategy.user == request.user:
        pass
    elif (
        "strategies" in request.session
        and gas.strategy.id in request.session["strategies"]
    ):
        pass
    else:
        raise AuthorizationError()
    return gas


@router.post("/gasses", response=GasSchemaOut)
def create_gas(request, payload: GasSchemaIn):
    """
    Create new gas
    """
    strategy = get_object_or_404(Strategy, id=payload.strategy)
    if request.user.is_authenticated and strategy.user == request.user:
        pass
    elif (
        "strategies" in request.session and strategy.id in request.session["strategies"]
    ):
        pass
    else:
        raise AuthorizationError()
    return Gas.objects.create(
        strategy=strategy, oxygen=payload.oxygen, helium=payload.helium
    )


@router.delete("/gasses/{id}", response=GasSchemaOut)
def delete_gas(request, id: int):
    """
    Delete gas
    """
    gas = get_object_or_404(Gas, id=id)
    if request.user.is_authenticated and gas.strategy.user == request.user:
        pass
    elif (
        "strategies" in request.session
        and gas.strategy.id in request.session["strategies"]
    ):
        pass
    else:
        raise AuthorizationError()
    gas.delete()
    return gas


@router.put("/gasses/{id}", response=GasSchemaOut)
def update_gas(request, id: int, payload: GasSchemaIn):
    """
    Update gas
    """
    gas = get_object_or_404(Gas, id=id)
    if request.user.is_authenticated and gas.strategy.user == request.user:
        pass
    elif (
        "strategies" in request.session
        and gas.strategy.id in request.session["strategies"]
    ):
        pass
    else:
        raise AuthorizationError()
    gas.oxygen = payload.oxygen
    gas.helium = payload.helium
    gas.save()
    return gas

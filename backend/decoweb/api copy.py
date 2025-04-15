import json
from ninja import NinjaAPI, Schema
from django.shortcuts import get_object_or_404

from .models import Strategy, Gass
from .planner import Planner

api = NinjaAPI()

class StrategySchema(Schema):
    id: int
    target_depth: int
    bottom_time: int

class StrategyIdSchema(Schema):
    id: int

class GassSchema(Schema):
    id: int
    strategy: StrategyIdSchema
    oxygen: int
    helium: int
    
@api.post("plan-dive/")
def post(request):
    try:
        print(type(request), flush=True)
        data = json.loads(request.body)
        result = {"profiles": Planner().plan_dive(data)}
        return result
    except Exception as e:
        return {"error": str(e)}


@api.get("/strategies", response=list[StrategySchema])
def get_strategies(request):
    return Strategy.objects.all()

@api.get("/strategy/{id}", response=StrategySchema)
def get_strategy(request, id: int):
    return get_object_or_404(Strategy, id=id)

@api.get("/gasses", response=list[GassSchema])
def get_gasses(request):
    return Gass.objects.all()

@api.get("/gass/{id}", response=GassSchema)
def get_gass(request, id: int):
    return get_object_or_404(Gass, id=id)

# @api.post("/strategy")
# def create_employee(request, payload: EmployeeIn):
#     Strategy.objects.create(**payload.dict())
#     return Strategy.objects.all()

# @api.put("/employees/{employee_id}")
# def update_employee(request, employee_id: int, payload: EmployeeIn):
#     employee = get_object_or_404(Strategy, id=employee_id)
#     for attr, value in payload.dict().items():
#         setattr(employee, attr, value)
#     employee.save()
#     return {"success": True}


@api.delete("/employees/{employee_id}")
def delete_employee(request, employee_id: int):
    employee = get_object_or_404(Employee, id=employee_id)
    employee.delete()
    return {"success": True}

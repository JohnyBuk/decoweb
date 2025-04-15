import json
from ninja import NinjaAPI
from .planner import Planner

api = NinjaAPI()
    
@api.post("plan-dive/")
def post(request):
    try:
        data = json.loads(request.body)
        result = {"profiles": Planner().plan_dive(data)}
        return result
    except Exception as e:
        return {"error": str(e)}


from ninja import NinjaAPI
from decoweb.api import router

api = NinjaAPI(csrf=False)
api.add_router("decoweb", router)
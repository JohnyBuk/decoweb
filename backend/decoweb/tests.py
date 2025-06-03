from django.test import TestCase
from ninja.testing import TestClient
from django.contrib.sessions.backends.db import SessionStore

from .api import router
from .schemas import SrategySchemaIn, StrategySchemaOut


class SessionTetsClient(TestClient):
    """Add session store to the request mock"""

    def __init__(self, router_or_app, headers=None, COOKIES=None):
        super().__init__(router_or_app, headers, COOKIES)
        self.session = SessionStore()

    def _build_request(self, *args, **kwargs):
        mock = super()._build_request(*args, **kwargs)
        mock.session = self.session
        return mock


class DecowebTest(TestCase):
    def test_anonymous_user_api(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=20, bottom_time=10)
        strategy_out = StrategySchemaOut(id=1, target_depth=20, bottom_time=10)

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = client.post(
            "/strategies?empty=false",
            data=strategy_in.model_dump_json(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [strategy_out.model_dump()])

        self.assertTrue("strategies" in client.session)
        self.assertEqual(client.session["strategies"], [1])

        response = client.get("/gasses/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], strategy_out.id)

        response = client.get("/strategies/1/gasses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

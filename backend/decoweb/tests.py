from django.test import TestCase
from ninja.testing import TestClient
from django.contrib.sessions.backends.db import SessionStore
from django.contrib.sessions.models import Session

from .api import router
from .schemas import SrategySchemaIn, StrategySchemaOut
from .models import Strategy, Gas


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
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

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
        self.assertEqual(client.session["strategies"], [strategy_out.id])

        response = client.get("/gasses/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], strategy_out.id)

        response = client.get("/strategies/1/gasses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_sessions(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=33, bottom_time=5)
        strategy_out = StrategySchemaOut(id=1, target_depth=33, bottom_time=5)

        response = client.post(
            "/strategies?empty=false",
            data=strategy_in.model_dump_json(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        self.assertTrue("strategies" in client.session)
        self.assertEqual(client.session["strategies"], [strategy_out.id])

        self.assertEqual(len(Strategy.objects.all()), 1)
        strategy = Strategy.objects.all()[0]
        self.assertEqual(strategy.id, strategy_out.id)
        self.assertEqual(strategy.target_depth, strategy_out.target_depth)
        self.assertEqual(strategy.bottom_time, strategy_out.bottom_time)

        self.assertEqual(len(Gas.objects.all()), 1)
        self.assertEqual(Gas.objects.all()[0].strategy.id, strategy_out.id)

        client.session.save()
        self.assertEqual(len(Session.objects.all()), 1)
        session = Session.objects.all()[0].get_decoded()

        self.assertTrue("strategies" in session)
        self.assertEqual(client.session["strategies"], [strategy_out.id])

        # this should trigger session_deleted signal
        Session.objects.all().delete()

        self.assertEqual(len(Session.objects.all()), 0)
        self.assertEqual(len(Strategy.objects.all()), 0)
        self.assertEqual(len(Gas.objects.all()), 0)

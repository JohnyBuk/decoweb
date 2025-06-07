from django.test import TestCase
from ninja.testing import TestClient
from django.contrib.sessions.backends.db import SessionStore
from django.contrib.sessions.models import Session

from .api import router
from .schemas import SrategySchemaIn, StrategySchemaOut, GasSchemaIn, GasSchemaOut
from .models import Strategy, Gas, User


class SessionTetsClient(TestClient):
    """Add session store to the request mock"""

    def __init__(self, router_or_app, headers=None, COOKIES=None):
        super().__init__(router_or_app, headers, COOKIES)
        self.session = SessionStore()

    def _build_request(self, *args, **kwargs):
        mock = super()._build_request(*args, **kwargs)
        mock.session = self.session
        return mock


class TestStrategyApi(TestCase):
    def test_anonymous_user_api(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 403)

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

        response = client.get(f"/strategies/{strategy_out.id}/gasses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["strategy"], strategy_out.id)

        response = client.post(
            "/strategies?empty=true",
            data=strategy_in.model_dump_json(),
        )
        self.assertEqual(response.status_code, 200)

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 200)

        self.assertTrue("strategies" in client.session)
        self.assertEqual(client.session["strategies"], [1, 2])

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

    def test_post_empty_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 403)

        response = client.post(
            "/strategies?empty=true",
            data=strategy_in.model_dump_json(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = client.get("/gasses")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_strategy_default_gass(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 403)

        response = client.post(
            "/strategies?empty=false",
            data=strategy_in.model_dump_json(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get("/strategies")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [strategy_out.model_dump()])

        response = client.get("/gasses")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["strategy"], strategy_out.id)

    def test_logged_user_api(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.get("/strategies", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = client.post(
            "/strategies?empty=false", data=strategy_in.model_dump_json(), user=user
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get("/strategies", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [strategy_out.model_dump()])
        self.assertTrue("strategies" not in client.session)

        response = client.get("/gasses/1", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], strategy_out.id)

        response = client.get(f"/strategies/{strategy_out.id}/gasses/", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["strategy"], strategy_out.id)

        response = client.get(f"/strategies/{strategy_out.id}/gasses/", user=user2)
        self.assertEqual(response.status_code, 403)

    def test_get_empty_user_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        user = User.objects.create()

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json(), user=user
        )

        response = client.get("/strategies?keep_empty=true", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [strategy_out.model_dump()])

    def test_get_empty_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json()
        )

        response = client.get("/strategies?keep_empty=true")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [strategy_out.model_dump()])

    def test_get_anonymous_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.get(f"/strategies/{strategy_out.id}")
        self.assertEqual(response.status_code, 404)

        response = client.post("/strategies", data=strategy_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get(f"/strategies/{strategy_out.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

    def test_get_user_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.get(f"/strategies/{strategy_out.id}", user=user)
        self.assertEqual(response.status_code, 404)

        response = client.post(
            "/strategies", data=strategy_in.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get(f"/strategies/{strategy_out.id}", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get(f"/strategies/{strategy_out.id}", user=user2)
        self.assertEqual(response.status_code, 403)


class TestDeleteStrategy(TestCase):
    def test_delete_nonexisting_strategy(self):
        client = SessionTetsClient(router)
        response = client.delete(f"/strategies/3")
        self.assertEqual(response.status_code, 404)

    def test_delete_user_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.post(
            "/strategies", data=strategy_in.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())
        self.assertEqual(len(Strategy.objects.all()), 1)

        response = client.delete(f"/strategies/{strategy_out.id}")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(len(Strategy.objects.all()), 1)

        response = client.delete(f"/strategies/{strategy_out.id}", user=user2)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(len(Strategy.objects.all()), 1)

        response = client.delete(f"/strategies/{strategy_out.id}", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Strategy.objects.all()), 0)

    def test_delete_anonymous_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.post("/strategies", data=strategy_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())
        self.assertEqual(len(Strategy.objects.all()), 1)

        response = client.delete(f"/strategies/{strategy_out.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Strategy.objects.all()), 0)

    def test_delete_anonymous_strategy_failed(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)

        response = client.post("/strategies", data=strategy_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())
        self.assertEqual(len(Strategy.objects.all()), 1)

        client.session.clear()

        response = client.delete(f"/strategies/{strategy_out.id}")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(len(Strategy.objects.all()), 1)


class TestUpdateStrategy(TestCase):
    def test_update_nonexisting_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)

        response = client.put(f"/strategies/3", data=strategy_in.model_dump_json())
        self.assertEqual(response.status_code, 404)

    def test_update_user_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        strategy_updated_in = SrategySchemaIn(target_depth=25, bottom_time=20)
        strategy_updated_out = StrategySchemaOut(id=1, target_depth=25, bottom_time=20)

        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.post(
            "/strategies", data=strategy_in.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())
        self.assertEqual(len(Strategy.objects.all()), 1)

        response = client.put(
            f"/strategies/{strategy_out.id}", data=strategy_updated_in.model_dump_json()
        )
        self.assertEqual(response.status_code, 403)

        response = client.put(
            f"/strategies/{strategy_out.id}",
            data=strategy_updated_in.model_dump_json(),
            user=user2,
        )
        self.assertEqual(response.status_code, 403)

        response = client.put(
            f"/strategies/{strategy_out.id}",
            data=strategy_updated_in.model_dump_json(),
            user=user,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_updated_out.model_dump())

    def test_update_anonymous_strategy(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        strategy_updated_in = SrategySchemaIn(target_depth=25, bottom_time=20)
        strategy_updated_out = StrategySchemaOut(id=1, target_depth=25, bottom_time=20)

        response = client.post("/strategies", data=strategy_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.put(
            f"/strategies/{strategy_out.id}", data=strategy_updated_in.model_dump_json()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_updated_out.model_dump())

    def test_update_anonymous_strategy_failed(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        strategy_updated_in = SrategySchemaIn(target_depth=25, bottom_time=20)

        response = client.post("/strategies", data=strategy_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        client.session.clear()

        response = client.put(
            f"/strategies/{strategy_out.id}", data=strategy_updated_in.model_dump_json()
        )
        self.assertEqual(response.status_code, 403)


class TestGetGasses(TestCase):
    def test_get_user_gasses(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        gas_in = GasSchemaIn(strategy_id=1, oxygen=50, helium=20)
        gas_out = GasSchemaOut(id=1, strategy_id=1, oxygen=50, helium=20)
        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.post("/gasses", data=gas_in.model_dump_json(), user=user)
        self.assertEqual(response.status_code, 404)

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get("/gasses", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = client.post("/gasses", data=gas_in.model_dump_json(), user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())

        response = client.get("/gasses", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [gas_out.model_dump()])

        response = client.get("/gasses", user=user2)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = client.get(f"/gasses/{gas_out.id}", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())

        response = client.post("/gasses", data=gas_in.model_dump_json(), user=user2)
        self.assertEqual(response.status_code, 403)

    def test_get_anonymous_user_gasses(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        gas_in = GasSchemaIn(strategy_id=1, oxygen=50, helium=20)
        gas_out = GasSchemaOut(id=1, strategy_id=1, oxygen=50, helium=20)

        response = client.post("/gasses", data=gas_in.model_dump_json())
        self.assertEqual(response.status_code, 404)

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.get("/gasses")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = client.post("/gasses", data=gas_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())

        response = client.get("/gasses")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [gas_out.model_dump()])

        response = client.get(f"/gasses/{gas_out.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())

        client.session.clear()

        response = client.get("/gasses")
        self.assertEqual(response.status_code, 403)

        response = client.get(f"/gasses/{gas_out.id}")
        self.assertEqual(response.status_code, 403)


class TestDeleteGas(TestCase):
    def test_delete_anonymous_user_gasses(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        gas_in = GasSchemaIn(strategy_id=1, oxygen=50, helium=20)
        gas_out = GasSchemaOut(id=1, strategy_id=1, oxygen=50, helium=20)

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())
        self.assertEqual(len(Gas.objects.all()), 0)

        response = client.post("/gasses", data=gas_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())
        self.assertEqual(len(Gas.objects.all()), 1)

        response = client.delete(f"/gasses/{gas_out.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Gas.objects.all()), 0)

    def test_delete_user_gas_failed(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        gas_in = GasSchemaIn(strategy_id=1, oxygen=50, helium=20)
        gas_out = GasSchemaOut(id=1, strategy_id=1, oxygen=50, helium=20)
        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())
        self.assertEqual(len(Gas.objects.all()), 0)

        response = client.post("/gasses", data=gas_in.model_dump_json(), user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())
        self.assertEqual(len(Gas.objects.all()), 1)

        response = client.delete(f"/gasses/{gas_out.id}", user=user2)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(len(Gas.objects.all()), 1)

        response = client.delete(f"/gasses/{gas_out.id}", user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Gas.objects.all()), 0)


class TestUodateGas(TestCase):
    def test_update_anonymous_user_gas(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        gas_in = GasSchemaIn(strategy_id=1, oxygen=50, helium=20)
        gas_out = GasSchemaOut(id=1, strategy_id=1, oxygen=50, helium=20)
        gas_in_updated = GasSchemaIn(strategy_id=1, oxygen=32, helium=5)
        gas_out_updated = GasSchemaOut(id=1, strategy_id=1, oxygen=32, helium=5)

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.put(
            f"/gasses/{gas_out.id}", data=gas_in_updated.model_dump_json()
        )
        self.assertEqual(response.status_code, 404)

        response = client.post("/gasses", data=gas_in.model_dump_json())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())

        response = client.put(
            f"/gasses/{gas_out.id}", data=gas_in_updated.model_dump_json()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out_updated.model_dump())

    def test_update_user_gas(self):
        client = SessionTetsClient(router)
        strategy_in = SrategySchemaIn(target_depth=22, bottom_time=11)
        strategy_out = StrategySchemaOut(id=1, target_depth=22, bottom_time=11)
        gas_in = GasSchemaIn(strategy_id=1, oxygen=50, helium=20)
        gas_out = GasSchemaOut(id=1, strategy_id=1, oxygen=50, helium=20)
        gas_in_updated = GasSchemaIn(strategy_id=1, oxygen=32, helium=5)
        gas_out_updated = GasSchemaOut(id=1, strategy_id=1, oxygen=32, helium=5)
        user = User.objects.create()
        user2 = User.objects.create(username="decoweb")

        response = client.post(
            "/strategies?empty=true", data=strategy_in.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, strategy_out.model_dump())

        response = client.put(
            f"/gasses/{gas_out.id}", data=gas_in_updated.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 404)

        response = client.post("/gasses", data=gas_in.model_dump_json(), user=user)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out.model_dump())

        response = client.put(
            f"/gasses/{gas_out.id}", data=gas_in_updated.model_dump_json(), user=user2
        )
        self.assertEqual(response.status_code, 403)

        response = client.put(
            f"/gasses/{gas_out.id}", data=gas_in_updated.model_dump_json(), user=user
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, gas_out_updated.model_dump())

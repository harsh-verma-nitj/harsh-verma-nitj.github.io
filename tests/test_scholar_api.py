import unittest
from unittest.mock import Mock
from server.app import create_app


ORIGIN = "https://harsh-verma-nitj.github.io"


class ScholarApiTests(unittest.TestCase):
    def test_every_request_fetches_again_and_is_not_cached(self):
        fetcher = Mock(side_effect=[{"citations": 2618}, {"citations": 2619}])
        client = create_app(fetcher).test_client()
        first = client.get("/api/scholar-metrics?t=1", headers={"Origin": ORIGIN})
        second = client.get("/api/scholar-metrics?t=2", headers={"Origin": ORIGIN})
        self.assertEqual(first.json["citations"], 2618)
        self.assertEqual(second.json["citations"], 2619)
        self.assertEqual(fetcher.call_count, 2)
        self.assertIn("no-store", second.headers["Cache-Control"])
        self.assertEqual(second.headers["Access-Control-Allow-Origin"], ORIGIN)

    def test_upstream_failure_never_returns_saved_figures(self):
        fetcher = Mock(side_effect=OSError("HTTP 403"))
        app = create_app(fetcher)
        with self.assertLogs("server.app", level="ERROR"):
            response = app.test_client().get("/api/scholar-metrics")
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json, {"error": "scholar_unavailable"})
        self.assertIn("no-store", response.headers["Cache-Control"])

    def test_other_origins_are_rejected_before_fetch(self):
        fetcher = Mock()
        response = create_app(fetcher).test_client().get(
            "/api/scholar-metrics", headers={"Origin": "https://other.example"}
        )
        self.assertEqual(response.status_code, 403)
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)
        fetcher.assert_not_called()


if __name__ == "__main__":
    unittest.main()

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("scholar", Path(__file__).resolve().parents[1] / "scripts/update_scholar.py")
scholar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scholar)

HTML = '''<div id="gsc_prf_in">Harsh Kumar Verma</div>
<table id="gsc_rsb_st"><tr><th></th><th>All</th><th>Since 2022</th></tr>
<tr><td><a>Citations</a></td><td>2,617</td><td>1506</td></tr>
<tr><td>h-index</td><td>28</td><td>23</td></tr>
<tr><td>i10-index</td><td>77</td><td>44</td></tr></table>
<span style="left:0" class="gsc_g_t">2025</span><span class="gsc_g_t">2026</span>
<span class="gsc_g_al">265</span><span class="gsc_g_al">127</span>'''


class ScholarTests(unittest.TestCase):
    def test_complete_table_and_rolling_year(self):
        data = scholar.parse_metrics(HTML, "2026-10-07T07:00:00+00:00")
        self.assertEqual(data["recent_since"], 2022)
        self.assertEqual(data["metrics"]["citations"], {"all": 2617, "recent": 1506})
        self.assertEqual(data["metrics"]["i10_index"]["recent"], 44)
        self.assertEqual(data["annual_citations"], [{"year": 2025, "citations": 265}, {"year": 2026, "citations": 127}])

    def test_incomplete_and_wrong_profiles_rejected(self):
        for html in ["<html>Access denied</html>", HTML.replace("Harsh Kumar Verma", "Another Author"), HTML.replace("<td>77</td>", "<td></td>"), HTML.replace("<td>1506</td>", "<td>9999</td>")]:
            with self.subTest(html=html[:40]), self.assertRaises(ValueError):
                scholar.parse_metrics(html)

    def test_failed_request_preserves_last_success(self):
        def blocked(*args, **kwargs):
            raise OSError("Request unavailable")
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "scholar-metrics.json"
            snapshot = json.dumps({"last": "verified"})
            output.write_text(snapshot)
            with self.assertRaises(OSError):
                scholar.refresh(output, blocked)
            self.assertEqual(output.read_text(), snapshot)


if __name__ == "__main__":
    unittest.main()

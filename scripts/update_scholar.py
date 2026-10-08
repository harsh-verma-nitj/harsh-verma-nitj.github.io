"""Refresh verified public Google Scholar metrics; leave the last snapshot on failure."""
import argparse
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.request

PROFILE_ID = "h0edtgIAAAAJ"
SOURCE = f"https://scholar.google.com/citations?hl=en&user={PROFILE_ID}"
OUTPUT = Path(__file__).resolve().parents[1] / "assets/scholar-metrics.json"


class Cells(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.row = []
        elif tag in ("td", "th"):
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            self.row.append("".join(self.cell).strip())
            self.cell = None
        elif tag == "tr" and self.row is not None:
            self.rows.append(self.row)
            self.row = None


def parse_metrics(html, updated_at=None):
    name = re.search(r'<div\b[^>]*id="gsc_prf_in"[^>]*>(.*?)</div>', html, re.S)
    if not name or "Harsh" not in unescape(name[1]) or "Verma" not in unescape(name[1]):
        raise ValueError("The expected Google Scholar profile was not returned")
    table = re.search(r'<table\b[^>]*id="gsc_rsb_st"[^>]*>(.*?)</table>', html, re.S)
    if not table:
        raise ValueError("Google Scholar metrics table is missing")
    parser = Cells()
    parser.feed(table[0])
    header = parser.rows[0]
    if len(header) != 3 or header[1] != "All" or not re.fullmatch(r"Since \d{4}", header[2]):
        raise ValueError("Unexpected metrics table header")
    metrics = {}
    for label, key in [("Citations", "citations"), ("h-index", "h_index"), ("i10-index", "i10_index")]:
        row = next((r for r in parser.rows[1:] if r and r[0] == label), None)
        if not row or len(row) != 3 or not all(re.fullmatch(r"[\d,]+", v) for v in row[1:]):
            raise ValueError(f"Invalid or missing {label}")
        total, recent = (int(v.replace(",", "")) for v in row[1:])
        if recent > total:
            raise ValueError(f"Recent {label} exceeds its total")
        metrics[key] = {"all": total, "recent": recent}
    # The year labels and values are emitted in the same chronological order.
    years = re.findall(r'<span\b[^>]*class="gsc_g_t"[^>]*>(\d{4})</span>', html)
    counts = re.findall(r'<span\b[^>]*class="gsc_g_al"[^>]*>(\d+)</span>', html)
    if not years or len(years) != len(counts) or years != sorted(set(years)):
        raise ValueError("Invalid annual citation graph")
    annual = [{"year": int(y), "citations": int(c)} for y, c in zip(years, counts)][-8:]
    return {
        "profile_id": PROFILE_ID,
        "source": SOURCE,
        "updated_at": updated_at or datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "recent_since": int(header[2].split()[1]),
        "metrics": metrics,
        "annual_citations": annual,
    }


def fetch_metrics(opener=urllib.request.urlopen):
    """Fetch and validate Scholar directly, without reading a saved snapshot."""
    request = urllib.request.Request(SOURCE, headers={"User-Agent": "Mozilla/5.0"})
    with opener(request, timeout=30) as response:
        if response.status != 200:
            raise ValueError(f"Google Scholar returned HTTP {response.status}")
        html = response.read(2_000_000).decode("utf-8")
    return parse_metrics(html)


def refresh(output=OUTPUT, opener=urllib.request.urlopen):
    data = fetch_metrics(opener)
    # Validate the complete response before touching the existing file.
    temporary = output.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    return data


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__).parse_args()
    try:
        data = refresh()
        print(f"Updated Google Scholar metrics at {data['updated_at']}")
    except Exception as error:
        raise SystemExit(f"Refresh failed; last successful metrics retained: {error}")

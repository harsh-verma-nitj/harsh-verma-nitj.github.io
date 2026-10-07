# Prof. Harsh K. Verma — Academic Website

Static academic profile prepared for GitHub Pages.

## Google Scholar metrics

The homepage displays Google Scholar, IRINS / Vidwan, ORCID, Scopus and Web of Science links, plus the citation, h-index and i10-index table and annual citation chart from Scholar profile `h0edtgIAAAAJ`. The recent-period heading is read from Scholar, so it can roll forward each year.

`.github/workflows/update-scholar.yml` fetches the public profile once daily and can also be run manually from Actions. The standard-library Python updater validates the author and the complete metrics before atomically saving `assets/scholar-metrics.json`. Failed or blocked requests leave the last successful snapshot intact. The update date always refers to a successful fetch, rather than a page visit.

The homepage requests that JSON from the repository's raw URL because a commit made with `GITHUB_TOKEN` does not trigger a branch-based GitHub Pages build. Its embedded HTML snapshot remains visible if JavaScript or the JSON request is unavailable. No Scholar credentials, proxy or browser scraping service is used. Google Scholar may restrict automated requests; failed refreshes are reported in the Actions run. GitHub may disable scheduled workflows after 60 days of repository inactivity; re-enable the schedule in Actions if needed.

Run the integrity checks with `python3 -m unittest discover -s tests -v` and refresh manually with `python3 scripts/update_scholar.py`.

## Publish on GitHub Pages

Website address: https://harsh-verma-nitj.github.io/

The site files are in the repository root. To enable publishing:

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then click **Save**.
4. Wait for GitHub's Pages deployment to complete.

Changes committed to `main` are then published automatically. No build command or external hosting is required.

## Design and navigation

The site uses a navy profile header, compact overview cards and seven static pages: Home, Experience, Research, Publications, Supervision, Recognition and Contact. It supports mobile navigation and a user-selectable dark theme. All supplied academic records remain on their relevant pages. Old homepage section anchors redirect to the corresponding page.

## Profile photo

The portrait is stored locally at `assets/profile.jpg`. It is the official NITJ faculty photograph, downloaded from https://www.nitj.ac.in/images/faculty/16081670370.jpg (894 × 1146 pixels). The website uses CSS to display it without altering the photograph. This replaces the former 128 × 128 remotely linked thumbnail.

The official CSE profile data also supplies the Google Scholar identifier and the MS (Software Systems, BITS Pilani, 1998) and BE (Computer Science and Engineering, Gulbarga University, 1993) qualifications.

## Main sources used

- Official NIT Jalandhar CSE faculty profile: https://departments.nitj.ac.in/dept/cse/Faculty/6430445438bff038a7805712
- NITJ IRINS/Vidwan: https://nitj.irins.org/profile/90371
- ORCID: https://orcid.org/0000-0003-4826-6150
- Scopus Author ID: 57204684351
- ResearcherID: Y-4606-2019

## Additional profile material (October 2026)

The website incorporates the owner-supplied current research summary, two sponsored projects, two granted patents, ten consultancy projects, nineteen doctoral records and publication references from the September 2026 academic record. The existing Phase I project remains listed. Exact Dean and Computer Centre appointment dates were added.

Publications can be searched by keyword and filtered by year or type. The list contains 81 distinct, retained references from the supplied record, not a lifetime publication total. All entries remain visible when JavaScript is unavailable; JavaScript adds filtering and pagination.

Editorial corrections retained for future maintenance:

- The supplied SCI-list entry 31 associates an alternative cloud/edge-IoT title with DOI `10.1002/ett.3292`. Wiley identifies that DOI as the lightweight Cloud-IoT crowdsensing authentication article already present as entry 32. Entry 31 is held for clarification and is not published separately. The publisher-confirmed cloud-assisted edge-IoT article (`10.1002/ett.3883`, supplied entry 27) remains listed.
- The authentication article is listed under the 2019 journal-volume year; Wiley records an initial online publication in February 2018.
- The supplied cloudlet-completion paper is a Procedia Computer Science proceedings article. Its DOI was corrected to `10.1016/j.procs.2016.08.067` using the Elsevier record and its type is shown as conference paper.
- The Hadoop/tweets chapter is listed under the supplied citation's 2021 publication year; the conference was ICRIC 2020.
- Current indexing, journal quartiles and live citation metrics are not inferred from the application form's categories.

Correction sources:

- https://onlinelibrary.wiley.com/doi/abs/10.1002/ett.3292
- https://onlinelibrary.wiley.com/doi/abs/10.1002/ett.3883
- https://www.sciencedirect.com/science/article/pii/S1877050916318178

Before publishing as an official personal website, Prof. Verma should review biographical wording, current administrative roles, photograph choice, and any publication/supervision items that should be added or removed.

The official department profile lists Best Teacher Awards in 2018 and 2024. Those dates replace the earlier 2017 date drawn from IRINS; the differing database entry is not counted as an additional award.

The Head of Computer Science and Engineering appointment shown on the Experience page is dated 1 January 2018–4 February 2020, as recorded in the official CSE faculty profile data (`admin_responsibility`).

The Recognition page includes the owner-supplied award: Best Professor in Computer Engineering, Dewang Mehta Business School Awards, 2013. The NIT Jalandhar Best Teacher Awards for 2018 and 2024 are displayed as separate rows.

# Harsh K Verma

Personal faculty website for Harsh K Verma, Professor, Dr B. R. Ambedkar National Institute of Technology Jalandhar.

[View the website](https://harsh-verma-nitj.github.io/)

## Edit a page

Each page has its own HTML file. Sign in to GitHub with an account that has write access to this repository. Open a file below, click the pencil icon (**Edit this file**), make the change, then choose **Commit changes**. Changes saved to `main` publish through GitHub Pages.

| Page         | Source file                            | Contents                                                                 |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------ |
| Home         | [index.html](index.html)               | Name, designation, portrait, About, research themes and citation figures |
| Experience   | [experience.html](experience.html)     | Teaching experience, positions held and qualifications                   |
| Research     | [research.html](research.html)         | Research interests, projects, patents and consultancy                    |
| Publications | [publications.html](publications.html) | Books, book chapters, journal articles and conference papers             |
| Supervision  | [supervision.html](supervision.html)   | Doctoral supervision records                                             |
| Recognition  | [service.html](service.html)           | Awards and professional memberships                                      |
| Contact      | [contact.html](contact.html)           | Email, office address, phone and research profile links                  |

The HTML is indented, with comments marking the main sections. Search for the heading or existing text to find the part you want to change. Edit the text between tags, keeping the tags in place. For example:

```html
<h2>Research Interests</h2>
```

On the Publications page, each article is an `<article class="publication">` block. When adding a journal article or conference paper, update its `data-year` and `data-type` attributes so the filters work. Add a matching year option if that year is not already in the dropdown. Books and book chapters are in the separate section at the top.

## Appearance and shared elements

- [assets/style.css](assets/style.css): colours, fonts, spacing, portrait crops and mobile layout.
- [assets/script.js](assets/script.js): navigation, dark mode, publication filters and citation refresh.
- [assets/profile-maroon-v2.jpg](assets/profile-maroon-v2.jpg): the portrait displayed on every page.

The navigation and footer are copied into each HTML file. The profile sidebar is copied into the six inner pages. Apply changes to those shared elements in each relevant file.

## Citation figures

The homepage initially displays the last verified figures from [assets/scholar-metrics.json](assets/scholar-metrics.json). **Refresh** requests current figures through the live API, once its URL is set in [assets/scholar-config.json](assets/scholar-config.json). Every click makes a new Scholar request; successful checks update the table, chart and date. Failed checks preserve the verified figures and show a failure message.

[server/README.md](server/README.md) explains how to host and connect the API. It is not deployed yet: `live_endpoint` is empty, and the button reports that live refresh is not connected. GitHub Pages hosts the HTML and assets but cannot run this Python service.

The [Render setup](render.yaml) defines a free service with the required settings. [Deploy the Scholar API](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fharsh-verma-nitj%2Fharsh-verma-nitj.github.io) in your Render account, then connect its verified HTTPS endpoint. Free instances can take about a minute to wake up after being idle.

[scripts/update_scholar.py](scripts/update_scholar.py) also updates the saved snapshot. The [Scholar workflow](.github/workflows/update-scholar.yml) runs daily and can be run manually from the repository's Actions tab. Scholar returned HTTP 403 to the GitHub runner on 7 and 8 October 2026. A direct fetch on 8 October succeeded. The live API must be tested from its chosen host because Scholar can refuse requests from that host too.

## Local preview

From the repository folder, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. No build step is required.

The Scholar updater checks can be run with:

```sh
python3 -m pip install -r server/requirements.txt
python3 -m unittest discover -s tests -v
node tests/test_refresh.js
```

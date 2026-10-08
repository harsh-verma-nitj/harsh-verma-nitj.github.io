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

The homepage reads the saved figures in [assets/scholar-metrics.json](assets/scholar-metrics.json). Its **Refresh** button loads the latest saved figures; it does not fetch Google Scholar directly.

[scripts/update_scholar.py](scripts/update_scholar.py) updates the snapshot from the public Scholar profile. The [Scholar workflow](.github/workflows/update-scholar.yml) runs daily and can be run manually from the repository's Actions tab. If Scholar blocks a request, the last saved figures and their date remain available.

## Local preview

From the repository folder, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. No build step is required.

The Scholar updater checks can be run with:

```sh
python3 -m unittest discover -s tests -v
```

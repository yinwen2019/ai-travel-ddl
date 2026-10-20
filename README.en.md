<div align="center">

# AI Travel DDL ✈️

### Track the deadline. Discover the destination.

Conference dates and destinations for AI researchers and students.<br />
Find submission deadlines, plan your conference calendar, and explore the cities along the way.

<p>
  <a href="./README.md"><img src=".github/assets/readme/lang-zh.svg" alt="切换到简体中文" width="112" height="34" /></a>
  <a href="./README.en.md"><img src=".github/assets/readme/lang-en-active.svg" alt="English (current language)" width="112" height="34" /></a>
</p>

**[Open the website →](https://yinwen2019.github.io/ai-travel-ddl/)** · [Find deadlines](https://yinwen2019.github.io/ai-travel-ddl/#/conference) · [Explore the globe](https://yinwen2019.github.io/ai-travel-ddl/#/world)

No sign-up · Runs in your browser · Mobile layouts and dark mode

</div>

[![AI Travel DDL homepage with conference navigation and historical host-city rankings](.github/assets/readme/home.png)](https://yinwen2019.github.io/ai-travel-ddl/)

## A paper to finish. A city to look forward to.

When preparing a submission, you need abstract and paper deadlines. When preparing for the conference, you want to know where it takes place, when to travel, and what to explore nearby.

AI Travel DDL connects those questions. Follow a conference, browse a year of research events, then get to know the host cities. It is a reference for your submission plans and a little inspiration for your next academic trip.

## Where would you like to start?

| Your goal | Start here | What you can explore |
| --- | --- | --- |
| Follow a conference and check its next edition | [Conference view](https://yinwen2019.github.io/ai-travel-ddl/#/conference) | Search and filter conferences; browse editions, date milestones, destinations, and official websites |
| Review a year of submission opportunities | [Year view](https://yinwen2019.github.io/ai-travel-ddl/#/year) | Conference cards grouped by year, with milestones and countdowns for abstracts, papers, and conference dates |
| See where AI research brings people together | [World view](https://yinwen2019.github.io/ai-travel-ddl/#/world) | An interactive 3D globe, conference-city markers, city navigation, and a table of host cities by year |
| Get to know your conference destination | [City view](https://yinwen2019.github.io/ai-travel-ddl/#/cities) | Search cities and countries, filter by continent or guide availability, and browse associated conferences and travel information |

## Take a look

### Follow research around the world

Rotate the globe and locate cities to explore the geography of AI conferences. Zoom in to discover original miniature landmarks in selected cities.

[![World view with the interactive globe, conference-city markers, and navigation controls](.github/assets/readme/world.png)](https://yinwen2019.github.io/ai-travel-ddl/#/world)

<details>
<summary><strong>Conference view: from the next submission to the next destination</strong></summary>

Each conference has its own row. Browse editions horizontally, and use search and category filters to focus on the conferences you follow.

[![Conference view with filters, edition cards, and date milestones](.github/assets/readme/conference.png)](https://yinwen2019.github.io/ai-travel-ddl/#/conference)

</details>

<details>
<summary><strong>City view: sights, seasons, and local food</strong></summary>

Open a host city's page to see available climate information, attractions, food, travel tips, and associated conferences. Travel guides currently cover selected cities; conference records remain available for other destinations.

[![City view with destination search, continent filters, and travel guides](.github/assets/readme/cities.png)](https://yinwen2019.github.io/ai-travel-ddl/#/cities)

</details>

Screenshots show a snapshot of the current version. Visit the website for current dates, countdowns, and coverage.

## Conferences covered

The project currently includes these 13 AI conferences, with historical host information and published information about future editions:

| Area | Conferences |
| --- | --- |
| Computer vision | CVPR · ICCV · ECCV |
| Natural language processing | ACL · EMNLP · NAACL |
| Machine learning | NeurIPS · ICML · ICLR |
| General AI and multimedia | AAAI · IJCAI · ACM MM |
| Data mining | KDD |

Suggest another conference or report an incorrect date or venue through an [Issue](https://github.com/yinwen2019/ai-travel-ddl/issues).

## Data and feature availability

- **Maintenance:** Conference information is stored in version-controlled JSON files. GitHub Actions periodically runs AI-assisted research and validation, creating an update PR when data changes. Updates are published after review and merge.
- **Dates:** Conference schedules can change. Confirm submission deadlines and their time zones, registration details, and travel arrangements on the official conference website. Unconfirmed information is shown as “待公布” (to be announced).
- **Travel information:** Guides cover selected cities. Original 3D landmarks are artistic representations, not accurate city layouts or conference venues.
- **Languages:** This README is available in Chinese and English. Most website interface text is currently in Chinese.

Planned additions include calendar export, deadline notifications, conference bookmarks, a bilingual website interface, and more travel information. **These features are not yet available.** Let us know which would help you most in an Issue.

## Run locally and contribute

Just looking for conference information? [Open the website](https://yinwen2019.github.io/ai-travel-ddl/)—no installation or API key required.

For local development, use Node.js 24 (matching this project's GitHub Actions) and npm:

```bash
git clone https://github.com/yinwen2019/ai-travel-ddl.git
cd ai-travel-ddl
npm ci
npm run dev
```

Open the address printed in your terminal, normally `http://localhost:5173`.

<details>
<summary><strong>Developer notes: stack, project structure, and commands</strong></summary>

**Stack:** Vue 3 · TypeScript · Vite · Tailwind CSS · Vue Router (hash routing) · Three.js / Globe.GL · JSON Schema / Ajv · Python · GitHub Actions / Pages.

```text
data/           Conference data, city guides, and validation schemas
src/            Pages, components, read-only data aggregation, and styles
scripts/        Data validation and AI-assisted update scripts
public/         Website assets
.github/        Update and deployment workflows, plus README images
.docs/          Requirements, architecture, and implementation notes
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run validate` | Validate conference and city JSON data |
| `npm run type-check` | Check TypeScript types |
| `npm run build` | Validate data and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint with automatic fixes |
| `npm run format` | Format frontend code |

AI service keys are not needed to run the frontend. To use the data update script, see the [AI update pipeline](.docs/08-ai-update-pipeline.md) and [.env.example](.env.example). It requires Python 3.11+ and the relevant service configuration. Internal project documentation is primarily in Chinese.

</details>

Contributions are welcome: correct conference information, add city guides, or improve the interface. For data changes, include official source links, verify dates and time zones, and run:

```bash
npm run validate
npm run type-check
npm run build
```

See [AGENTS.md](AGENTS.md) for development conventions and the [data schema documentation](.docs/04-data-schema.md) for data formats.

---

If this helps you plan a submission or look forward to a new city, bookmark the [website](https://yinwen2019.github.io/ai-travel-ddl/) or give the project a ⭐.

**Finish the paper, catch the flight, and explore the world.**

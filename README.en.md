<div align="center">

# ConfTrip ✈️

### Track the deadline. Discover the destination.

Conference dates and destinations for AI researchers and students.<br />
Find submission deadlines, explore host cities, and vote for the destination you hope to visit next.

<p>
  <a href="./README.md"><img src=".github/assets/readme/lang-zh.svg" alt="切换到简体中文" width="112" height="34" /></a>
  <a href="./README.en.md"><img src=".github/assets/readme/lang-en-active.svg" alt="English (current language)" width="112" height="34" /></a>
</p>

**[Open the website →](https://aitravel.gonsun.com/)** · [Find deadlines](https://aitravel.gonsun.com/#/conference) · [Browse rankings](https://aitravel.gonsun.com/#/rankings)

No sign-up · Runs in your browser · Mobile layouts and dark mode

</div>

[![ConfTrip homepage with conference navigation, four ranking boards, and the like button](.github/assets/readme/home.png)](https://aitravel.gonsun.com/)

## A paper to finish. A city to look forward to.

When preparing a submission, you need abstract and paper deadlines. When preparing for the conference, you want to know where it takes place, when to travel, and what to explore nearby.

ConfTrip connects those questions. Follow a conference, browse a year of research events, then get to know the host cities. Rankings also show which conferences and cities attract attention. Vote for a city you would like to host a future conference, or leave a heart on the homepage to encourage the project.

## Where would you like to start?

| Your goal | Start here | What you can explore |
| --- | --- | --- |
| Follow a conference and check its next edition | [Conference view](https://aitravel.gonsun.com/#/conference) | Search and filter conferences; browse editions, date milestones, destinations, and official websites |
| Review a year of submission opportunities | [Year view](https://aitravel.gonsun.com/#/year) | Conference cards grouped by year, with milestones and countdowns for abstracts, papers, and conference dates |
| See where AI research brings people together | [World view](https://aitravel.gonsun.com/#/world) | An interactive 3D globe, conference-city markers, city navigation, and a table of host cities by year |
| Get to know your conference destination | [City view](https://aitravel.gonsun.com/#/cities) | Search cities and countries, filter by continent or guide availability, and browse associated conferences and travel information |
| Explore community interests and share your next destination | [Rankings](https://aitravel.gonsun.com/#/rankings) | Switch between four boards, search full rankings, and vote for cities you would like to host a conference |

## From research footprints to future destinations

Use the arrows on the homepage to **manually switch between four ranking boards**. Open “榜单详情” (ranking details) or **Rankings** in the navigation for the full lists. Search filters the results while preserving their original ranks.

| Board | What it shows | How it is counted |
| --- | --- | --- |
| [Host cities](https://aitravel.gonsun.com/#/rankings?board=hosting) | Cities with more recorded conference editions | Historical in-person editions in this project's dataset; online and future editions are excluded |
| [Conference interest](https://aitravel.gonsun.com/#/rankings?board=conference-heat) | Conferences attracting attention on the site | Cumulative deliberate conference clicks, combined across editions of the same conference |
| [City interest](https://aitravel.gonsun.com/#/rankings?board=city-heat) | Destinations visitors are curious about | Cumulative deliberate city clicks |
| [City wishlist · evolving](https://aitravel.gonsun.com/#/rankings?board=city-wishlist) | Where visitors hope a future conference will take place | Votes for cities already in the directory; each accepted action adds one vote, and repeat votes are supported |

Interest and wishlist boards rank cumulative counts, with ties sharing a rank. Entries with no clicks or votes remain unranked. Refreshing, hovering, filtering, changing years, and switching boards do not add interest counts. **Repeat clicks and votes count separately; these totals do not represent unique visitors.**

### Where would you like to attend a conference next?

Open the [city wishlist](https://aitravel.gonsun.com/#/rankings?board=city-wishlist), search for a destination, and tap its heart to express your wish for it to host a future conference. Voting and site-wide totals are connected; the feature and its experience are still being refined.

The homepage's “点个赞” (like) button lets you encourage the project without signing in. Each click shows a `+1` animation, and you can click repeatedly. **Project likes and city votes are counted separately.** GitHub and Xiaohongshu links on the homepage make it easy to find the repository and follow updates.

## Take a look

### Follow research around the world

Rotate the globe and locate cities to explore the geography of AI conferences. Zoom in to discover original miniature landmarks in selected cities.

[![World view with the interactive globe, conference-city markers, and navigation controls](.github/assets/readme/world.png)](https://aitravel.gonsun.com/#/world)

<details>
<summary><strong>Conference view: from the next submission to the next destination</strong></summary>

Each conference has its own row. Browse editions horizontally, and use search and category filters to focus on the conferences you follow.

[![Conference view with filters, edition cards, and date milestones](.github/assets/readme/conference.png)](https://aitravel.gonsun.com/#/conference)

</details>

<details>
<summary><strong>City view: sights, seasons, and local food</strong></summary>

Open a host city's page to see available climate information, attractions, food, travel tips, and associated conferences. Travel guides currently cover selected cities; conference records remain available for other destinations.

[![City view with destination search, continent filters, and travel guides](.github/assets/readme/cities.png)](https://aitravel.gonsun.com/#/cities)

</details>

<details>
<summary><strong>Full rankings and city wishlist voting</strong></summary>

The host-city board shows cities, countries, associated conferences, year ranges, and edition totals. Other boards show their corresponding click or vote totals.

[![Full rankings with four board options, search, and counting rules](.github/assets/readme/rankings.png)](https://aitravel.gonsun.com/#/rankings)

[![City wishlist with candidate destinations, cumulative votes, and heart buttons](.github/assets/readme/city-wishlist.png)](https://aitravel.gonsun.com/#/rankings?board=city-wishlist)

</details>

Screenshots are snapshots of the production website. Dates, countdowns, ranking totals, and coverage change over time; visit the site for the current information.

## Conferences covered

The project currently includes these 13 AI conferences, with historical host information and published information about future editions:

| Area | Conferences |
| --- | --- |
| Computer vision | CVPR · ICCV · ECCV |
| Natural language processing | ACL · EMNLP · NAACL |
| Machine learning | NeurIPS · ICML · ICLR |
| General AI and multimedia | AAAI · IJCAI · ACM MM |
| Data mining | KDD |

Suggest another conference or report an incorrect date or venue through an [Issue](https://github.com/yinwen2019/conftrip/issues).

## Data and feature availability

- **Maintenance:** Conference information is stored in version-controlled JSON files. GitHub Actions periodically runs AI-assisted research and validation, creating an update PR when data changes. Updates are published after review and merge.
- **Dates:** Conference schedules can change. Confirm submission deadlines and their time zones, registration details, and travel arrangements on the official conference website. Unconfirmed information is shown as “待公布” (to be announced).
- **Travel information:** Guides cover selected cities. Original 3D landmarks are artistic representations, not accurate city layouts or conference venues.
- **Community statistics:** The production site uses an independent service for project likes, deliberate conference and city clicks, and city wishlist votes. Conference and travel information remains in static JSON, separate from interaction statistics.
- **Languages:** This README is available in Chinese and English. Most website interface text is currently in Chinese.

### Feature status

| Status | Features |
| --- | --- |
| Available | Conference, year, world, and city views; four homepage ranking boards and a dedicated Rankings page |
| Connected | Site-wide likes, conference interest, city interest, and city wishlist totals |
| Being refined | Voting for future conference destinations and expanding city travel information |
| Planned | Calendar export, deadline notifications, conference bookmarks, and a bilingual website interface |

Share feedback through an [Issue](https://github.com/yinwen2019/conftrip/issues). Features listed as planned are not yet available.

## Run locally and contribute

Just looking for conference information? [Open the website](https://aitravel.gonsun.com/)—no installation or API key required.

For local development, use Node.js 24 (matching this project's GitHub Actions) and npm:

```bash
git clone https://github.com/yinwen2019/conftrip.git
cd conftrip
npm ci
npm run dev
```

Open the address printed in your terminal, normally `http://localhost:5173`.

<details>
<summary><strong>Developer notes: stack, project structure, and commands</strong></summary>

**Website:** Vue 3 · TypeScript · Vite · Tailwind CSS · Vue Router (hash routing) · Three.js / Globe.GL · D3 Geo · GitHub Pages.

**Data and interactions:** JSON Schema / Ajv · Python · GitHub Actions; an independent Cloudflare Worker + D1 service handles site-wide interactions.

```text
data/                Conference data, city guides, and validation schemas
src/                 Pages, components, read-only data aggregation, and styles
scripts/             Data validation and AI-assisted update scripts
services/analytics/  Independent statistics API, database migrations, and isolated tests
public/              Website assets
.github/             Update and deployment workflows, plus README images
.docs/               Requirements, architecture, and implementation notes
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

**Local interaction preview:** Without a configured statistics API, likes and wishlist votes stay in the current browser, and the interest boards show that collection is disabled. Local totals are never automatically uploaded. Development mode blocks writes to the production statistics service so debugging does not affect real rankings.

For the complete interaction flow, see the [statistics service README](services/analytics/README.md) and [integration documentation](.docs/21-analytics-service-result.md). Use the isolated local test database:

```bash
npm run analytics:db:local
npm run analytics:dev
# Start the frontend in another terminal
VITE_ANALYTICS_API_URL=http://127.0.0.1:8788 npm run dev
```

The Cloudflare service and the static frontend are maintained separately. You do not need to deploy the statistics service to browse the site or preview the frontend locally.

</details>

Contributions are welcome: correct conference information, add city guides, or improve the interface. For data changes, include official source links, verify dates and time zones, and run:

```bash
npm run validate
npm run type-check
npm run build
```

See [AGENTS.md](AGENTS.md) for development conventions and the [data schema documentation](.docs/04-data-schema.md) for data formats.

---

If this helps you plan a submission or look forward to a new city, bookmark the [website](https://aitravel.gonsun.com/), leave a like, or give the project a ⭐. Follow project updates on [Xiaohongshu](https://xhslink.cn/o/5YIh8OKvkvn).

**Finish the paper, catch the flight, and explore the world.**

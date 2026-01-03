# redditViewer

A lightweight, mobile-first Reddit viewer that pulls posts from a curated list of subreddits stored in `subreddits.txt`. On mobile, posts appear one at a time with scroll snap, while desktops get a 3x3 gallery grid with infinite scrolling.

## Features

- Reads subreddits directly from `subreddits.txt` (one subreddit per line, `#` for comments).
- Mobile-friendly single-post scroll experience; 3-column gallery grid on larger screens.
- Infinite scrolling powered by the Reddit JSON API, with a shuffle button to refresh ordering.
- Subreddit manager button to add/remove subs for the current session (disappears after saving).
- Clean, glassmorphic styling with light/dark auto support.

## Running locally

This project is a static site; any static file server works. From this folder you can run:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser. Posts will stream from Reddit using the configured subreddits.

## Customizing

- Edit `subreddits.txt` to change the sources. Leave one name per line; lines starting with `#` are ignored.
- Tweak layout or colors in `styles.css`.
- Adjust loading behavior in `script.js` if you want different batch sizes or endpoints.
- Use the **Choose subreddits** button in the UI to add or deselect subs for the current session; once you save, that button hides until you reload the page.

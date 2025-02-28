# Backlink Finder
- Purpose: Identify all external links on a webpage and categorize them as follow or nofollow to assess backlink opportunities and compliance with SEO practices.

# Features:
- Extract all external links from a webpage.
- Includes all the tags <a>, <link>, <area>, <form>, <iframe>, <img>
- Categorize links as follow or nofollow based on the presence of the rel="nofollow" attribute.
- If the links does not contain relation as follow or nofollow make them follow by default.
- Highlight links visually on the page (e.g., color-code follow/nofollow links).
- Provide a summary with metrics like total links, follow links, and nofollow links.
- Export links as a CSV file for further analysis.


#  Implementation Steps:
1. Extract External Links:
- Use JavaScript to parse the DOM and extract all <a> tags with href attributes pointing to external domains.
- Check for links that don't match the current website's domain.


2. Categorize Links:
- Check each <a> tag for the presence of the rel="nofollow" attribute.
- Categorize links into "Follow" and "Nofollow."


3. Visual Highlighting:
- Inject CSS styles into the webpage to highlight links in different colors:
- Green: Follow links.
- Red: Nofollow links.


4. Summary Metrics:
- Display a popup or sidebar summarizing the number of total links, follow links, and nofollow links.


5. Export Feature:
- Enable users to download a CSV file containing the link URL, type (follow/nofollow), and anchor text.


6. UI/UX:
- Add a browser action button to activate the tool on the current tab.
- Use a sidebar or popup for user interactions and results display.
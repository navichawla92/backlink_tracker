function getAllLinksWithDuplicates() {
  const links = [];
  const allElements = document.querySelectorAll("*");

  allElements.forEach((element) => {
    if (element.hasAttribute("href")) {
      links.push(element.getAttribute("href"));
    }
    if (element.hasAttribute("src")) {
      links.push(element.getAttribute("src"));
    }
  });

  return links;
}

function extractNofollowLinks() {
  const links = [];
  const allElements = document.querySelectorAll("*");

  allElements.forEach((element) => {
    if (element.hasAttribute("href") && element?.rel === "nofollow") {
      links.push(element.getAttribute("href"));
    }
    if (element.hasAttribute("src") && element?.rel === "nofollow") {
      links.push(element.getAttribute("src"));
    }
  });

  return links;
}

function extractLinksWithoutNofollow() {
  const links = [];
  const allElements = document.querySelectorAll("*");

  allElements.forEach((element) => {
    if (
      element.hasAttribute("href") &&
      (!element?.hasAttribute("rel") || element?.rel === "follow")
    ) {
      links.push(element.getAttribute("href"));
    }
    if (
      element.hasAttribute("src") &&
      (!element?.hasAttribute("rel") || element?.rel === "follow")
    ) {
      links.push(element.getAttribute("src"));
    }
  });

  return links;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getLinks") {
    const noFollowLinks = extractNofollowLinks();
    const followLinks = extractLinksWithoutNofollow();
    sendResponse({ noFollowLinks, followLinks });

    chrome.runtime.sendMessage({ action: "greet" }, (response) => {
      console.log("Received response:", response);
    });
  }

  if (request.action === "toggleHighlightLinks") {
    currentHighlightingState = request.isHighlightingOn;
    if (currentHighlightingState) {
      highlightTagsBasedOnLinks(request.followLinks, request.noFollowLinks);
    } else {
      removeHighlighting();
    }
    sendResponse({ success: true });
  }

  return true;
});

function highlightTagsBasedOnLinks(followLinks, noFollowLinks) {
  const followColor = "rgb(2, 255, 2)";
  const noFollowColor = "rgb(244, 61, 61)";

  const escapeCSSSelector = (link) =>
    link.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");

  followLinks.forEach((link) => {
    try {
      const escapedLink = escapeCSSSelector(link);
      document.querySelectorAll(`[href='${escapedLink}'], [src='${escapedLink}']`)
        .forEach((element) => {
          element.style.transition = "background-color 0.1s ease";
          element.style.backgroundColor = followColor;
        });
    } catch (error) {
      console.error(`Error processing follow link: ${link}`, error);
    }
  });

  noFollowLinks.forEach((link) => {
    try {
      const escapedLink = escapeCSSSelector(link);
      document.querySelectorAll(`[href='${escapedLink}'], [src='${escapedLink}']`)
        .forEach((element) => {
          element.style.transition = "background-color 0.1s ease";
          element.style.backgroundColor = noFollowColor;
        });
    } catch (error) {
      console.error(`Error processing nofollow link: ${link}`, error);
    }
  });
}

let currentHighlightingState = false;

function removeHighlighting() {
  document.querySelectorAll("a, img").forEach((element) => {
    element.style.backgroundColor = "";
  });
}

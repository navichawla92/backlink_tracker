document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get the active tab in the current window
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.id) {
            // Send a message to the content script to extract the links
            chrome.tabs.sendMessage(tab.id, { action: "getLinks" }, (response) => {
                if (response) {
                    const followLinksArray = response.followLink || [];
                    const noFollowLinksArray = response.noFollowLinks || [];
                    const activeTabDomain = new URL(tab.url).hostname;

                    // Filter and process links for follow URLs
                    const processLinksFollow = (links, type) => {
                        return links
                            .filter((link) => {
                                try {
                                    if (link === "#" || link === "" || link?.startsWith("#")) {
                                        return false;
                                    }
                                    return true;
                                } catch (error) {
                                    console.log(error);
                                    console.error("Invalid URL:", link);
                                    return false;
                                }
                            })
                            .map((link) => ({ link, type }));
                    };

                    // Filter and process links for nofollow URLs
                    const processLinksNoFollow = (links, type) => {
                        return links
                            .filter((link) => {
                                try {
                                    if (link === "#" || link === "" || link?.startsWith("#")) {
                                        return false;
                                    }
                                    const linkUrl = new URL(link, window.location.origin);
                                    // console.log(activeTabDomain,linkUrl.hostname);
                                    return linkUrl.hostname !== activeTabDomain;
                                } catch (error) {
                                    console.log(error);
                                    console.error("Invalid URL:", link);
                                    return false;
                                }
                            })
                            .map((link) => ({ link, type }));
                    };

                    const followLinks = processLinksFollow(followLinksArray, "follow");
                    const noFollowLinks = processLinksNoFollow(noFollowLinksArray, "nofollow");

                    const allLinks = [...followLinks, ...noFollowLinks];

                    // Update UI
                    updateUI(followLinks, "listOfFollowLinks", "followLinkCount");
                    updateUI(noFollowLinks, "listOfNoFollowLinks", "noFollowLinkCount");

                    // Save links for the highlight functionality
                    window.followLinks = followLinks.map(({ link }) => link);
                    window.noFollowLinks = noFollowLinks.map(({ link }) => link);

                    // Add download button functionality
                    document.getElementById("downloadLinks").addEventListener("click", () => {
                        exportToCSV(allLinks, "extracted_links.csv");
                    });
                }
            });
        }
    } catch (error) {
        console.error("Error extracting links:", error);
    }
});

// Variable to track the highlight state
let isHighlightingOn = false;

// Add event listener for "Highlight Links" button to toggle on/off
document.getElementById("highlightLinks").addEventListener("click", async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.id) {
            // Toggle the highlight state
            isHighlightingOn = !isHighlightingOn;

            // Send the state of the toggle to the content script
            chrome.tabs.sendMessage(tab.id, {
                action: "toggleHighlightLinks",
                isHighlightingOn,
                followLinks: window.followLinks || [],
                noFollowLinks: window.noFollowLinks || [],
            });

            // Optionally change the button text to show the current state
            document.getElementById("highlightLinks").textContent = isHighlightingOn
                ? "Turn Off Link Highlight"
                : "Highlight Links";
        }
    } catch (error) {
        console.error("Error toggling link highlight:", error);
    }
});

// Function to update the UI
function updateUI(links, listId, countId) {
    const linkList = document.getElementById(listId);
    const linkCount = document.getElementById(countId);
    linkList.innerHTML = ""; // Clear previous results
    linkCount.textContent = links.length;

    // links.forEach(({ link }) => {
    //     const listItem = document.createElement("li");
    //     listItem.textContent = link;
    //     linkList.appendChild(listItem);
    // });
}

// Function to export data to a CSV file
function exportToCSV(data, filename) {
    console.log("count the data", data);
    const rows = [["Link", "Type of Link"], ...data.map(({ link, type }) => [link, type])];
    const csvContent = "data:text/csv" +
        rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    console.log("enocded url", encodedUri);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: "getLinks" }, (response) => {
                if (response) {
                    console.log(response,'response');
                    const followLinksArray = response.followLinks || [];
                    const noFollowLinksArray = response.noFollowLinks || [];
                    const activeTabDomain = new URL(tab.url).hostname;

                    // const processLinks = (links, type, isNoFollow = false) => {
                    //     return links
                    //         .filter((link) => {
                    //             try {
                    //                 if (!link || link.startsWith("#")) return false;
                    //                 if (isNoFollow) {
                    //                     return new URL(link, window.location.origin).hostname !== activeTabDomain;
                    //                 }
                    //                 return true;
                    //             } catch (error) {
                    //                 console.error("Invalid URL:", link, error);
                    //                 return false;
                    //             }
                    //         })
                    //         .map((link) => ({ link, type }));
                    // };
                    const processLinks =  (links, type,  isNoFollow = false) => {
                        return links
                            .filter((link) => {
                            if (!link || link.startsWith("#")) return false;
                            return true;
                            })
                            .map((link) => {
                            let finalType = type;
                            try {
                                const url = new URL(link, window.location.origin);
                                if (!url.protocol.startsWith("http")) {
                                finalType = "broken";
                                } else if (url.hostname === activeTabDomain) {
                                finalType = "internal";
                                } else {
                                finalType = "external";
                                }
                            } catch (err) {
                                finalType = "broken";
                            }
                            return { link, type: finalType };
                        });
                    };


                    const followLinks = processLinks(followLinksArray, "follow");
                    const noFollowLinks = processLinks(noFollowLinksArray, "nofollow", true);
                    const allLinks = [...followLinks, ...noFollowLinks];
                    const internalLinks = allLinks.filter((l) => l.type === "internal");
                    const externalLinks = allLinks.filter((l) => l.type === "external");
                    const brokenLinks = allLinks.filter((l) => l.type === "broken");

                    updateUI(followLinks, "listOfFollowLinks", "followLinkCount");
                    updateUI(noFollowLinks, "listOfNoFollowLinks", "noFollowLinkCount");
                    updateUI(internalLinks, "listOfInternalLinks", "internalLinkCount");
                    updateUI(externalLinks, "listOfExternalLinks", "externalLinkCount");
                    updateUI(brokenLinks, "listOfBrokenLinks", "brokenLinkCount");

                    window.followLinks = followLinks.map(({ link }) => link);
                    window.noFollowLinks = noFollowLinks.map(({ link }) => link);
                    window.internalLinks = internalLinks.map(({ link }) => link);
                    window.externalLinks = externalLinks.map(({ link }) => link);
                    window.brokenLinks = brokenLinks.map(({ link }) => link);

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

let isHighlightingOn = false;

document.getElementById("highlightLinks").addEventListener("click", async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            isHighlightingOn = !isHighlightingOn;
            chrome.tabs.sendMessage(tab.id, {
                action: "toggleHighlightLinks",
                isHighlightingOn,
                followLinks: window.followLinks || [],
                noFollowLinks: window.noFollowLinks || [],
            });
            document.getElementById("highlightLinks").textContent = isHighlightingOn ? "Turn Off Link Highlight" : "Highlight Links";
        }
    } catch (error) {
        console.error("Error toggling link highlight:", error);
    }
});

function updateUI(links, listId, countId) {
    const linkList = document.getElementById(listId);
    const linkCount = document.getElementById(countId);
    linkList.innerHTML = "";
    linkCount.textContent = links.length;
}

function exportToCSV1(data, filename) {
    console.log("Count the data", data);
    const rows = [["Link", "Type of Link"], ...data.map(({ link, type }) => [link, type])];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    console.log("Encoded URL", encodedUri);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function exportToCSV(data, filename) {
  const rows = [["Link", "Type of Link"]];
  data.forEach(({ link, type }) => {
    rows.push([link, type]);
  });

  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


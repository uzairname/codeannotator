// Function to log the names of all open tabs
const USERID = "32669483-770a-443c-bbdf-0871b7eb7e6e";
const API = "http://localhost";
function logOpenTabs(tab) {
    console.log("Background running...");
    // console.log(tab);

    // // If you want to query all tabs
    // chrome.tabs.query({}, function(tabs) {
    //   tabs.forEach(function(tab) {
    //     console.log("Tab name:", tab.title);
    //   });
    // });
  }
  
  // Listen for tab creation
  chrome.tabs.onCreated.addListener(logOpenTabs);
  
//   // Listen for tab removal
//   chrome.tabs.onRemoved.addListener(logOpenTabs);

// Listen for tab update (e.g., URL change)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the URL of the tab has changed
    if (changeInfo.url && changeInfo.url != "chrome://newtab/" && !changeInfo.url.includes("google.com")) {
      // Log the new URL of the tab
      console.log("Tab URL updated:", changeInfo.url);
      fetch(API + `/link?userID=${USERID}`, {
        method: "POST",
        body: JSON.stringify({
          link: changeInfo.url
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((response) => console.log(response.status));
    }

    // Post currently opened URL to the backend
  });
  
  // Initialize the logging upon extension startup
  logOpenTabs();

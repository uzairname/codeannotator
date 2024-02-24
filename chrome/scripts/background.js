// Function to log the names of all open tabs
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
    if (changeInfo.url && changeInfo.url != "chrome://newtab/") {
      // Log the new URL of the tab
      console.log("Tab URL updated:", changeInfo.url);
    }

    // Post currently opened URL to the backend
  });
  
  // Initialize the logging upon extension startup
  logOpenTabs();
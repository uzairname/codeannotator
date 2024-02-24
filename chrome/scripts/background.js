// Function to log the names of all open tabs
function logOpenTabs() {
    console.log("Background running...")
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        console.log("Tab name:", tab.title);
      });
    });
  }
  
  // Listen for tab creation
  chrome.tabs.onCreated.addListener(logOpenTabs);
  
  // Listen for tab removal
  chrome.tabs.onRemoved.addListener(logOpenTabs);
  
  // Listen for tab update (e.g., URL change)
  chrome.tabs.onUpdated.addListener(logOpenTabs);
  
  // Initialize the logging upon extension startup
  logOpenTabs();
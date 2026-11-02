document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusText = document.getElementById('statusText');
  
  // Load current state
  chrome.storage.local.get(['multipleCursorsActive'], function(result) {
    const isActive = result.multipleCursorsActive || false;
    updateUI(isActive);
  });
  
  function updateUI(isActive) {
    if (isActive) {
      toggleBtn.textContent = 'Disable Multiple Cursors';
      toggleBtn.style.background = '#dc3545';
      statusText.textContent = '✅ Multiple cursors are currently ENABLED. Use Alt+Click to add cursors or Ctrl+D to select next occurrences.';
    } else {
      toggleBtn.textContent = 'Enable Multiple Cursors';
      toggleBtn.style.background = '#007acc';
      statusText.textContent = '💡 Click the button below to enable multiple cursor selection.';
    }
  }
  
  toggleBtn.addEventListener('click', function() {
    // Send message to content script to toggle
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle'}, function(response) {
        if (response) {
          updateUI(response.active);
        }
      });
    });
  });
});

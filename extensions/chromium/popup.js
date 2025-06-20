document.addEventListener('DOMContentLoaded', function() {
  const optOutToggle = document.getElementById('optOutToggle');
  const optOutSwitch = document.getElementById('optOutSwitch');
  const status = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  
  // Load current opt-out status
  chrome.storage.sync.get(['databuddyOptOut'], function(result) {
    const isOptedOut = result.databuddyOptOut === true;
    updateSwitchState(isOptedOut);
    updateStatus(isOptedOut);
  });
  
  // Handle switch clicks
  optOutSwitch.addEventListener('click', function() {
    const currentState = optOutSwitch.getAttribute('data-state') === 'checked';
    const newState = !currentState;
    
    // Save to extension storage
    chrome.storage.sync.set({
      databuddyOptOut: newState
    }, function() {
      updateSwitchState(newState);
      updateStatus(newState);
    });
  });

  // Handle keyboard navigation
  optOutSwitch.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      optOutSwitch.click();
    }
  });

  function updateSwitchState(isOptedOut) {
    optOutToggle.checked = isOptedOut;
    optOutSwitch.setAttribute('data-state', isOptedOut ? 'checked' : 'unchecked');
    optOutSwitch.setAttribute('aria-checked', isOptedOut.toString());
  }
  
  function updateStatus(isOptedOut) {
    if (isOptedOut) {
      status.className = 'status opted-out';
      statusText.textContent = 'Databuddy tracking is blocked';
    } else {
      status.className = 'status tracking';
      statusText.textContent = 'Databuddy tracking is active';
    }
  }

}); 
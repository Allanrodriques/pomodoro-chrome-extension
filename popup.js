let timerInterval;
let isSession = true;
let sessionLength = 25 * 60; // 25 minutes in seconds
let breakLength = 5 * 60; // 5 minutes in seconds
let startTime;

// Define startTimer function
function startTimer() {
    timerInterval = setInterval(function () {
      if (isSession) {
        sessionLength--;
      } else {
        breakLength--;
      }
  
      if (sessionLength < 0) {
        isSession = !isSession;
        sessionLength = isSession ? 25 * 60 : 5 * 60;
      }
  
      updateTimer();
    }, 1000);
  }
// Retrieve timer state from storage
chrome.storage.local.get(['sessionLength', 'breakLength', 'isSession', 'startTime'], function(result) {
    if (result.sessionLength) {
      sessionLength = result.sessionLength;
    }
  
    if (result.breakLength) {
      breakLength = result.breakLength;
    }
  
    if (result.isSession !== undefined) {
      isSession = result.isSession;
    }
  
    if (result.startTime) {
      startTime = result.startTime;
    }
  
        // If the timer was running, calculate the remaining time
  if (startTime) {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    if (isSession) {
      sessionLength -= elapsedTime;
    } else {
      breakLength -= elapsedTime;
    }

    // Restart the timer
    startTimer();
  } else {
    // If the timer wasn't running, start it
    startTimer();
  }

  updateTimer();
});
  


function updateTimer() {
  const currentTime = isSession ? sessionLength : breakLength;
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  document.getElementById('timer').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function toggleTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(function () {
      if (isSession) {
        if (sessionLength > 0) {
          sessionLength--;
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          isSession = false;
          updateTimer();
          alert('Session complete! Take a break.');
          toggleTimer();
        }
      } else {
        if (breakLength > 0) {
          breakLength--;
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          isSession = true;
          updateTimer();
          alert('Break time is over. Start your next session.');
          toggleTimer();
        }
      }
      updateTimer();
    }, 1000);
  }
  chrome.storage.local.set({
    'sessionLength': sessionLength,
    'breakLength': breakLength,
    'isSession': isSession,
    'startTime': Date.now() 
  });
}
let timerStarted = false;

chrome.storage.local.get('timerStarted', function(result) {
        if (!result.timerStarted) {
            startTimer();
            timerStarted = true;
            chrome.storage.local.set({'timerStarted': true});
        }
    });


document.getElementById('startButton').addEventListener('click', toggleTimer);

document.getElementById('resetButton').addEventListener('click', function () {
  clearInterval(timerInterval);
  timerInterval = null;
  sessionLength = document.getElementById('sessionLength').value * 60;
  breakLength = document.getElementById('breakLength').value * 60;
  isSession = true;
  updateTimer();
});

document.getElementById('closeButton').addEventListener('click', function () {
    window.close(); // Close the extension popup
  });

updateTimer();

// Keep popup open when clicking outside
document.body.addEventListener('click', function (event) {
  chrome.extension.getBackgroundPage().document.body.click();
});


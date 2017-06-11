var enabled = true;
var statButton = document.getElementById('noStatButton');
chrome.storage.local.get('enabled', function(enabled){
	enabled = enabled['enabled'];
	statButton.setAttribute('data-noStat', enabled);
	if(enabled == true){
		statButton.setAttribute('data-noStat', 'true');
		statButton.innerHTML = 'noStat Enabled';
		statButton.className = 'noStatToggleEnabled';
	} else {
		chrome.storage.local.set({'enabled': enabled});
		statButton.setAttribute('data-noStat', 'false');
		statButton.innerHTML = 'noStat Disabled';
		statButton.className = 'noStatToggleDisabled';
	}
});

statButton.addEventListener('mouseenter', function(event){
	var statClass = statButton.classList[0];
	if(statClass == 'noStatToggleEnabled'){
		statButton.innerHTML = 'Disable noStat';
	} else {
		statButton.innerHTML = 'Enable noStat'
	}
});

statButton.addEventListener('mouseleave', function(event){
	var statClass = statButton.classList[0];
	if(statClass == 'noStatToggleEnabled'){
		statButton.innerHTML = 'noStat Enabled';
	} else {
		statButton.innerHTML = 'noStat Disabled';
	}
});

document.addEventListener('click', function(event){
	if (event.target.id == 'noStatButton') {
		
		var noStat = statButton.getAttribute('data-noStat');
		if(noStat == "true"){
			enabled = false;
			statButton.setAttribute('data-noStat', 'false');
			statButton.innerHTML = 'noStat Disabled';
			statButton.className = 'noStatToggleDisabled';
		} else {
			enabled = true;
			statButton.setAttribute('data-noStat', 'true');
			statButton.innerHTML = 'noStat Enabled';
			statButton.className = 'noStatToggleEnabled';
		}
		chrome.storage.local.set({'enabled': enabled});
		reloadCurrentTab();
	}
});

var reloadCurrentTab = function() {
    var twitterMatch = new RegExp("http[s]{0,1}:\/\/twitter");

    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    	var tabURL = tabs[0].url;
    	var twitterCheck = twitterMatch.test(tabURL);
    	if(twitterCheck == true){
    		console.log(tabURL);
    		chrome.tabs.reload();
    	}
    });
    
}
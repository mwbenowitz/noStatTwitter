/*
 * noStats
 * by Mike Benowitz
 * http://github.com/mwbenowitz
 * Block stats from displaying on Twitter
 * But provide users the ability to toggle visibility for indvidual users/tweets
*/

// Initialize several vars
var count = 0
var statElements = []
var newStatElements = []
var allStatElements = []
var enabled = true
var doOnce = false
// Check to see if the extension is enabled
// If it is run the extension on the page
chrome.storage.local.get('enabled', function(enabled){
	enabled = enabled['enabled'];
	if(enabled == true){
		// Create a list of tweets that are initially loaded. This prevents us from running the obscure function more than once
		statElements = Array.from(document.querySelectorAll('.ProfileTweet-actionList'));

		// Create a main observer that will run on the whole document
		// NOTE: This must carefully check where it triggers DOM editing to avoid killing performance on the page
		var centralObservation = new MutationObserver(function(mutations){
			mutations.forEach(function(mutation){
				var targetNode = mutation.target;
				var newNodes = mutation.addedNodes;
				// This is an important checker for when Twitter only loads its main app, instead of a new page load
				// Otherwise the observers will not fire on initial load
				newNodes.forEach(function(newNode){
					if(newNode.nodeType == 1){
						if(newNode.matches('.AppContainer')){
							allStatElements = Array.from(document.querySelectorAll('.ProfileTweet-actionList'));
							curStatElements = allStatElements.filter(function(e){
								return this.indexOf(e) < 0;
							}, statElements)
							obscureStats(curStatElements);
							statElements = allStatElements;
							var popStats = targetNode.querySelectorAll('.ProfileCardStats')[0]
							if(popStats){
								obscureProfile(popStats);
							}
						}
					}
				});
				// This is the main observer stuff that checks for changes dynamically as users navigate Twitter
				if(targetNode.nodeType == 1){
					if(targetNode.matches('#timeline') || targetNode.matches('.PermalinkOverlay-body') || targetNode.matches('.GalleryTweet') || targetNode.matches('.stream-items')){
						console.log('This is matching a timeline');
						allStatElements = Array.from(document.querySelectorAll('.ProfileTweet-actionList'));
						curStatElements = allStatElements.filter(function(e){
							return this.indexOf(e) < 0;
						}, statElements)
						obscureStats(curStatElements);
						statElements = allStatElements;
					}else if(targetNode.matches('#profile-hover-container')){
						console.log('This is matching a profile container');
						var popStats = targetNode.querySelectorAll('.ProfileCardStats')[0]
						if(popStats){
							obscureProfile(popStats);
						}
					}
				}
			});
		});
		// Fire up central observation
		centralObservation.observe(document.documentElement, {childList: true, subtree: true});
		
		// This sets an initial scan of the DOM when users first hit Twitter.
		// It also manages click events to show/hide the stats themselves
		docReady(function(){
			//Fire the obsure function first, then create observer
			statElements = Array.from(document.querySelectorAll('.ProfileTweet-actionList'));
			obscureStats(statElements);
			//Obscure profile stats too
			profileStats = document.querySelectorAll('.ProfileCardStats')[0]
			if (profileStats){
				obscureProfile(profileStats);
			}
			// Allow users to toggle stats per tweet
			document.addEventListener('click', function(event){
				if (event.target.classList[1] == 'showStatsButton') {
					var triggerContainer = event.target.parentNode.parentNode;
					showStats(triggerContainer);
				} else if(event.target.classList[1] == 'hideStatsButton'){
					var triggerContainer = event.target.parentNode.parentNode;
					hideStats(triggerContainer);
				} else if(event.target.classList[0] == 'showProfileButton'){
					var triggerContainer = event.target.parentNode.parentNode;
					showProfile(triggerContainer, event.target.parentNode);
				}
			});
		});
		
	} else {
		if(doOnce == false){
			document.body.innerHTML += '<style>.ProfileCardStats-statList, .tweet-stats-container, .ProfileTweet-actionList{display: block !important } </style>';
			doOnce == true
		}
	}
});

// Everything below here are functions called in the main block
var obscureStats = function(statElements){
	for(var i = 0; i < statElements.length; i++){
		statElements[i].setAttribute('style', 'display:inline-block !important');
		insertQs(statElements[i])
		statElements[i].innerHTML += "<div class='ProfileTweet-action showStatsContainer'><button class='ProfileTweet-actionButton showStatsButton btn-simple'>Show</button></div>";
		statElements[i].innerHTML += "<div class='ProfileTweet-action hideStatsContainer'><button class='ProfileTweet-actionButton hideStatsButton btn-simple'>Hide</button></div>";
		hideButton = statElements[i].querySelectorAll('.hideStatsContainer')[0];
		hideButton.setAttribute('style', 'display:none')
	}
}

var showStats = function(container){
	tweetStats = container.querySelectorAll('.ProfileTweet-actionCount');
	tweetStats.forEach(function(statEl){
		var stat = statEl.getAttribute('data-stat-count');
		statEl.innerHTML = stat;
	});
	var showButton = container.querySelectorAll('.showStatsContainer')[0];
	var hideButton = container.querySelectorAll('.hideStatsContainer')[0];
	showButton.style.display = 'none';
	hideButton.style.display = 'inline-block';
}

var hideStats = function(container){
	insertQs(container);
	var showButton = container.querySelectorAll('.showStatsContainer')[0];
	var hideButton = container.querySelectorAll('.hideStatsContainer')[0];
	showButton.style.display = 'inline-block';
	hideButton.style.display = 'none';
}

var insertQs = function(container){
	tweetStats = container.querySelectorAll('.ProfileTweet-actionCount');
	tweetStats.forEach(function(statEl){
		count = statEl.textContent.trim();
		if (count != '??'){
			statEl.innerHTML = '??';
			statEl.setAttribute('data-stat-count', count);	
		}
	});
}

var obscureProfile = function(profileStats){
		profileStats.innerHTML += '<div class="profileHider"><button class="showProfileButton">Show Profile Stats</button></div>';
}

var showProfile = function(profileContainer, profileButton){
	var profileStats = profileContainer.querySelectorAll('.ProfileCardStats-statList')[0];
	profileStats.setAttribute('style', 'display:inline-block !important');
	profileButton.style.display = 'none'
}

var docReady = function(fn){
	document.readyState === 'complete' || document.readyStat === 'interactive' ? fn() : document.addEventListener('DOMContentLoaded', fn);
}

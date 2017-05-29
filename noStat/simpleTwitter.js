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

// Check to see if the extension is enabled
// If it is run the extension on the page
chrome.storage.local.get('enabled', function(enabled){
	enabled = enabled['enabled'];
	if(enabled == true){
		docReady(function(){
			//Fire the obsure function first, then create observer
			statElements = Array.from(document.querySelectorAll('.ProfileTweet-actionList'));
			obscureStats(statElements);
			document.querySelectorAll('.ProfileTweet-actionList').forEach(function(actionList){
				actionList.setAttribute('style', 'display:inline-block !important');
			});
			//Obscure profile stats too
			profileStats = document.querySelectorAll('.ProfileCardStats')[0]
			if (profileStats){
				obscureProfile(profileStats);
			}
			// Block stuff in the main timeline on change
			// Also block stuff in the popover and gallery
			var timeline = document.getElementById('stream-items-id');
			var permalink = document.querySelectorAll('.PermalinkOverlay-body')[0];
			var gallery = document.querySelectorAll('.GalleryTweet')[0];
			var tweetObserver = new MutationObserver(function(mutations){
				mutations.forEach(function(mutation){
					allStatElements = Array.from(document.querySelectorAll('.ProfileTweet-actionList'));
					curStatElements = allStatElements.filter(function(e){
						return this.indexOf(e) < 0;
					}, statElements)
					obscureStats(curStatElements);
					statElements = allStatElements;
				});
			});


			// Setup an observer for the profile pop-overs
			var profilePop = document.getElementById('profile-hover-container');
			var profileObserver = new MutationObserver(function(mutations){
				mutations.forEach(function(mutation){
					var popStats = profilePop.querySelectorAll('.ProfileCardStats')[0]
					obscureProfile(popStats);
				});
			});

			// Config for the observers. Simple now but could get more complex in the future
			var config = {
				childList: true,
				subtree: true
			};

			var popConfig = {
				childList: true
			};

			// Start up the observers
			tweetObserver.observe(timeline, config);
			tweetObserver.observe(permalink, config);
			tweetObserver.observe(gallery, config);
			profileObserver.observe(profilePop, popConfig);

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
		document.body.innerHTML += '<style>.ProfileCardStats-statList, .tweet-stats-container, .ProfileTweet-actionList{display: block !important } </style>';
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
	if(typeof fn != 'function' ) return;

	if(document.readyState === 'complete'){
		return fn();
	}
	document.addEventListener('interactive', fn, false);
}

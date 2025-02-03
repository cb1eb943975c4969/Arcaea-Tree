let modInfo = {
	name: "Arcaea Tree",
	author: "cb1eb943975c4969",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js","functions.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.1",
	name: "Here Come Hikari and Tairitsu",
}

let changelog = `Credit to ducdat0507 and 0i00000000a7, who helped me to make the news ticker.<br><br>
  <h2>Changelog:</h2><br>
  <h3>v0.1.1 - Here come Hikari and Tairitsu</h3><br>
  - Added the news ticker and a bunch of news messages.<br>
  - Added Partners.<br>
  - Added Hollow Core.<br>
  - Added 11 upgrades, a milestones, 2 buyables, and an achievement.<br>
  - Endgame: Get the upgrade \"Lumia PRS 5\" (1.60e15 Fragments, about 6.00e22 points)<br>
	<h3>v0.1 - The Origin</h3><br>
	- Added Fragments, Memories and Song Packs.<br>
	- Added 25 upgrades, 4 milestones, a buyable, and 3 achievements.<br>
	- Endgame: Get the upgrade \"cry of viyella PST 3\" (3.00e12 Fragments, about 4.50e14 points).`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	let gain = new Decimal(1)
	if(hasUpgrade("f",11)) gain = gain.mul(2)
	if(hasUpgrade("f",12)) gain = gain.mul(2)
	if(hasUpgrade("f",13)) gain = gain.mul(upgradeEffect("f",13))
	if(hasUpgrade("sp",12)) gain = gain.mul(upgradeEffect("sp",12))
	if(hasUpgrade("sp",15)) gain = gain.pow(1.25)
	if(hasUpgrade("sp",22)) gain = gain.mul(4)
	if(hasUpgrade("sp",25)) gain = gain.mul(5)
	if(hasUpgrade("sp",32)) gain = gain.pow(1.1)
	if(hasUpgrade("sp",45)) gain = gain.mul(upgradeEffect("sp",45))
	if(hasUpgrade("sp",122)) gain = gain.mul(upgradeEffect("sp",122))
	if(hasUpgrade("m",11)) gain = gain.mul(tmp.m.effect)
	if(hasUpgrade("m",21)) gain = gain.pow(upgradeEffect("m",21))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return hasUpgrade("sp",124)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
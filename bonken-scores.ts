let gameName: string;
let curGame: HTMLElement;
let curMiniGame: HTMLElement;
let players: string[] = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
let iplayer: number = -1;
let currentPlayerSpan: HTMLElement;
let biddingPlayerSpan: HTMLElement;
//let miniGame: string = "";
let nGames = 0;
let inMiniGame = false;
let gamesPlayed: string[][] = [[], [], [], []];


let bids: number[][] = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
const gameNames = ["hearts", "kings-or-jacks", "king-of-hearts", "queens", "dominoes",
				   "duck", "seven-thirteen", "last-trick",
				   "trump-spades", "trump-hearts", "trump-diamonds",
				   "trump-clubs", "no-trump"];
const sums = new Map([['hearts', 13],
					  ['kings-or-jacks', 8],
					  ['king-of-hearts', 1],
					  ['queens', 4],
					  ['dominoes', 1],
					  ['duck', 13],
					  ['seven-thirteen', 2],
					  ['last-trick', 1],
					  ['trump-spades', 13],
					  ['trump-hearts', 13],
					  ['trump-diamonds', 13],
					  ['trump-clubs', 13],
					  ['no-trump', 13]]);
const mults = new Map([['hearts', -10],
					  ['kings-or-jacks', -25],
					  ['king-of-hearts', -100],
					  ['queens', -45],
					  ['dominoes', -100],
					  ['duck', -10],
					  ['seven-thirteen', -50],
					  ['last-trick', -100],
					  ['trump-spades', 20],
					  ['trump-hearts', 20],
					  ['trump-diamonds', 20],
					  ['trump-clubs', 20],
					  ['no-trump', 20]]);

var totalPoints = new Map();


function updatePlayerName(input) {
	let i = input.dataset.player - 1;
	players[i] = input.value;
	if (players[i] == '') {
		players[i] = 'Player ' + (i+1);
	}
	setPlayerOrder(players);
	updateScoringTableNames(players);
	updateBiddingTableNames(players);
	updateScoreTableNames(players);
}


function updateScoreTableNames(players) {
	for (let i = 0; i < players.length; i++) {
		let ths = curGame.querySelectorAll('tr.player'+(i+1)+' th');
		for (let j = 0; j < ths.length; j++) {
			let th = <HTMLElement>ths[j];
			th.innerText = players[i];
		}
	}
}


function updateScore(name, scores) {
	let selector = 'section[data-id="results"] tbody tr';
	let trs = curMiniGame.querySelectorAll(selector);
	for (let i = 0; i < scores.length; i++) {
		let td = <HTMLElement>trs[i].querySelector('td:last-child');
		td.innerText = scores[i];
	}
}


function calcBids() {
	let bids = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

	let inputs = curMiniGame.querySelector('table[data-id="bidding"] tbody').
		getElementsByTagName('input');
	for (let i = 0; i < inputs.length; i++) {
		let input = inputs[i];
		if (input.checked) {
			let ids = input.dataset.bid.split('-');
			bids[ids[0]][ids[1]] = 1;
		}
	}
	return bids;
}

function calcGeneric(values, name) {
	let bids = calcBids();
	let mult = mults.get(name);
	let scores = [0, 0, 0, 0];

	for (let i = 0; i < 4; i++) {
		let points = 0;
		let score = values[i];
		for (let j = 0; j < 4; j++) {
			if (j == i) {
				continue;
			}
			let score1 = values[i];
			let score2 = values[j];
			let bidsum = bids[i][j] + bids[j][i];
			let diff = (score1 - score2) * bidsum;
			score += diff;
		}
		points = mult * score;
		scores[i] = points;
	}
	return scores;
}


function calcScore(name, showAlert=true) {
	let selector = 'section[data-id="results"] table input';
	let inputs = Array.from(curMiniGame.querySelectorAll(selector));
	let sum = 0;
	let values = [0, 0, 0, 0];

	for (let i = 0; i < inputs.length; i++) {
		let input = <HTMLInputElement>inputs[i];
		if (input.type == 'checkbox') {
			if (input.checked) {
				sum += 1;
				let index = parseInt(input.dataset.playerid) - 1;
				values[index] += 1;
			}
		} else {
			if (input.value != "") {
    			let n = parseInt(input.value);
    			if (isNaN(i)) {
					if (showAlert) {
    					alert("input is not a number");
					}
    			} else {
    				sum += n;
					values[i] = n;
    			}
			}
		}
	}

	(<HTMLInputElement>curMiniGame.querySelector('input[data-id="next"]')).disabled = true;
	updateScore(name, ['', '', '', '']);

	if (sum == sums.get(name)) {
		let scores = calcGeneric(values, name);
		updateScore(name, scores);
		totalPoints.set(name, scores);
		(<HTMLInputElement>curMiniGame.querySelector('input[data-id="next"]')).disabled = false;
	} else if (sum > sums.get(name)) {
		if (showAlert) {
			alert('too many tricks');
		}
	}
}



function doneBidding(tbody, name) {
	// Move to later
	let inputs = tbody.getElementsByTagName("input");
	for (let i = 0; i < inputs.lenth; i++) {
		let input = inputs[i];
		if (input.checked) {
			let ids = input.dataset.bid.split('-');
			bids[ids[0]][ids[1]] = 1;
		}
	}

	let resultSection = curMiniGame.querySelector('section[data-id="results"]');
	resultSection.setAttribute("class", "");

	let section = <HTMLElement>curMiniGame.querySelector('section[data-game="'+name+'"]');
	section.scrollIntoView(true);

}

function updateBiddingTableNames(players) {
	let tables = curGame.querySelectorAll('table[data-id="bidding"]');
	for (let j = 0; j < tables.length; j++) {
		let table = tables[j];

		let ths = table.querySelectorAll('thead tr:nth-child(2) th');
		for (let i = 1; i < ths.length; i++) {
			let th = <HTMLElement>ths[i];
			th.innerText = players[(iplayer+i)%4];
		}
		ths = table.querySelectorAll('tbody tr th');
		for (let i = 0; i < ths.length; i++) {
			let th = <HTMLElement>ths[i];
			th.innerText = players[(iplayer+i+1)%4];
		}
	}
}


function addBiddingRow(name, tbody, j) {
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	var content = document.createTextNode(players[(iplayer+1+j)%4]);
	th.appendChild(content);
	tr.appendChild(th);

	for (let i = 0; i < 4; i++) {
		var td = document.createElement("td");
		let input: any = document.createElement("input");
		input.setAttribute('data-bid', (j+iplayer+1)%4+"-"+(i+iplayer+1)%4);
		input.setAttribute('type', 'checkbox');
		if (i == j) {
			input = document.createTextNode("X");
		}
		td.appendChild(input);
		tr.appendChild(td);
	}
	let input = document.createElement("input");
	input.setAttribute('type', 'button');
	input.setAttribute('value', 'next');
	if (j < 3) {
		input.onclick = function (event) {
			(<HTMLElement>event.target).onclick = function () {};
			let inputs = <any[]>Array.from(tbody.getElementsByTagName("input"));
			for (let input of inputs) {
				if (input.type == 'checkbox') {
					if (input.checked) {
						let ids = input.dataset.bid.split('-');
						bids[ids[0]][ids[1]] = 1;
					} else {
						let ids = input.dataset.bid.split('-');
						bids[ids[0]][ids[1]] = 0;
					}
				}
			}
			addBiddingRow(name, tbody, j+1);
			return false;
		};
	} else {
		input.setAttribute('value', 'play');
		input.onclick = function () {
			doneBidding(tbody, name);
			return false;
		};
	}
	td = document.createElement("td");
	td.appendChild(input);
	tr.appendChild(td);
	tbody.append(tr);

	// current player can only bid against those who bid against them
	// Turn off all disallowed options
	if (j == 3) {
		for (let i = 0; i < 3; i++) {
			let ii = (i+1+iplayer)%4;
			let jj = (3+1+iplayer)%4
			if (bids[ii][jj] == 0) {
				let elem = tbody.querySelector('input[data-bid="'+jj+'-'+ii+'"]');
				let parent = elem.parentElement;
				parent.innerHTML = "X";
			}
		}
	}
	let focusedInput = <HTMLInputElement>tr.querySelector('input');
	focusedInput.focus();

}


function startMiniGame(name) {
	inMiniGame = true;

	setupMiniGame(name);

	let cancel = <HTMLInputElement>curMiniGame.querySelector('input[name="cancel"]');
	cancel.onclick = function() { cancelGame(name); };
	let input = <HTMLInputElement>curMiniGame.querySelector('input[data-id="next"]');
	input.disabled = true;
	input.onclick = function() {
		inMiniGame = false;
		nGames += 1;
		updateScoreCard(name);
		gamesPlayed[iplayer].push(name);
		if (nGames < 12) {
			nextMiniGame(name);
		} else {
			nextMiniGame(name);
			finishGame(gameName);
		}
	}

	startBidding(name);
}


function setupMiniGame(name) {
	let miniGame = curGame.querySelector('section[data-id="mini-game"][data-game="template"]');
	curMiniGame = <HTMLElement>miniGame.cloneNode(true);
	curMiniGame.setAttribute('data-game', name);
	curMiniGame.setAttribute('class', 'mini-game');
	let results = curMiniGame.querySelector('section[data-id="results"]');

	let bidding = curGame.querySelector('section[data-id="bidding"][data-game="template"]');
	let newBidding = <HTMLElement>bidding.cloneNode(true);
	newBidding.setAttribute('data-game', name);
	newBidding.setAttribute('class', 'bidding');
	curMiniGame.insertBefore(newBidding, results);
	let gameResults = curGame.querySelector('section[data-game="' + name + '"]');
	gameResults = gameResults.parentNode.removeChild(gameResults);
	gameResults.setAttribute('class', name);
	let doneButton = curMiniGame.querySelector('input[data-id="next"]');
	doneButton.parentNode.insertBefore(gameResults, doneButton);

	curMiniGame.getElementsByTagName('h1')[0].innerText = name.replace(/\-/g, ' ');

	miniGame.parentNode.appendChild(curMiniGame);
	//curGame.querySelector('section[data-game="'+name+'"]').setAttribute('class', '');

	let inputs = Array.from(gameResults.querySelectorAll('table input'));
	for (let input of inputs) {
		let inputType = input.getAttribute('type');
		input.addEventListener('change', function(event) { calcScore(name) });
		if (input.getAttribute('type') == 'text') {
			// update score while typing; just don't show an alert
			input.addEventListener('input', function(event) { calcScore(name, false) });
		}
	}

	let header = <HTMLElement>curMiniGame.querySelector('section[data-id="mini-game"] h1');
	header.scrollIntoView(true);
}


function startBidding(name) {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			bids[i][j] = 0;
		}
	}

	let table = <HTMLElement>curMiniGame.querySelector(
		`section[data-game="${name}"] table[data-id="bidding"]`);
	let head = <HTMLElement>table.getElementsByTagName('thead')[0];
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	var content = document.createTextNode("player");
	th.appendChild(content);
	tr.appendChild(th);
	for (let i = 1; i <= 4; i++) {
		th = document.createElement("th");
		content = document.createTextNode(players[(iplayer+i)%4]);
		th.appendChild(content);
		tr.appendChild(th);
	}
	head.appendChild(tr);

	let tbody = table.getElementsByTagName('tbody')[0];

	addBiddingRow(name, tbody, 0);

}

function resetBiddingTable(name) {

	startBidding(name);
}


function finishGame(name) {
	// Disable the last link
	let selector = 'table[data-id="score-card"] tr th a';
	let links = curGame.querySelectorAll(selector);
	for (let i = 0; i < links.length; i++) {
		let link = <HTMLElement>links[i];
		let text = link.innerText;
		link.parentElement.innerText = text;
	}

	let section = <HTMLElement>document.getElementById("saved-games");
	let list = section.querySelector('ul');
	let item = <HTMLElement>list.querySelector('li[data-name="' + name + '"]');
	item.childNodes[1].textContent = " (finished)";
}


function updateScoreCard(name) {
	let totals: number[] = [0, 0, 0, 0];
	for (let entry of totalPoints.entries()) {
		let [key, value] = entry;
		let selector = 'table[data-id="score-card"] tr[data-game="' + key + '"]';
		let tr = curGame.querySelector(selector);
		for (let i = 0; i < 4; i++) {
			let td = <HTMLElement>tr.querySelector('td.player' + (i+1));
			td.innerText = value[i];
			totals[i] += value[i];
		}
	}
	let imax = 0;
	let tr = curGame.querySelector('table[data-id="score-card"] tr[data-row="total"]');
	for (let i = 0; i < 4; i++) {
		let td = <HTMLElement>tr.querySelector('td.player' + (i+1));
		td.innerText = String(totals[i]);
		if (totals[i] > totals[imax]) {
			imax = i;
		}
	}
	if (nGames == 12) {
		(<HTMLElement>tr.querySelector('th')).innerText = "Total / winner"
	}
	let td = <HTMLElement>tr.querySelector('td.player-ahead');
	td.innerText = players[imax];
	td.dataset.playerid = String(imax);

	let selector = 'table[data-id="score-card"] tr[data-game="' + name + '"]';
	let row = curGame.querySelector(selector);
	td = <HTMLElement>row.querySelector('td.played-by');
	td.dataset.playerid = String(iplayer);
	td.innerText = players[iplayer];
	//(<HTMLElement>row.querySelector('td.completed')).innerHTML = "&#x2713";

	let link = <HTMLElement>row.querySelector('a');
	let text = link.innerText;
	link.parentElement.innerText = text;
	//link.parentElement.innerHTML = "";

}


function disableCurMiniGame() {
	curMiniGame.querySelector('input[name="cancel"]').remove();
	curMiniGame.style.opacity = '0.5';
	let inputs = curMiniGame.querySelectorAll('input');
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].disabled = true;
	}
}


function nextMiniGame(oldName: string, cancelled?: boolean) {
	//curMiniGame.querySelector('[data-id="mini-game"]').setAttribute('class', 'hidden');
	//curMiniGame.querySelector('section[data-id="results"]').setAttribute('class', 'hidden');
	//curMiniGame.querySelector('section[data-game="'+oldName+'"]').setAttribute('class', 'hidden');
/*
	let table = <HTMLTableElement>curGame.querySelector('table[data-id="bidding"]');
	while (table.rows.length > 0) {
		table.deleteRow(0);
	}
*/

	if (cancelled) {
		curMiniGame.remove();
	} else {
		disableCurMiniGame();

		iplayer += 1;
		iplayer %= 4;
	}

	setPlayerOrder(players);

	let header = curGame.querySelector('h1[data-id="score-card"]');
	header.scrollIntoView(true);
}


function setPlayerOrder(players) {
	let spans = curGame.querySelectorAll('span');
	for (let i = 0; i < spans.length; i++) {
		let span = spans[i];
		let cls = span.getAttribute("class");
		if (cls == "current-player") {
			span.innerText = players[iplayer];
		}
		if (cls == "bidding-player") {
			span.innerText = players[(iplayer+1)%4];
		}
		if (cls == "shuffle-player") {
			if (nGames == 0) {
				span.innerText = "Someone";
			} else {
				span.innerText = players[(iplayer+2)%4];
			}
		}
		if (cls == "leading-player") {
			span.innerText = players[(iplayer+3)%4];
		}
	}
}


function cancelGame(name) {
	/*
	let result = confirm("Cancel the current game?", ['yes', 'no']);
	if (result == 0) {

	}
	*/
	let result = window.confirm("Stop the current game?");
	if (result) {
		inMiniGame = false;
		nextMiniGame(name, true);
	}
}


function testTrumpPlayed(name) {
	let names = ['trump-spades', 'trump-hearts', 'trump-diamonds', 'trump-clubs', 'no-trump'];
	let played = gamesPlayed[iplayer];
	if (!names.includes(name)) {
		if (played.length >= 2) {
			for (let trumpname of names) {
				if (played.includes(trumpname)) {
					return false;
				}
			}
			alert(players[iplayer] + " has to play a plus game")
			return true;
		}
	} else {
		for (let trumpname of names) {
			if (played.includes(trumpname)) {
				alert(players[iplayer] + ' has already played a plus game');
				return true;
			}
		}
	}
	return false;
}

function setMiniGameLinks() {
	let table = curGame.querySelector('table[data-id="score-card"]');
	for (let name of gameNames) {
		let selector = "tr." + name + " a";
		let link = <HTMLElement>table.querySelector(selector);
		link.onclick = function() {
			if (inMiniGame) {
				return false;
			}
			if (testTrumpPlayed(name)) {
				return false;
			}
			startMiniGame(name);
			return false;
		}
	}

}

function setPlayerNames() {
	for (let name of gameNames) {
		let section = curGame.querySelector('section[data-game="'+name+'"]');
		let rows = Array.prototype.slice.call(section.getElementsByTagName('tr'));
		for (let i = 1; i <= 4; i++) {
			for (let row of rows) {
				if (row.getAttribute('class') == 'player' + i) {
					row.getElementsByTagName('th')[0].innerHTML = players[i-1];
				}
			}
		}
	}
}


function checkStartingPlayer() {
	let checkboxs = curGame.getElementsByClassName("starting-player");
	let checked: number[] = [];
	for (let i = 0; i < checkboxs.length; i++) {
		if ((<HTMLInputElement>checkboxs[i]).checked) {
			checked.push(i);
		}
	}

	if (checked.length == 1) {
		(<HTMLInputElement>curGame.querySelector('[data-id="play"]')).disabled = false;
	} else {
		(<HTMLInputElement>curGame.querySelector('[data-id="play"]')).disabled = true;
	}

	if (checked.length == 0) {
		alert("No starting player selected");
		let input = <HTMLElement>curGame.getElementsByClassName("player-name")[0];
		input.focus();
		return ;
	}
	if (checked.length > 1) {
		alert("To many starting players selected");
		let input = <HTMLElement>curGame.getElementsByClassName("player-name")[0];
		input.focus();
		return ;
	}
}


function updateSavedGames(name: string, curGame) {
	let section = <HTMLElement>document.getElementById("saved-games");
	let list = section.querySelector('ul');
	let games = list.querySelectorAll('li');
	let igame = -1;
	for (let i = 0; i < games.length; i++) {
		let game = games[i];
		let text = game.querySelector('a').innerText;
		if (text == name) {
			igame = i;
			break;
		}
	}
	if (igame == -1) {
		let item = document.createElement('li');
		let link = document.createElement('a');
		link.setAttribute('href', '#');
		link.setAttribute('onclick', 'continueGame("' + name + '"); return false;');
		link.innerText = name;
		item.appendChild(link);
		item.appendChild(document.createTextNode(" (active)"));
		item.dataset.iplayer = String(iplayer);
		item.dataset.name = name;
		list.appendChild(item);
	} else {
		let item = games[igame];
		item.dataset.iplayer = String(iplayer);
	}
}


function createPlayerTable(curGame, newNode) {
	let checkboxes = curGame.getElementsByClassName("starting-player");
	for (let i = 0; i < checkboxes.length; i++) {
		let checkbox = <HTMLInputElement>checkboxes[i];
		checkbox.onclick = checkStartingPlayer;
	}

	let header = <HTMLElement>newNode.getElementsByClassName("player-names")[0];
	header.scrollIntoView(true);

	let input = <HTMLElement>newNode.getElementsByClassName("player-name")[0];
	input.focus();
}


function continueGame(name): void {
	// hide the current game if it exists
	if (typeof curGame != 'undefined') {
		curGame.setAttribute('class', 'hidden');
	}

	// reset to active if not finished
	let section = <HTMLElement>document.getElementById("saved-games");
	let list = section.querySelector('ul');
	let item = <HTMLElement>list.querySelector('li[data-name="' + gameName + '"]');
	if (item.childNodes[1].textContent != " (finished)") {
		item.childNodes[1].textContent = " (active)";
	}

	// set new game to current unless finished
	item = <HTMLElement>list.querySelector('li[data-name="' + name + '"]');
	if (item.childNodes[1].textContent != " (finished)") {
		item.childNodes[1].textContent = " (current)";
	}

	// grab the relevant game data
	iplayer = parseInt(item.dataset.iplayer);

	// show the game
	curGame = document.getElementById(name);
	curGame.setAttribute('class', '');

	gameName = name;

	section = <HTMLElement>document.getElementById("saved-games");
	list = section.querySelector('ul');
	item = <HTMLElement>list.querySelector('li[data-name="' + name + '"]');
}


function startNewGame(): void {
	if (typeof curGame != 'undefined') {
		curGame.setAttribute('class', 'hidden');
	}

    let elem = <HTMLInputElement>document.getElementById("game-name");
    gameName = elem.value;
 	if (gameName == "") {
	    gameName = getDateTime();
	}
	gameName = "Game " + gameName;

	let node = document.getElementById("start-new-game");
	curGame = <HTMLElement>(node.cloneNode(true));
	let newNode = curGame;
	newNode.id = gameName;
	newNode.setAttribute("class", "");
	let header = newNode.querySelector('h1');
	header.innerText = gameName;

	document.body.appendChild(newNode);

	updateSavedGames(gameName, curGame);

	createPlayerTable(curGame, newNode);
}


function updateScoringTableHeader(players) {
	for (let i = 0; i < players.length; i++) {
		let sel = 'table[data-id="score-card"] thead th.player' + (i+1);
		let th = <HTMLElement>curGame.querySelector(sel);
		th.innerText = players[i];
	}
}


function updateScoringTableNames(players) {
	updateScoringTableHeader(players);
	let tds = curGame.querySelectorAll('table[data-id="score-card"] td.played-by');
	for (let i = 0; i < tds.length; i++) {
		let td = <HTMLElement>tds[i];
		let id = td.dataset.playerid;
		if (id) {
			td.innerText = players[id];
		}
	}
	let td = <HTMLElement>curGame.querySelector('table[data-id="score-card"] td.player-ahead');
	let id = td.dataset.playerid;
	if (id) {
		td.innerText = players[id];
	}
}


function play(): void {
	let startingPlayers = curGame.getElementsByClassName("starting-player");
	let checked: number[] = [];
	for (let i = 0; i < startingPlayers.length; i++) {
		if ((<HTMLInputElement>startingPlayers[i]).checked) {
			checked.push(i);
		}
	}
	if (checked.length == 0) {
		alert("No starting player selected");
		let input = <HTMLElement>curGame.getElementsByClassName("player-name")[0];
		input.focus();
		return ;
	}
	if (checked.length > 1) {
		alert("To many starting players selected");
		let input = <HTMLElement>curGame.getElementsByClassName("player-name")[0];
		input.focus();
		return ;
	}
	iplayer = checked[0];
	let name = players[iplayer]

	let node = document.getElementById(gameName);
	let elem = node.querySelector('[value="Play!"]');
	let section = elem.nextElementSibling;

	setPlayerOrder(players);
	updateScoringTableHeader(players)

	section.setAttribute("class", "");
	let header = section.querySelector('h1[data-id="score-card"]');
	header.scrollIntoView(true);

	(<HTMLInputElement>curGame.querySelector('[data-id="play"]')).disabled = true;

	setPlayerNames();
	setMiniGameLinks();
}



function getDateTime(): string {
    var curdate = new Date();
	let month: number = curdate.getMonth() + 1;
	let day: number = curdate.getDate();
	return (curdate.getFullYear() + "-" +
            (month < 10 ? "0" + String(month) : String(month)) + "-" +
            (day < 10 ? "0" + String(day) : String(day)) + " " +
            curdate.getHours() + ":" +
            curdate.getMinutes() + ":" + curdate.getSeconds());
}


document.addEventListener("DOMContentLoaded", function(event): void {
	document.getElementById("game-name").focus();
});

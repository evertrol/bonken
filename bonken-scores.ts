let gameName: string;
let curGame: HTMLElement;
let players: string[] = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
let iplayer: number = -1;
let currentPlayerSpan: HTMLElement;
let biddingPlayerSpan: HTMLElement;
//let miniGame: string = "";
let nGames = 0;
let inMiniGame = false;
let gamesPlayed: string[] = [];


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


function updateScore(name, scores) {
	console.log('scores =', scores);

	let selector = 'section[data-game="' + name + '"] tbody tr';
	let trs = curGame.querySelectorAll(selector);
	console.log(selector, trs);
	for (let i = 0; i < scores.length; i++) {
		let td = <HTMLElement>trs[i].querySelector('td:last-child');
		td.innerText = scores[i];
	}


}


function calcBids() {
	let bids = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

	let inputs = curGame.querySelector('table[data-id="bidding"] tbody').
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
	//totalPoints.set(name, [0, 0, 0, 0]);
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
			console.log(i, j, score1, score2, score1-score2, bidsum, diff);
			score += diff;
		}
		console.log(i, values[i], score);
		points = mult * score;
		scores[i] = points;
		// totalPoints.get(name)[i] = points;
	}
	console.log('scores:', scores);
	return scores;
}


/*
function calcHearts(values) {
	let mult = -10;
	totalPoints.set('hearts', [0, 0, 0, 0]);
	for (let i = 0; i < 4; i++) {
		let points = 0;
		for (let j = 0; j < 4; j++) {
			if (i == j) {
				continue;
			}
			let score1 = values[i];
			let score2 = values[j];
			let bidsum = bids[i][j] + bids[j][i];
			let diff = (score1 - score2) * bidsum;
			points += (score1 + diff) * mult;
		}
		totalPoints.get('hearts')[i] = points;
	}
	console.log(totalPoints.get('hearts'));
	console.log(totalPoints);
}
*/


function nextGame() {

}


function calcScore(name) {
	console.log("Calculating scores");
	let selector = 'section[data-game="'+name+'"] table input';
	let inputs = Array.from(curGame.querySelectorAll(selector));
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
    				alert("input is not a number");
    			} else {
    				sum += n;
					values[i] = n;
    			}
			}
		}
	}
	console.log(sum, name, sums.get(name));
	if (sum == sums.get(name)) {
		console.log('full sum; values =', values);
		let scores = calcGeneric(values, name);
		console.log(scores);
		updateScore(name, scores);
		totalPoints.set(name, scores);
		(<HTMLInputElement>curGame.querySelector('input[data-id="next"]')).disabled = false;
	} else if (sum > sums.get(name)) {
		alert('too many tricks');
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

	let resultSection = curGame.querySelector('section[data-id="results"]');
	resultSection.setAttribute("class", "");

	let section = <HTMLElement>curGame.querySelector('section[data-game="'+name+'"]');
	section.scrollIntoView(true);

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

	let cancel = <HTMLInputElement>curGame.querySelector('input[name="cancel"]');
	cancel.onclick = function() { cancelGame(name); };
	let input = <HTMLInputElement>curGame.querySelector('input[data-id="next"]');
	input.disabled = true;
	input.onclick = function() {
		inMiniGame = false;
		nGames += 1;
		updateScoreCard(name);
		if (nGames < 12) {
			nextMiniGame(name);
		} else {
			nextMiniGame(name);
			finishGame();
		}
	}

	startBidding(name);
}


function startBidding(name) {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			bids[i][j] = 0;
		}
	}

	let table = <HTMLElement>curGame.querySelector('table[data-id="bidding"]');
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


function finishGame() {
	// Disable the last link
	let selector = 'table[data-id="score-card"] tr th a';
	let links = curGame.querySelectorAll(selector);
	for (let i = 0; i < links.length; i++) {
		let link = <HTMLElement>links[i];
		let text = link.innerText;
		link.parentElement.innerText = text;
	}
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
	(<HTMLElement>tr.querySelector('td.player-ahead')).innerText = players[imax];

	let selector = 'table[data-id="score-card"] tr[data-game="' + name + '"]';
	let row = curGame.querySelector(selector);
	(<HTMLElement>row.querySelector('td.played-by')).innerText = players[iplayer];
	//(<HTMLElement>row.querySelector('td.completed')).innerHTML = "&#x2713";

	let link = <HTMLElement>row.querySelector('a');
	let text = link.innerText;
	link.parentElement.innerText = text;
	//link.parentElement.innerHTML = "";

}


function nextMiniGame(oldName: string, cancelled?: boolean) {
	gamesPlayed.push(oldName);
	curGame.querySelector('[data-id="mini-game"]').setAttribute('class', 'hidden');
	curGame.querySelector('section[data-id="results"]').setAttribute('class', 'hidden');
	curGame.querySelector('section[data-game="'+oldName+'"]').setAttribute('class', 'hidden');

	let table = <HTMLTableElement>curGame.querySelector('table[data-id="bidding"]');
	while (table.rows.length > 0) {
		table.deleteRow(0);
	}

	if (!cancelled) {
		iplayer += 1;
		iplayer %= 4;
	}

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
				span.innerText = "Martin";
			} else {
				span.innerText = players[(iplayer+2)%4];
			}
		}
		if (cls == "leading-player") {
			span.innerText = players[(iplayer+3)%4];
		}
	}

	let header = curGame.querySelector('h1[data-id="score-card"]');
	header.scrollIntoView(true);

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

function setMiniGameLinks() {
	let table = curGame.querySelector('table[data-id="score-card"]');
	for (let name of gameNames) {
		let selector = "tr." + name + " a";
		let link = <HTMLElement>table.querySelector(selector);
		link.onclick = function() {
			if (inMiniGame) {
				return false;
			}
			let section = <HTMLElement>curGame.querySelector('[data-id="mini-game"]');
			section.setAttribute('class', '');
			section.getElementsByTagName('h1')[0].innerText = name.replace(/\-/g, ' ');
			curGame.querySelector('section[data-game="'+name+'"]').setAttribute('class', '');
			let header = <HTMLElement>curGame.querySelector('section[data-id="mini-game"] h1');
			header.scrollIntoView(true);

			startMiniGame(name);
			return false;
		}

		selector = 'section[data-game="'+name+'"] table input';
		let inputs = Array.from(curGame.querySelectorAll(selector));
		for (let input of inputs) {
			input.addEventListener('input', function(event) { calcScore(name) });
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


function startNewGame(): void {
    let elem = <HTMLInputElement>document.getElementById("game-name");
    gameName = elem.value;
 	if (gameName == "") {
	    gameName = getDateTime();
	}
	gameName = "game-" + gameName;

	let node = document.getElementById("start-new-game");
	curGame = <HTMLElement>(node.cloneNode(true));
	let newNode = curGame;
	newNode.id = gameName;
	newNode.setAttribute("class", "");
	document.body.appendChild(newNode);

	let inputs = newNode.getElementsByClassName("player-name");
	for (let i = 0; i < inputs.length; i++) {
		let input = inputs[i];
		input.addEventListener('input', function(event) {
			let curinput = <HTMLInputElement>(event.target);
			let j = parseInt(curinput.dataset.player) - 1;
			players[j] = curinput.value;
		});
	}
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


function updateScoringTableHeader(players) {
	for (let i = 0; i < players.length; i++) {
		let sel = 'table[data-id="score-card"] thead th.player' + (i+1);
		let th = <HTMLElement>curGame.querySelector(sel);
		th.innerText = players[i];
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
				span.innerText = "Martin";
			} else {
				span.innerText = players[(iplayer+2)%4];
			}
		}
		if (cls == "leading-player") {
			span.innerText = players[(iplayer+3)%4];
		}
	}

	updateScoringTableHeader(players)

	section.setAttribute("class", "");
	let header = section.querySelector('h1');
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
            (day < 10 ? "0" + String(day) : String(day)) + "T" +
            curdate.getHours() + ":" +
            curdate.getMinutes());
}


document.addEventListener("DOMContentLoaded", function(event): void {
	document.getElementById("game-name").focus();
});

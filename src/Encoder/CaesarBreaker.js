var entropies;

function stringFromCodeArray(array) {
	str = ""
	for (var i=0; i<array.length; i++){
	    str += String.fromCharCode(array[i])
	}
	return str
}

export function bestShiftCrack(trialsDict, language, alphabet) {


	for (var i=0; i<alphabet.length; i++) {
		trialsDict[i] = stringFromCodeArray(trialsDict[i])
	}

	entropies = getAllEntropies(trialsDict, language, alphabet);
	entropies.sort(function(x, y) {
		// Compare by lowest entropy, break ties by lowest shift
		if (x[1] != y[1])
			return x[1] - y[1];
		else
			return x[0] - y[0];
	});

	div = document.getElementById("crack-results")
	div.innerHTML = `
	<table>
	<thead>
		<tr>
			<th>Shift</th>
			<th colspan="2">Entropy per letter (bits) <span style="font-weight:normal">(lower is better)</span></th>
			<th colspan="2">Beginning of deciphered text </th>
		</tr>
	</thead>
	<tbody id="guesses"></tbody>
	</table>
	`
	
	var guessesElem = document.getElementById("guesses");
	entropies.forEach(function(item, index) {
		maxEntropy = entropies[entropies.length - 1][1];
		minEntropy = entropies[0][1];
		var tr = guessesElem.appendChild(document.createElement("tr"));
		if (index == 0)
			tr.classList.add("active");
		var td = tr.appendChild(document.createElement("td"));
		td.textContent = item[0].toString();
		
		td = tr.appendChild(document.createElement("td"));
		td.textContent = item[1].toFixed(3);
		
		td = tr.appendChild(document.createElement("td"));
		var div = td.appendChild(document.createElement("div"));
		div.classList.add("bar");
		div.style.width = (item[1] / maxEntropy * 10 + 1).toFixed(6) + "em";
		
		td = tr.appendChild(document.createElement("td"));
		td.textContent = trialsDict[item[0]];
	});

	window.scrollTo(0, document.body.scrollHeight);
	
	// Decrypt using lowest entropy shift
	var bestShift = entropies[0][0];
	return bestShift;
}

// Unigram model frequencies for letters A, B, ..., Z
var ENGLISH_FREQS = [
	0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015, 0.06094, 0.06966, 0.00153, 0.00772, 0.04025, 0.02406,
	0.06749, 0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758, 0.00978, 0.02360, 0.00150, 0.01974, 0.00074,
];

var ITALIAN_FREQS = [
	0.11740, 0.00920, 0.04500, 0.03730, 0.11790, 0.00950, 0.01640, 0.01540, 0.11280, 0.06510, 0.02510, 0.06880, 0.09830, 
	0.03050, 0.00510, 0.06370, 0.04980, 0.05620, 0.03010, 0.02100, 0.00490,
];

// Returns the cross-entropy of the given string with respect to the unigram frequencies, which is a positive floating-point number.
function getEntropy(str, language, alphabet) {
	var sum = 0;
	var ignored = 0;
	if (language == 'english')
		var FREQS = ENGLISH_FREQS
	else if (language == 'italian')
		var FREQS = ITALIAN_FREQS
	//it is due to the programmer not having language different from english or italian
	for (var i = 0; i < str.length; i++) {
		var c = str[i].toLowerCase();
		console.log(c)
		letter_num = alphabet.indexOf(c); // a is 0
		console.log(letter_num)
		if (letter_num != -1)
			sum += Math.log(FREQS[letter_num]);
		else
			ignored++;
	}
	console.log(sum)
	return -sum / Math.log(2) / (str.length - ignored);
}

// Returns the entropies when the given string is decrypted with all 26 possible shifts,
// where the result is an array of pairs (int shift, float entropy) - e.g. [[0, 2.01], [1, 4.95], ..., [25, 3.73]].
function getAllEntropies(trialsDict, language, alphabet) {
	var result = [];
	for (var i=0; i < alphabet.length; i++)
		result.push([i, getEntropy(trialsDict[i], language, alphabet)]);
	return result;
}
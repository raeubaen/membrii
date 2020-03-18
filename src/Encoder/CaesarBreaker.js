
function stringFromCodeArray(array) {
	str = ""
	for (var i=0; i<array.length; i++){
	    str += String.fromCharCode(array[i])
	}
	return str
}

export function bestShiftCrack(trialsDict, crackLanguage, alphabet) {

	for (var i=0; i<alphabet.length; i++) {
		trialsDict[i] = stringFromCodeArray(trialsDict[i])
	}

	let entropies = getAllEntropies(trialsDict, crackLanguage, alphabet);
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
	<table><tbody style="text-align: center"><tr><td>To change the shift, say 'No' to Need Crack</td></tr></tbody></table>
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

	//window.scrollTo(0, document.body.scrollHeight); //scrolls down the page

	// Decrypt using lowest entropy shift
	var bestShift = entropies[0][0];
	return bestShift;
}

// Unigram model frequencies for letters A, B, ..., Z
var ENGLISH_FREQS = {
	"a": 0.08167, "b": 0.01492, "c": 0.02782, "d": 0.04253, "e": 0.12702, "f": 0.02228, "g": 0.02015, "h": 0.06094,
        "i": 0.06966, "j": 0.00153, "k": 0.00772, "l": 0.04025, "m": 0.02406, "n": 0.06749, "o": 0.07507, "p": 0.01929,
        "q": 0.00095, "r": 0.05987, "s": 0.06327, "t": 0.09056, "u": 0.02758, "v": 0.00978, "w": 0.02360, "x": 0.00150,
        "y": 0.01974, "z": 0.00074,
};

var ITALIAN_FREQS = {
	"a": 0.11740, "b": 0.00920, "c": 0.04500, "d": 0.03730, "e": 0.11790, "f": 0.00950, "g": 0.01640, "h": 0.01540,
        "i": 0.11280, "l": 0.06510, "m": 0.02510, "n": 0.06880, "o": 0.09830, "p": 0.03050, "q": 0.00510, "r": 0.06370,
        "s": 0.04980, "t": 0.05620, "u": 0.03010, "v": 0.02100, "z": 0.00490,
};

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
		var freq = FREQS[str[i].toLowerCase()];
		if (freq !== undefined)
			sum += Math.log(freq);
		else
			ignored++;
	}
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
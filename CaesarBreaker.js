var entropies;

function stringFromCodeArray(array) {
	str = ""
	for (var i=0; i<array.length; i++){
	    str += String.fromCharCode(array[i])
	}
	return str
}

export function bestShiftCrack(content, language, trialsDict) {
	text = content._string
	entropies = getAllEntropies(text, language);
	entropies.sort(function(x, y) {
		// Compare by lowest entropy, break ties by lowest shift
		if (x[1] != y[1])
			return x[1] - y[1];
		else
			return x[0] - y[0];
	});

	var w = window.open("entropies.html");
	Storage.prototype.setObj = function(key, obj) {
		return this.setItem(key, JSON.stringify(obj))
	}
	localStorage.setObj("entropies", entropies)
	trials = {}
	alph_len = language == "english" ? 26 : 21;
	for (var i=0; i<alph_len; i++) {
		trials[i] = stringFromCodeArray(trialsDict[i])
	}
	localStorage.setObj("trials", trials)

	// Decrypt using lowest entropy shift
	var bestShift = entropies[0][0];
	return bestShift;
}

function mod(x, y) {
	return (x % y + y) % y;
}

// Decrypts the given string with the given key using the Caesar shift cipher.
// The key is an integer representing the number of letters to step back by - e.g. decrypt("EB", 2) = "CZ".
function decrypt(str, key) {
	var result = "";
	for (var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if      (65 <= c && c <=  90) result += String.fromCharCode(mod(c - 65 - key, 26) + 65);  // Uppercase
		else if (97 <= c && c <= 122) result += String.fromCharCode(mod(c - 97 - key, 26) + 97);  // Lowercase
		else result += str.charAt(i);  // Copy
	}
	return result;
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

// Returns the cross-entropy of the given string with respect to the English unigram frequencies, which is a positive floating-point number.
function getEntropy(str, language) {
	var sum = 0;
	var ignored = 0;
	if (language == 'english') var FREQS = ENGLISH_FREQS
	else if (language == 'italian') var FREQS = ITALIAN_FREQS 
	//it is due to the programmer not having language different from english or italian
	for (var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if      (65 <= c && c <=  90) sum += Math.log(FREQS[c - 65]);  // Uppercase
		else if (97 <= c && c <= 122) sum += Math.log(FREQS[c - 97]);  // Lowercase
		else ignored++;
	}
	return -sum / Math.log(2) / (str.length - ignored);
}

// Returns the entropies when the given string is decrypted with all 26 possible shifts,
// where the result is an array of pairs (int shift, float enptroy) - e.g. [[0, 2.01], [1, 4.95], ..., [25, 3.73]].
function getAllEntropies(str, language) {
	var result = [];
	for (var i = 0; i < 26; i++)
		result.push([i, getEntropy(decrypt(str, i), language)]);
	return result;
}
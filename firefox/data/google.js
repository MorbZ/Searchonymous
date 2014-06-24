//replace country name with own text
var logo = document.getElementById("hplogo");
if(logo != undefined) {
	//non-US version?
	if(logo.hasChildNodes() && logo.nodeName == "DIV") {
		//check for doodle
		var logoChild = logo.firstChild;
		if(logoChild.hasChildNodes()) {
			//only text?
			var textChild = logoChild.firstChild;
			if(textChild.nodeValue) {
				textChild.nodeValue = "anonym";
			}
		}
	}
}

//add link to bottom bar
var bar = document.getElementById("fsl");
if(bar != undefined) {
	bar.innerHTML += '<a style="font-weight: bold;" class="_Ld" target="_blank" href="https://addons.mozilla.org/firefox/addon/searchonymous/">anonym &#10003;</a>';
}
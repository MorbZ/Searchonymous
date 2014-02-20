//replace country name with own text
var logo = document.getElementById("hplogo");
if(logo != undefined) {
	var anonymous = "anonym";
	if(logo.hasChildNodes()) {
		logo.firstChild.innerHTML = anonymous;
	}
}
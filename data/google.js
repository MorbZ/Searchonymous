//replace country name with own text
var logo = document.getElementById("hplogo");
if(logo != undefined) {
	var anonymous = "anonym";
	if(logo.hasChildNodes) {
		logo.firstChild.innerHTML = anonymous;
	} else {
		logo.innerHTML = '<div nowrap="" style="color:#777;font-size:16px;font-weight:bold;position:relative;left:218px;top:70px">' + anonymous + '</div>'
	}
}
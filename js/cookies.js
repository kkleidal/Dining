function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	if (exdays != null) exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}
function getCookie(c_name)
{
var c_value = document.cookie;
var c_start = c_value.indexOf(" " + c_name + "=");
if (c_start == -1)
  {
  c_start = c_value.indexOf(c_name + "=");
  }
if (c_start == -1)
  {
  c_value = null;
  }
else
  {
  c_start = c_value.indexOf("=", c_start) + 1;
  var c_end = c_value.indexOf(";", c_start);
  if (c_end == -1)
  {
c_end = c_value.length;
}
c_value = unescape(c_value.substring(c_start,c_end));
}
return c_value;
}
function isCookie(c_name) {
	var cookie = getCookie(c_name);
	return (cookie != null && cookie != "")
}

var cookieName = "whatsCookingMIThall";
function setDefaultHall(id) {
	if (id < 0 || id >= diningHalls.length) return -1;
	setCookie(cookieName, diningHalls[id], 365 * 4);
	return 0;
}
function getDefaultHall() {
	if (isCookie(cookieName)) {
		var c_value = getCookie(cookieName);
		var i = diningHalls.indexOf(c_value);
		if (i >= 0) return i;
	}
	return 1;
}

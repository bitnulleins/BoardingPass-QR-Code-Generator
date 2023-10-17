"use strict"

var textOut = null
var textIn = ""
var fields = {}

var run, getDayOfYear
var ctx = null

function start() 
{
	update_bookmark()
	
	run = Module.cwrap('run', null, ['number', 'string', 'number', 'number'])
	ctx = theimg3.getContext('2d')
	dateEd.value = todayInputValue()

	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop),
	});

	if (params.firstName && params.lastName) {
		document.getElementById('firstNameEd').value	= params.firstName
		document.getElementById('lastNameEd').value		= params.lastName
		document.getElementById('fOpEd').value			= params.flightOps
		document.getElementById('fNumEd').value			= params.flightnumber
		document.getElementById('fromEd').value			= params.from
		document.getElementById('toEd').value			= params.to
		document.getElementById('seatNumEd').value		= params.seatNum
		document.getElementById('bookRefEd').value		= params.bookRef
	}

	formatName()
	formatField('bookRef')
	formatField('from')
	formatField('to')
	formatField('fOp')
	formatField('fNum')
	readDate()
	formatClass()
	formatSeat()
	formatSeqNum()
	format()
}

function update_bookmark() {
	let queries = []
	queries['firstName']		= document.getElementById('firstNameEd').value
	queries['lastName']			= document.getElementById('lastNameEd').value
	queries['flightOps']		= document.getElementById('fOpEd').value
	queries['flightnumber']		= document.getElementById('fNumEd').value
	queries['from']				= document.getElementById('fromEd').value
	queries['to']				= document.getElementById('toEd').value
	queries['seatNum']			= document.getElementById('seatNumEd').value
	queries['bookRef']			= document.getElementById('bookRefEd').value

	let query = Object.entries(queries).map(([k,v]) => `${k}=${v}`)
	
	document.getElementById('bookmark').href='?' + query.join('&')
}

function errclear() {
	errMsg.innerHTML = ''
	errMsg.style.visibility = 'hidden'
}
function err(msg) {
	if (errMsg.innerHTML == '') {
		errMsg.innerHTML = msg
		errMsg.style.visibility = 'visible'
	}
}

function update(fromRaw)
{
	update_bookmark()
	
	if (!fromRaw)
		textEdit.innerHTML = textIn
		else
			textIn = textEdit.value
			var ecc =  parseInt(eccSelect.value)
			var ssize = parseInt(symSize.value)  // if this is 0, ecc is used
			var btype = parseInt(codeTypeSel.value)
			run(btype, textIn, ecc, ssize)

			theimg2.onload = function() {
				theimg3.width = theimg2.width
				theimg3.height = theimg2.height
				ctx.drawImage(theimg2, 0, 0)
			}

			var b = new Blob([textOut], {type: "image/svg+xml"});
	var reader = new FileReader();
	reader.onload = function(e) { 
		theimg2.src = e.target.result 
	}
	reader.onerror = function(e) {
		console.log(e)
	}
	reader.readAsDataURL(b); // read as data URL since we want to put it in an img src

}

function format() {
	textIn = "M1" + fields.name + "E" + fields.bookRef + fields.from + fields.to 
	+ fields.fOp + fields.fNum + fields.date + fields.cls + fields.seat + fields.seqNum
	+ "1" + "00"
	// 1 passenger status, 00 - hex length of following data
	update()
}
function upPadRight(s, n) {
	s = s.toUpperCase()
	while(s.length < n)
		s = s + ' ';
	return s.substr(0,n)
}

function padLeft(s, n) {
	s = s.toUpperCase()
	while(s.length < n)
		s = '0' + s;
	return s.substr(0,n)
}

function formatName(doRun) {
	errclear()
	if (lastNameEd.value.length > 18) // need space for slash and last name
		err("first name longer than 18 charcters")
		var v = lastNameEd.value + "/" + firstNameEd.value
		if (v.length > 20)
			err("first+last name longer than 20 characters")

			fields.name = upPadRight(v, 20)
			if (doRun)
				format()
				}

var fldDef = {
	'bookRef': { pad: 7, desc:"Booking Ref"},
	'from':    { pad: 3, desc:"From"},
	'to':      { pad: 3, desc:"To"},
	'fOp':     { pad: 3, desc:"Flight Operator"},
	'fNum':    { pad: 5, desc:"Flight Number"}
}

function formatField(name, doRun) {
	errclear('')
	var def = fldDef[name]
	var v = document.getElementById(name + "Ed").value
	if (v.length > def.pad)
		err('"' + def.desc + '" longer than ' + def.pad + " chars")
		fields[name] = upPadRight(v, def.pad)
		if (doRun)
			format()
			}

function formatDay(doRun) {
	fields.date = padLeft(dayOfYearEd.value, 3)
	if (doRun)
		format()
		}
function todayInputValue() { // http://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
	var local = new Date();
	return local.toJSON().slice(0,10);
}

function dayOfYear(yr, mon, mday)
{
	var now = new Date(yr, mon, mday, 1, 0, 0)
	var start = new Date(yr, 0, 1, 0, 0);
	var diff = now - start;
	var oneDay = 1000 * 60 * 60 * 24;
	var day = Math.floor(diff / oneDay) + 1; // start at 1
	return day
}

function readDate(toRun) {
	var dl = dateEd.value.split('-')
	var mday = parseInt(dl[2])
	var mon = parseInt(dl[1]) - 1  // the range of the input is [1-12]
	var yr = parseInt(dl[0])

	dayOfYearEd.value = dayOfYear(yr, mon, mday)
	formatDay(toRun)
}
function formatClass(doRun) {
	fields.cls = classSel.value
	if (doRun)
		format()
		}
function formatSeat(doRun) {
	errclear()
	var n = seatNumEd.value
	if (n.length > 4)
		err("Seat longer than 4 chars")
		fields.seat = padLeft(n, 4)
		if (doRun)
			format()
			}
function formatSeqNum(doRun) {
	errclear()
	var n = "0" + getRandomArbitrary(500,999)
	if (n.length > 4)
		err("Seq number longer than 4 chars")    
		fields.seqNum = upPadRight(padLeft(n, 4), 5)
		if (doRun)
			format()
			}    

function typeUpdate() {
	if (codeTypeSel.value == "0")
		symSize.value = "11"  // size of the aztec
		else
			symSize.value = "6"  // columns in the barcode
			update()
}
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}
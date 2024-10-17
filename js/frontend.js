"use strict"

const html5QrCode = new Html5Qrcode("reader");

var textOut = null
var textIn = ""
var fields = {}

var run, getDayOfYear
var ctx = null

var fldDef = {
	'bookRef': { pad: 7, desc:"Booking Ref"},
	'from':    { pad: 3, desc:"From"},
	'to':      { pad: 3, desc:"To"},
	'fOp':     { pad: 3, desc:"Flight Operator"},
	'fNum':    { pad: 5, desc:"Flight Number"},
	'seqNum':  { pad: 4, desc:"Seq Number"}
}

function start() 
{	
	run = Module.cwrap('run', null, ['number', 'string', 'number', 'number'])
	ctx = theimg3.getContext('2d')

	formatSeqNum()
	formatName()
	formatField('bookRef')
	formatField('from')
	formatField('to')
	formatField('fOp')
	formatField('fNum')
	formatField('seqNum')
	readDate()
	formatClass()
	formatSeat()

	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	if (Object.keys(params).length > 0) {
		Object.entries(params).forEach(([k, v]) => fields[k] = v)
		document.getElementById("dateEd").value = getDateFromDays(fields.date)
	}

	// Update
	format()
	update_bookmark()
}

function update_bookmark() {
	let queries = []
	queries['name']				= fields.name
	queries['fOp']				= fields.fOp
	queries['fNum']				= fields.fNum
	queries['from']				= fields.from
	queries['to']				= fields.to
	queries['date']				= fields.date
	queries['seat']				= fields.seat
	queries['bookRef']			= fields.bookRef
	queries['seqNum']			= fields.seqNum
	queries['cls']				= fields.cls

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
	document.getElementById('firstNameEd').value	= fields.name.trim().split('/')[1].toUpperCase()
	document.getElementById('lastNameEd').value		= fields.name.trim().split('/')[0].toUpperCase()
	document.getElementById('fOpEd').value			= fields.fOp.toUpperCase()
	document.getElementById('fNumEd').value			= fields.fNum.toUpperCase()
	document.getElementById('fromEd').value			= fields.from.toUpperCase()
	document.getElementById('toEd').value			= fields.to.toUpperCase()
	document.getElementById('seatNumEd').value		= fields.seat.toUpperCase()
	document.getElementById('bookRefEd').value		= fields.bookRef.toUpperCase()
	document.getElementById('seqNumEd').value		= fields.seqNum.toUpperCase()
	if (fields.cls == 'M') fields.cls = 'Y'
	document.getElementById('classSel').value		= fields.cls.toUpperCase()

	textIn = "M1"
		+ upPadRight(fields.name,20)
		+ "E"
		+ upPadRight(fields.bookRef, fldDef['bookRef'].pad)
		+ upPadRight(fields.from, fldDef['from'].pad)
		+ upPadRight(fields.to, fldDef['to'].pad)
		+ upPadRight(fields.fOp, fldDef['fOp'].pad)
		+ upPadRight(fields.fNum, fldDef['fNum'].pad)
		+ padLeft(fields.date, 3) 
		+ fields.cls
		+ padLeft(fields.seat, 4)
		+ padLeft(fields.seqNum, 4)
		+ "1" + "00" // 1 passenger status, 00 - hex length of following data
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

function formatField(name, doRun) {
	errclear('')
	var def = fldDef[name]
	var v = document.getElementById(name + "Ed").value
	if (v.length > def.pad)
		err('"' + def.desc + '" longer than ' + def.pad + " chars")
		fields[name] = v
		if (doRun) format()
}

function formatName(doRun) {
	errclear()
	if (lastNameEd.value.length > 18) // need space for slash and last name
		err("first name longer than 18 charcters")
		var v = lastNameEd.value + "/" + firstNameEd.value
		if (v.length > 20)
			err("first+last name longer than 20 characters")
			fields.name = v
			if (doRun) format()
}

function formatDay(doRun) {
	fields.date = dayOfYearEd.value
	if (doRun) format()
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

function getDateFromDays(days) {
	var acutalYear = new Date().getFullYear()
	return new Date(new Date(acutalYear, 0).setDate(days)).toJSON().slice(0,10)
}

function formatClass(doRun) {
	fields.cls = classSel.value
	if (doRun) format()
}
function formatSeat(doRun) {
	errclear()
	var n = seatNumEd.value
	if (n.length > 4)
		err("Seat longer than 4 chars")
		fields.seat = n
		if (doRun) format()
}
function formatSeqNum(doRun) {
	errclear()
	var n = "0" + getRandomArbitrary(500,999)
	if (n.length > 4)
		err("Seq number longer than 4 chars")    
		if (seqNumEd.value == '0000') {
			document.getElementById('seqNumEd').value = n
		} else {
			fields.seqNum = seqNumEd.value
		}
		if (doRun) format()
}    

function typeUpdate() {
	if (codeTypeSel.value == "0")
		symSize.value = "11"  // size of the aztec
	else
		symSize.value = "6"  // columns in the barcode
	update()
}
function getRandomArbitrary(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

function loadQRCode(doRun) {
	errclear()
	if (doRun.files.length == 0) return;
	
	// Scan QR Code
	html5QrCode.scanFile(doRun.files[0], false)
	.then(qr_code_val => {
		fields.name 	= qr_code_val.substring(2, 22)
		fields.bookRef 	= qr_code_val.substring(23, 29).trim()
		fields.from 	= qr_code_val.substring(30, 33).trim()
		fields.to 		= qr_code_val.substring(33, 36).trim()
		fields.fOp 		= qr_code_val.substring(36, 39).trim()
		fields.fNum 	= qr_code_val.substring(39, 44).trim()
		fields.seat 	= qr_code_val.substring(49, 52).trim()
		fields.cls 		= qr_code_val.substring(47, 48).trim()
		fields.date 	= qr_code_val.substring(44, 47).trim()
		fields.seqNum 	= qr_code_val.substring(52, 56).trim()
		document.getElementById("dateEd").value = getDateFromDays(fields.date)
		if (doRun) format()
	})
	.catch(msg => {
		err('Error scanning file. Crop only to QR-Code part.')
		console.log(`Error scanning file. Reason: ${msg}`)
	});
}
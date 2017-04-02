'use strict';

function getElement(id) {
    return document.getElementById(id);
}

function getElementInt(id) {
    return parseInt(document.getElementById(id).value);
}

function addStyle(id, src){
	var a = document.getElementById(id);
	if (a) {
		document.head.removeChild(a);
	}
	
	var style = document.createElement("style");
	style.id = id;
	if (document.head)
		 document.head.appendChild(style);
	else document.getElementsByTagName("head")[0].appendChild(style);
	style.innerHTML = src;
}

function detectIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }
  return false;
}
	
// ///////////////////////////////////////////////////////////////////////////
function TableClass(target, dataset) {
	this.dataTable = d3.select("#"+target).append("table");

	this.SetData(dataset);
	
	this.hiddenDiv = document.createElement( 'div');
	this.hiddenDiv.style.display="none";
	document.body.appendChild(this.hiddenDiv);
	this.input = document.createElement( 'input');
	this.input.type = 'text'; 
	this.input.className = 'tableInput';
	this.hiddenDiv.appendChild(this.input);
}

TableClass.prototype.SetData = function(data){
	var a = this.dataTable.selectAll("tr");
	a.remove();
	
	var rows = this.dataTable.selectAll("tr")
		.data(data)
		.enter()
		.append("tr");
			
	var cells = rows.selectAll("td")
		.data(function ( d ) {return d; })
		.enter()
		.append("td")
			.text(function( d ) {return d; })
			.on("mousedown", this.tdMousedown);
			
    this.dataTable.style({"width": (cells[0].length*50)+"px"});
}


TableClass.prototype.tdMousedown = function(){
	if (!d3.event || d3.event.target.nodeName !== 'TD') return;
	
	if (tableClass.selectTD) {
		tableClass.selectTD.innerText = tableClass.input.value;
	}
	tableClass.selectTD = d3.event.target;
	tableClass.input.value = tableClass.selectTD.innerText;
	tableClass.selectTD.innerHTML = '';
	tableClass.selectTD.appendChild(tableClass.input);
	tableClass.input.focus();
}

	
TableClass.prototype.getDataArray = function(){
	if (this.selectTD){
		this.selectTD.innerText = this.input.value;
		this.hiddenDiv.appendChild(this.input);
		this.selectTD = null;
	}
			
	var data = [];
	var table = this.dataTable[0][0];
	for (var y = 0; y < table.rows.length; y++){
		var tr = table.rows[y];
		var arr = [];
		for (var x = 0; x < tr.cells.length; x++){
			if (tr.cells[x]===this.selectTD){
				arr[x] =this.input.value;
			} else{
				arr[x] = tr.cells[x].innerText;
			}
		}
		data[y] = arr;
	}
	return data;
}

TableClass.prototype.insertColumn = function(){
	var cells=this.dataTable.selectAll("tr")[0][0].cells;

	var td=null;
	if (this.selectTD) {
		td=this.selectTD;
	} else {
		td=cells[cells.length-1];
	}

    var inx = td.cellIndex;
	var thisclass = this;
	
	this.dataTable
		.selectAll("tr")
		.selectAll("td")
		.filter(function (d, i) {return i === inx;})
		.map(function(d) {
			var td = d[0];
			var	newTD = td.cloneNode(true);
			newTD.innerText ='';
			td.parentNode.insertBefore(newTD, td.nextSibling);
			d3.select(newTD).on("mousedown", thisclass.tdMousedown)
        })
		
    this.dataTable.style({"width": (parseInt(this.dataTable.style("width"))+50)+"px"});
}

TableClass.prototype.insertRow = function(){
	var tr = null;
	if (this.selectTD) {
		tr = this.selectTD.parentNode;
	} else {
		var rows = this.dataTable.selectAll("tr")[0];
		tr = rows[rows.length-1];
	}
	
    var newTR = document.createElement('tr');
	tr.parentNode.insertBefore(newTR, tr.nextSibling);
			
	for (var x = 0; x < tr.cells.length; x++){
		var newTD = tr.cells[x].cloneNode(true);
		newTD.innerHTML = '';
		d3.select(newTD).on('mousedown', this.tdMousedown);
		
		newTR.insertBefore(newTD, null);
	}
}

TableClass.prototype.deleteRow = function(){
	var rows = this.dataTable.selectAll("tr")[0];
	if (rows.length===1) {
		alert('There is one row. You can not delete it anymore.');
		return;
	}
	
	var tr = null;
	if (this.selectTD) {
		tr = this.selectTD.parentNode;
	} else {
		tr = rows[rows.length-1];
	}

	tr.parentNode.removeChild(tr); 
	this.selectTD = null;
}

TableClass.prototype.deleteColumn = function(){
	var cells=this.dataTable.selectAll("tr")[0][0].cells;
	if (cells.length===1) {
		alert('There is one column. You can not delete it anymore.');
		return;
	}
	var td=null;
	if (this.selectTD) {
		td=this.selectTD;
	} else {
		td=cells[cells.length-1];
	}

    var inx = td.cellIndex;
	
	this.dataTable
		.selectAll("tr")
		.selectAll("td")
		.filter(function (d, i) {return i === inx;})
		.map(function(d) {
			d.parentNode.removeChild(d[0]);
        })
		
	this.selectTD = null;

    this.dataTable.style({"width": (parseInt(this.dataTable.style("width"))-50)+"px"});
}

// ///////////////////////////////////////////////////////////////////////////
function importData(){
	var file = d3.select("#filepath")[0][0].files[0];
	if (!file) {
		alert("Please select an import file");
		return;
	}
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		var dataUrl = evt.target.result;
		loadData(dataUrl);
	};
	reader.readAsDataURL(file);
}	

function loadData(filePath){			
	d3.csv(filePath, function(error, data) {
		if (error) throw error;

		var columns = Object.keys(data[0]);
		var dataSet = [];
		dataSet[0] = columns;
		
		data.forEach(function(d, i) {
			var subData = [];
			columns.forEach(function(sd, j) {
				subData.push(d[sd]);	
			});
			dataSet[i+1] = subData;
		});
		
		tableClass.SetData(dataSet);
	});
}


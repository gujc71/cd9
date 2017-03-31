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
	
// ///////////////////////////////////////////////////////////////////////////
function TableClass(target, dataset) {
	this.dataTable = d3.select("#"+target).append("table");
	var rows = this.dataTable.selectAll("tr")
		.data(dataset)
		.enter()
		.append("tr");
			
	var cells = rows.selectAll("td")
		.data(function ( d ) { return d; })
		.enter()
		.append("td")
			.text(function( d ) { return d; })
			.on("mousedown", this.tdMousedown);

	
	this.hiddenDiv = document.createElement( 'div');
	this.hiddenDiv.style.display="none";
	document.body.appendChild(this.hiddenDiv);
	this.input = document.createElement( 'input');
	this.input.type = 'text'; 
	this.input.className = 'tableInput';
	this.hiddenDiv.appendChild(this.input);
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
	if (!this.selectTD) return;
	
	var inx = this.selectTD.cellIndex;
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
			d3.select(newTD).on("mousedown", thisclass.tdMousedown())
        })
    var w = parseInt(d3.select(this.selectTD).style("width"));
    this.dataTable.style({"width": (parseInt(this.dataTable.style("width"))+w)+"px"});
}

TableClass.prototype.insertRow = function(){
	if (!this.selectTD) return;
	
	var tr = this.selectTD.parentNode;
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
	if (!this.selectTD) return;

	var tr = this.selectTD.parentNode;

	tr.parentNode.removeChild(tr); 
	this.selectTD = null;
}

TableClass.prototype.deleteColumn = function(){
	if (!this.selectTD) return;

    var w = parseInt(d3.select(this.selectTD).style("width"));
	
	var inx = this.selectTD.cellIndex;
	this.dataTable
		.selectAll("tr")
		.selectAll("td")
		.filter(function (d, i) {return i === inx;})
		.map(function(d) {
			d.parentNode.removeChild(d[0]);
        })
		
	this.selectTD = null;

    this.dataTable.style({"width": (parseInt(this.dataTable.style("width"))-w)+"px"});
}





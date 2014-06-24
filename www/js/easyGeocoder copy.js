$(document).ready(function(){
	geocoder.init({
		host : 'http://bd-lkdesktop',
		token : '3d07f91c1bfa88ed0c94c2a36dda209fa4634c4c',
		filePath : ''
	});
}); 


var filePath = '';

function initialize(){	
	document.getElementById('dropdowns').style.display = 'none';
	//document.getElementById('results').style.display = 'none';


	FMEServer.init({
		server : 'http://bd-lkdesktop',
		token : '3d07f91c1bfa88ed0c94c2a36dda209fa4634c4c'
	});

	//initialize behaviour for file upload 
	$('#fileupload').fileupload({
		url : 'http://bd-lkdesktop/fmedataupload/EasyGeocoder/GenerateSchemaElements.fmw?opt_fullpath=true',
		dropzone : $('#dropzone'),
		autoUpload : true,

		done : function(e, data){
			//when file has been uploaded, capture JSON response from FME Server
			//and use file path to run workspace
			filePath = data.result.serviceResponse.files.file[0].path;

			requestSchema(filePath);
		},

		fail : function(e, data){
			//do something if there was an error in uploading
		},

		dragover : function(e, data){
			//make dropzone prettier
			var dropZone = $('#dropzone');
			var timeout = window.dropZoneTimeout;

				if (!timeout){
					dropZone.addClass('in');
				}
				else{
					clearTimeout(timeout);
				}

				var found = false;
				var node = e.target;
				do {
					if (node == dropZone[0]){
						found = true;
						break;
					}
					node = node.parentNode;
				}
				while (node != null);
				if (found){
					dropZone.addClass('hover');
				}
				else {
					dropZone.removeClass('hover');
				}
				window.dropZoneTimeout = setTimeout(function(){
					window.dropZoneTimeout = null;
					dropZone.removeClass('in hover');
				}, 100);
		}
	});
}

function requestSchema (filePath){
	//take path to uploaded file and submit workspace to get the CSV schema
	//information for the next step in the process
	console.log("requesting schema");
	var url = 'http://bd-lkdesktop/fmedatastreaming/EasyGeocoder/GenerateSchemaElements.fmw?SourceDataset_SCHEMA=' + filePath + '&token=3d07f91c1bfa88ed0c94c2a36dda209fa4634c4c';
	$.getJSON(url)
		.done(function(result){
			//result comes back as an array of column names from the CSV
			//loop through this to populate the dropdown boxes for the 
			//next step in this geocoder
			var jsonElems = result;
			displayNextStep(result);
			var test = '';
		})
		.fail(function(textStatus){
			//there was an error
		});
}

function createComboBox(boxName, colList){
	var html = '<select id="' + boxName + '">';
	//populate selection choices
	var colCount = colList.columns.length;
	html = html + '<option value=" "> - </option>';
	for (i = 0; i< colCount; i++){
		if (i==0){
			html = html + '<option selected value="' + colList.columns[i] + '">' + colList.columns[i] + '</option>';
		} else {
			html = html + '<option value="' + colList.columns[i] + '">' + colList.columns[i] + '</option>';
		}
	}
	html = html + '</select>';
	return html;
	
}

function displayNextStep(colList){
	document.getElementById('content').style.display = 'none';
	document.getElementById('dropdowns').style.display = 'block';

	//take the list of csv columns and create a set of dropdown menus
	//to set the parameters for the next workspace
	document.getElementById("address").innerHTML = createComboBox("Address_field", colList);
	document.getElementById("city").innerHTML = createComboBox("City_field", colList);
	document.getElementById("state").innerHTML = createComboBox("StateProvince_field", colList);
	document.getElementById("postalcode").innerHTML = createComboBox("PostalCode_field", colList);
	document.getElementById("country").innerHTML = createComboBox("Country_field", colList);	
}

function downloadKML(){
	//show the download url
	var params = getParams();
	var url = 'http://bd-lkdesktop/fmedatastreaming/EasyGeocoder/CallGeocoder.fmw?' + params + '&token=3d07f91c1bfa88ed0c94c2a36dda209fa4634c4c';
	window.location = url;
	document.getElementById('dropdowns').style.display = 'none';
	document.getElementById('results').style.display = 'block';
}

function getParams(){

	//parameters needed
	//AddressAttr
	//CityAttr
	//ProvinceAttr
	//PostalCodeAttr
	//CountryAttr
	//SourceDataset
	var address = document.getElementById("Address_field").value;
	var city = document.getElementById("City_field").value;
	var province = document.getElementById("StateProvince_field").value;
	var postalcode = document.getElementById("PostalCode_field").value;
	var country = document.getElementById("Country_field").value;

	var params = 'SourceDataset=' + filePath;
	params = params + '&AddressAttr=' + address;
	params = params + '&CityAttr=' + city;
	params = params + '&ProvinceAttr=' + province;
	params = params + '&PostalCodeAttr=' + postalcode;
	params = params + '&CountryAttr=' + country;

	return params;
}




















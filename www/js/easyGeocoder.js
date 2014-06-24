$(document).ready(function(){
	
	var fileLocation = '';
	document.getElementById('dropdowns').style.display = 'none';
	document.getElementById('results').style.display = 'none';
	
	//initialize behaviour for file upload 
	$('#fileupload').fileupload({
		url : 'http://bd-lkdesktop/fmedataupload/EasyGeocoder/GenerateSchemaElements.fmw?opt_fullpath=true',
		dropzone : $('#dropzone'),
		autoUpload : true,

		done : function(e, data){
			//when file has been uploaded, capture JSON response from FME Server
			//and use file path to run workspace
			filePath = data.result.serviceResponse.files.file[0].path;

			geocoder.requestSchema(filePath);
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

	geocoder.init({
		host : 'http://bd-lkdesktop',
		token : '3d07f91c1bfa88ed0c94c2a36dda209fa4634c4c'
	});
}); 

var geocoder = (function(){

	//private
	var schemaWorkspace = 'GenerateSchemaElements.fmw';
	var geocodeWorkspace = 'CallGeocoder.fmw';
	var repository = 'EasyGeocoder';
	var host;
	var token;

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

	function getParams(){

		var address = document.getElementById("Address_field").value;
		var city = document.getElementById("City_field").value;
		var province = document.getElementById("StateProvince_field").value;
		var postalcode = document.getElementById("PostalCode_field").value;
		var country = document.getElementById("Country_field").value;

		var params = 'SourceDataset=' + fileLocation;
		params = params + '&AddressAttr=' + address;
		params = params + '&CityAttr=' + city;
		params = params + '&ProvinceAttr=' + province;
		params = params + '&PostalCodeAttr=' + postalcode;
		params = params + '&CountryAttr=' + country;

		return params;
	}


	//public methods
	return {

		init : function(params){
			var self = this;
			host = params.host;
			token = params.token;

			FMEServer.init({
				server : host,
				token : token
			});

		},

		requestSchema : function(filePath){
			fileLocation = filePath
			var params = 'SourceDataset_SCHEMA=' + filePath;
			var url = host + '/fmedatastreaming/' + repository + '/' + schemaWorkspace + '?' + params;
			FMEServer.customRequest(url, 'GET' ,displayNextStep);
		}, 

		downloadKML : function(){
			var params = getParams();
			var url = host + '/fmedatastreaming/' + repository + '/'+ geocodeWorkspace + '?' + params + '&token=' + token;
			window.location = url;
			document.getElementById('dropdowns').style.display = 'none';
			document.getElementById('results').style.display = 'block';
		}
	};

}());

























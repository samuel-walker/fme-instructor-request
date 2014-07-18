$(document).ready(function(){
	
	var fileLocation = '';
	document.getElementById('dropdowns').style.display = 'none';
	document.getElementById('mapPage').style.display = 'none';
	
	//initialize behaviour for file upload 
	$('#fileupload').fileupload({
		url : 'https://fmepedia2014-safe-software.fmecloud.com/fmedataupload/EasyGeocoder/GenerateSchemaElements.fmw?opt_fullpath=true',
		dropzone : $('#dropzone'),
		autoUpload : true,

		add: function (e, data) {
			data.submit();
    	},

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
		host : 'https://fmepedia2014-safe-software.fmecloud.com',
		token : 'fb1c3ee6828e6814c75512dd4770a02e73d913b8'
	});	

}); 

var geocoder = (function(){

	//private
	var schemaWorkspace = 'GenerateSchemaElements.fmw';
	var geocodeWorkspace = 'CallGeocoder.fmw';
	var repository = 'EasyGeocoder';
	var host;
	var token;
	var layer, map;
	var loading;

	function createComboBox(boxName, colList){
		var html = '<select id="' + boxName + '">';
		//populate selection choices
		var colCount = colList.columns.length;
		html = html + '<option selected="true" style="display:none;" value=" ">Choose a Field</option>'
		html = html + '<option value=" "> --N/A-- </option>';
		for (i = 0; i< colCount; i++){
			html = html + '<option value="' + colList.columns[i] + '">' + colList.columns[i] + '</option>';
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

	function clearDropdowns(){
		document.getElementById('address').innerHTML = '';
		document.getElementById('city').innerHTML = '';
		document.getElementById('state').innerHTML = '';
		document.getElementById('postalcode').innerHTML = '';
		document.getElementById('country').innerHTML = '';
	}

	function initGoogleMap(){
		//init google maps
		loading = new Image();
		loading.src = "libs/upload/img/loading.gif";
		loading.id = "loadingImg";
		
		//google maps init
		var mapStyles = [ {
			featureType : "all",
			elementType : "labels",
			stylers : [ { visibility : "off" } ]
		}];

		var mapOptions = {
			zoom: 3,
			center: new google.maps.LatLng( 50.355, -97.855 ),
			mapTypeId : google.maps.MapTypeId.SATELLITE,
			disableDefaultUI : true
		};

		map = new google.maps.Map( document.getElementById( "mapDiv" ), mapOptions );

		google.maps.event.addListenerOnce( map, 'idle', function() {
			map.setOptions( { styles : mapStyles } );
		    document.getElementById( "mapDiv" ).appendChild( loading );
		});
	}

	function dataLoadError(){
		//display a useful error message
		window.onerror = function(msg, url, linenumber) {
    	alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    	return true;
		}
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

		backToUpload : function(){
			clearDropdowns();
			document.getElementById('dropdowns').style.display = 'none';
			document.getElementById('content').style.display = 'block';
		},

		backToFields : function(){
			document.getElementById('mapPage').style.display = 'none';
			document.getElementById('dropdowns').style.display = 'block';
		},

		displayMap : function(){
			var params = getParams();
			var url = host + '/fmedatastreaming/' + repository + '/'+ geocodeWorkspace + '?' + params + '&token=' + token;
			
			initGoogleMap();

			loading.style.display = 'block';

			layer = new google.maps.KmlLayer( url, { 
				preserveViewport : false,
				map : map
			});

			layer.status_changed = function() {
				//console.log(layer);
				if (layer.status = 'FETCH_ERROR'){
					dataLoadError();
				}
				loading.style.display = 'none';
			};

			document.getElementById('dropdowns').style.display = 'none';
			document.getElementById('mapPage').style.display = 'block';
		}
	};

}());

























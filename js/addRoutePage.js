let map = null;
let marker;
let locationArray = [];
let index = 0;
let flightPath = null;
let greenMarker = null;
let pinkMarker = null;
let infoWindow;
let pathListArray;

// Function initMap is called from the URL in addRoute.html.
// It initialise the map and draggable marker on screen.
function initMap() 
{
    // Initialise map, centred on Monash Univeristy Malaysia's starting point
    infoWindow = new google.maps.InfoWindow;
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 3.0643616, lng: 101.6011916},
        zoom: 18
    });
        
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        position: {lat: 3.0643616, lng: 101.6011916}
    });    
    // extractData function is called
    // This function is called to retrieve data from local storage.
    // The object which is used to display on the main page is 
    // retrieved and store in a global variable.
    pathListArray = extractData("pathListArray");
}

// This function is called when add route button is pressed.
// the green marker will appear for the 1st point and 
// pink marker will be last point as the paths are keep on
// adding as well as the poly line.
function addMarker()
{
    let position = marker.getPosition();
    locationArray.push(position);
    
    //
    if (flightPath != null)
        {
            flightPath.setMap(null);
        }
    if (pinkMarker !== null)
        {
            pinkMarker.setMap(null);
        }
    if (greenMarker != null)
        {
            greenMarker.setMap(null);
        }
    
    //
    flightPath = new google.maps.Polyline({
        path: locationArray,
        strokeColor: 'black',
        strokeOpacity: 1.0,
        strokeWeight: 3,
    });
    flightPath.setMap(map);
    
    //
    greenMarker =  new google.maps.Marker({
        position: locationArray[0],
        map: map,
        icon: {url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', scaledSize: new google.maps.Size(15,20)}
    });
    
    //
    if (index > 0)
    {
        pinkMarker = new google.maps.Marker({
        position: locationArray[index],
        map: map,
        icon: {url: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png', scaledSize: new google.maps.Size(15, 20)}
        });    
    }
    ++index;        
}

// This function is used to bring the map on the screen
// to the user's location when get location button is 
// pressed.
function getLocation()
{
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            let pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
}

// This function is used to bring the draggable marker to the middle as 
// getting draggable marker to the middle button is called.
function update()
{
    marker.setPosition(map.getCenter());
}

// This fucntion is used to save the paths which is done by the user
// and saved in local storage to display in home page and bring user
// to the home page
function save()
{
    let pathClass = new Path();
    let totalDistance = null;
    let numberOfTurns = -1;
    
    if (locationArray.length < 2)
        {
            alert("There's not enough points in the path!");
        }
    else 
        {
            let title = prompt("Please enter your path title","title...");
            if (title != null)
                {
                    pathClass.title = title;
                    pathClass.locations = locationArray;
                    for (let i = 0; i < pathClass.locations.length - 1; i++)
                        {
                            numberOfTurns++;
                        }
                    pathClass.totalDistance = totalDistance;
                    pathClass.numberOfTurns = numberOfTurns;
                    pathListArray._paths[1].push(pathClass);
                    
                    // store local storage function is called.
                    storeLocalStorage("pathListArray2", pathListArray);
                    
                    location.href = "index.html";
                }
            else
                {
                    alert("Please name your path!");
                }
        }
}

// This function is used to undo the path if the user wants to.
function undo()
{
    if (flightPath != null)
        {
            flightPath.setMap(null);
        }
    if (pinkMarker != null)
        {
            pinkMarker.setMap(null);
        }
    if (greenMarker != null)
        {
            greenMarker.setMap(null);
        }

    if (index >= 0)
        {
            locationArray.pop();
            --index;
    
            greenMarker =  new google.maps.Marker({
                position: locationArray[0],
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            });
    
            if (index > 0)
            {
                pinkMarker = new google.maps.Marker({
                    position: locationArray[index],
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
                });
            }
    
            flightPath = new google.maps.Polyline({
            path: locationArray,
            strokeColor: 'black',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            });
            flightPath.setMap(map); 
        }
    if (index == -1)
        {
            ++index;
        }
}

// function to handle error from GPS.
function handleLocationError(browserHasGeolocation, infoWindow, pos) 
{
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
}

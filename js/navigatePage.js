let map = null;
let pathList = null;
let pathForGPS = new Path();
let flightPlanCoordinates = [];
let flightPath = '';
let destinationMarker = null;
let pos = null;
let infoWindow = null;
let currentLocationArr = [];
let userMarker = null;
let circle = null;
let fixedAccuracy = 30;
let options = {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0
    };
let shortenDist, remainingDist, averageDis;
let currentLat = null; 
let currentLng = null;
let previousLat = null;
let previousLng = null;
let compassHeading;
let accuracyWarning = 0;
let navigationIndex = 0;
let beginning = null;
let index = 0;


// To be display on html
let speedDisplay = document.getElementById("speed");
let remainDistDisplay = document.getElementById("dist");
let distanceTravellRef = document.getElementById("distTravelled");
let estTime = document.getElementById("timeEst");
let directionImg = document.getElementById("img")
let nextDirection = document.getElementById("nextAction");
let snackBarRef = document.getElementById("snackbar");

//Setting starting point and destination point in Path Class instance
pathForGPS.startingPoint = pathForGPS.locations[0];
pathForGPS.destination = pathForGPS.locations[pathForGPS.locations.length - 1];

console.log(pathForGPS.locations);

// This function is to initialise the map and to retrieve data from the
// local storage.
function initMap() 
{
            // Store the details about locations and title 
            // in Path Class instance's private attribute
            let array = extractData("pathList");
            let pathServerOrUser = array[0];
            let pathIndex = array[1];
            
    
            let pathListObject = extractData("pathListArray");
            console.log(pathListObject._paths[pathServerOrUser][pathIndex]);
            // The Path instance is initialised from the object.
            pathForGPS.initialisePathPDO(pathListObject._paths[pathServerOrUser][pathIndex]);
            
            // Initialise map, centred on Monash Univeristy Malaysia's starting point
            map = new google.maps.Map(document.getElementById('map'), {
                center: pathForGPS.startingPoint,
                zoom: 18
            });
            
            // Polyline is displayed on the map.
            flightPath = new google.maps.Polyline({
                path: pathForGPS.locations,
                geodesic: true,
                strokeColor: '#FFA500',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(map);
    
            // Marker for destination is displayed on map 
            destinationMarker = new google.maps.Marker({
                position: pathForGPS.destination,
                map: map            
            });
    
            // Each waypoint is marked
            for (let i = 0; i < pathForGPS.locations.length; i++)
	           {
	               let testmarker1 = new google.maps.Marker({
                    position: pathForGPS.locations[i],
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 1.5,
                        fillColor: '#40E0D0',
                        fillOpacity: 0.8,
                        strokeColor: '#40E0D0',
                        strokeWeight: 15
                            }
                    });
	           }
            // Call the currentLocation function in shared.js
            currentLocation();
}

//This function has watchPosition function will constantly update when the app is tracking the user's current location.
function currentLocation()
{
    // InfoWindow to display popup window above the map
    infoWindow = new google.maps.InfoWindow;
    if (navigator.geolocation)
    {
       navigator.geolocation.watchPosition(userLocation, error, options);
    }
    else 
    {
       alert( "Geolocation is not supported by this browser");
    }  
}

/* This function is to:
1. Track user's current location
2. Checks accuracy before the user's start to walk
3. Check for remaining distance and distance travelled
4. Check for estimate time left to destination
5. Check for next direction should taken by user
6. Check for average speed of user
*/
function userLocation(position)
{
    let distanceTravelled, distanceToWaypoint, speed, accuracy, time, ETA, currentTime, timeDiff;

    // Call takeNStoreCurrentPos function to store the user's
    // position into an array each time function calls
    takeNStoreCurrentPos(position);    
    
    console.log(currentLocationArr);
    
    //increment of 1 everytime the function calls.
    ++index;
    
    // Taking accuracy 
    accuracy = position.coords.accuracy; 
    
    // Collects the timestamp
    time = position.timestamp/1000;
    
    // Takes user's heading
    compassHeading = position.coords.heading;
    
    // User's position will be at the center of the map
    map.panTo(currentLocationArr[index]);

    // Call the displayMarker function to display user's accuracy and heading
    displayMarker(position, index, accuracy);
    
    // If user's accuracy is more than 30, notify the user to his/her position until below or equal to 20
    if (accuracyWarning == 0 )
        {
            snackBarRef.innerHTML = 'Accuracy above 20 m, please wait patiently, it will take a short while';
            snackBar();
            accuracyWarning = 1;
        }

    // If user's accuracy less than or equal to 20 and not located at the destination
    // Proceed to get data that need to display by the app
    if ((currentLat !== null) && (navigationIndex < pathForGPS.locations.length) && (accuracy < fixedAccuracy))
    { 
       // Notify user has reached desired accuracy
       if (accuracy < fixedAccuracy && accuracyWarning == 1)
           {
                snackBarRef.innerHTML = 'Accuracy has reached desired value!';
                snackBar();
               
                accuracyWarning = 2;
           }

        // current position
        let current_Coord = [currentLocationArr[index].lat, currentLocationArr[index].lng];
        let previous_Coord = [currentLocationArr[index-1].lat, currentLocationArr[index - 1].lng];
        distanceTravelled = pathForGPS.calcDistance(current_Coord, previous_Coord);

        // calculate the distance between current position and the waypoint
        let waypointCoord = [pathForGPS.locations[navigationIndex].lat, pathForGPS.locations[navigationIndex].lng];
        distanceToWaypoint = pathForGPS.calcDistance(current_Coord, waypointCoord);

        // calculate the heading between current position and waypoint
        locationHeading = pathForGPS.computerHeading(current_Coord, navigationIndex);
    
        // Use's marker is set following the current position
        userMarker.setPosition(currentLocationArr[index]);
        
        //difference between waypoint's heading and user's heading, calculated to determine user's next direction to go
        deltaHeading = locationHeading - compassHeading;
        
        // Calculating remaining distance:
        // If user hasn't reach first waypoint distance remaining equal to addition of 
        // distance of the whole path and distance between user and the first waypoint
        // If user had reach the first waypoint, a for loop is use to calculate the 
        // distance of the next waypoint and the remaining path and stored in shortenedDist.
        // Addition of shortenedDist and distance between user's current position and 
        // next way point will be the remaining distance.
        if (navigationIndex == 0)
            {
                // the total distance of the path from the 1st waypoint to destination and
                // from the user to 1st waypoint
                remainingDist = distanceToWaypoint + Number(pathForGPS.totalDistance);
                shortenedDist = null; 
                remainingDist = remainingDist.toFixed(2);                
                remainDistDisplay.innerHTML = "Distance remain: " + remainingDist + "m";
            }
        else 
            {
                // After reaching 1st waypoint. The distance is calculated from next waypoint 
                // to the destination and from user to next waypoint
                for(let i = navigationIndex; i < pathForGPS.locations.length - 1; i++)
                {
                    let coord_1 = [pathForGPS.locations[i].lat, pathForGPS.locations[i].lng];
                    let coord_2 = [pathForGPS.locations[i + 1].lat, pathForGPS.locations[i + 1].lng];
                    shortenedDist += pathForGPS.calcDistance(coord_1, coord_2);
                }
                remainingDist = distanceToWaypoint + shortenedDist;
                remainingDist = Number.parseFloat(remainingDist).toFixed(2);
                remainDistDisplay.innerHTML = "Distance remain: " + remainingDist + "m";
                shortenedDist = 0;
            }
        
        // This part is used to calculate Average Speed and Estimated Arrival Time each time function calls
        if (beginning == null)
        {
            beginning = time;
            averageDis = 0; // intialisatise value
            speed = 0;
            speedDisplay.innerHTML = "Average speed: " + speed.toFixed(2) + "m/s";
            ETA = "N/A"; 
            estTime.innerHTML = "Est Time Arrival: " + ETA; 
            averageDis = null;
        }
        
        else
        {
            currentTime = time;
            timeDiff = currentTime - beginning;
            averageDis += distanceTravelled;
            speed = pathForGPS.aveSpeed(timeDiff, averageDis);
            distanceTravellRef.innerHTML = "Distance travelled: " + averageDis.toFixed(2) + "m";
            speedDisplay.innerHTML = "Average speed: " + speed.toFixed(2) + "m/s";
            ETA = remainingDist/speed; 
            estTime.innerHTML =  "Est Time Arrival: " + ETA.toFixed(2) + "s";
        }  

        // Call the direction function to show the direction to the user to 
        // the target waypoint by taking the bearing into account.
        showDirection();
        
        // Call waypoint function to determine if user has reached the next waypoint or not
        waypoint(accuracy, distanceToWaypoint);
    }    
}

// This function is to take and store the current position into an array.
function takeNStoreCurrentPos(position)
{
    // taking user's coordinate
    if (currentLat == null)
        {    
            currentLat = position.coords.latitude ;
            currentLng = position.coords.longitude ;
        }
    else
        {
            previousLat = currentLat ;
            previousLng = currentLng ;
            currentLat = position.coords.latitude ;
            currentLng = position.coords.longitude ;
        }
    // Storing a history of the user's movement as an array of latitudes and longitudes
    if (index == 0)
        {
            currentLocationArr.push({lat: currentLat, lng: currentLng});
        }
    currentLocationArr.push({lat: currentLat, lng: currentLng}); 

}

// This function is to display the marker whenever the watchPosition
// function calls. The marker will constantly change according to
// user's position
function displayMarker(position, index, accuracy)
{
    let strokeColour, fillColour;
    
    if (userMarker!==null)
        {
              userMarker.setMap(null);
        }
  
            userMarker = new google.maps.Marker({
                position: currentLocationArr[index],
                map: map,
                
            icon:{
                    path:google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 7,
                    fillColor: '#0000FF',
                    fillOpacity: 0.8,
                    strokeColor: '#000000',
                    strokeWeight: 3,
                    rotation: position.coords.heading,
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 2)
                }}
                );
    // Setting accuracy's colour according to the radius
    if (accuracy < fixedAccuracy)
        {
            strokeColour = '#8A2BE2';
            fillColour = '#8A2BE2';         
        }
    else
        {
            strokeColour = 'red';
            fillColour = 'red';
        }

    // Display location's accuracy 
        if (circle!==null)
            {
                circle.setMap(null);
            }
                     
            circle = new google.maps.Circle({
                strokeColor: strokeColour,
                strokeOpacity: 0.7,
                strokeWeight: 2,
                fillColor: fillColour,
                fillOpacity: 0.2,
                center: currentLocationArr[index],
                map: map,
                radius: position.coords.accuracy,
            });
}

// This function is to calculate the bearing between the user and the waypoint
// and will be displayed on screen for next direction.
function showDirection()
{
    let stringDirection = "Direction: ";
    // Correction for deltaHeading for determining the user's direction heading to. 
    if (deltaHeading > 180)
        {
            deltaHeading = -360 + deltaHeading;
        }
    else if (deltaHeading < -180)
        {
            deltaHeading = 360 + deltaHeading;
        }
    
    // Using deltaHeading which is the degree between the user and the target waypoin to determine the direction.
    if (deltaHeading >= -10 && deltaHeading <= 10)
        {
            directionImg.src = "images/straight.svg"
            nextDirection.innerHTML = stringDirection + "Go straight";
        }
    else if (deltaHeading > 10 && deltaHeading <=30)
        {
            directionImg.src = "images/slight_right.svg"
            nextDirection.innerHTML = stringDirection + "Slightly to the right";
        }
    else if (deltaHeading > 30 && deltaHeading <= 120)
        {
            directionImg.src = "images/right.svg"
            nextDirection.innerHTML = stringDirection + "Turn right";
        }
    else if ((deltaHeading > 120 && deltaHeading <= 180) || (deltaHeading > -180 && deltaHeading <= -120))
        {
            directionImg.src = "images/uturn.svg"
            nextDirection.innerHTML = stringDirection + "U-turn";
        }
    else if (deltaHeading > -120 && deltaHeading <= -30)
        {
            directionImg.src = "images/left.svg"
            nextDirection.innerHTML = stringDirection + "Turn left";
        }
    else if (deltaHeading > -30 && deltaHeading < -10)
        {
            directionImg.src = "images/slight_left"
            nextDirection.innerHTML = stringDirection + "Slightly to the left";
        }
}

// This function is to notify user whether the user has reached
// the destination or reached a waypoint
function waypoint(accuracy, distanceToWaypoint)
{
    if (distanceToWaypoint < accuracy)
        {
            navigationIndex++;

            snackBarRef.innerHTML = "Waypoint checked!"
            snackBar();
            
        }
    if (navigationIndex == pathForGPS.locations.length)
        {
            snackBarRef.innerHTML = "You have reached your destination!"
            snackBar();
        }
}

// This function is responsible for showing the "pop Up message"
function snackBar() {
    snackBarRef.className = "show";
    setTimeout(function(){ snackBarRef.className = snackBarRef.className.replace("show", ""); }, 3000);
}


// A infowindow will show up to notify you.
function handleLocationError(browserHasGeolocation, infoWindow, pos)
{
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// Function to handle location error when GPS is disable or blocked. 
// Alert will notify user.
function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
    alert("The current position could not be found!");
}


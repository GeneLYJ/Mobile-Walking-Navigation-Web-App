// This function is to call jsponRequest function to contact the Campus
// Nav web service with specific campus name and with a call back function 
// of "getDataFromWebServer" when it is called when the Google API URL is
// called in index.html. 
function initMap()
{
    
    let data = {
    campus: "sunway",
    callback: "getDataFromWebServer"
    };
    
    //execute jsonpRequest function
    jsonpRequest("https://eng1003.monash/api/campusnav/", data);
}

// This function take in the url and the data object and convert it to 
// an URL to contact the Campus Nav web service and will call the
// "getDataFromWebServer" function.
function jsonpRequest(url, data)
{
    // contact navigation web service
    // Build URL parameters from data object.
    let params = "";
    // For each key in data object...
    for (let key in data)
    {
        if (data.hasOwnProperty(key))
        {
            if (params.length == 0)
            {
                // First parameter starts with '?'
                params += "?";
            }
            else
            {
                // Subsequent parameter separated by '&'
                params += "&";
            }

            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);

            params += encodedKey + "=" + encodedValue;
         }
    }
    let script = document.createElement('script');
    script.src = url + params;
    document.body.appendChild(script);
}

// This function receive an array of paths from the server and to
// serialise the array and to stores JSON string to the local Storage 
// with a name.
function getDataFromWebServer(pathData)
{
    console.log(pathData);
    // create arrays to allow path instances to be pushed into these arrays
    let pathServerArr = [];
    let pathUserArr = [];
    let totalDistance;
    let numberOfTurns = 0;
    
    // Calculate the distance for each path given by the server
    for (let i = 0; i < pathData.length; i++)
        {
            let index = i;
            // create path instance for each of the paths in the array    
            let pathInstance = new Path();
            let distanceCalculated = 0;
            let TurnsCalculated = 0;
            
            // Saving the path's title and all waypoints into the path instance
            pathInstance.title = pathData[i].title;
            pathInstance.locations = pathData[i].locations;

            // This function is called to calculate the distance for each waypoint in a path
            for (let j = 0; j < pathData[index].locations.length - 1; j++)
                        {
                            let coord_1 = [pathData[index].locations[j].lat, pathData[index].locations[j].lng];
                            let coord_2 = [pathData[index].locations[j+1].lat, pathData[index].locations[j+1].lng];
                            distanceCalculated += pathInstance.calcDistance(coord_1, coord_2);
                            numberOfTurns++;
                        }
            totalDistance = distanceCalculated.toFixed(2);
            pathInstance.totalDistance = totalDistance;
            pathInstance.numberOfTurns = numberOfTurns - 1;
            pathServerArr.push(pathInstance);
        }
    
    // extractData function is called to load the paths which is 
    // from User if it exist in the local storage. 
    pathUserArr = extractData("pathListArray2");
    
    console.log(pathServerArr);
    // create a pathList instance and assign value of "server" and "user" 
    // into private attribute pathType
    let pathListInstance = new PathList();
    pathListInstance.pathType = ["Server","User"];
    
    // assign the array of path instance as the value of private attribute
    // (paths) of pathList Instance
    pathListInstance.paths = [pathServerArr,pathUserArr];
    
    let pathListArr = pathListInstance;
    console.log(pathListArr);
    // store the pathListArr into local storage
    storeLocalStorage("pathListArray",pathListArr);
    // call the retreiveDataAndDisplay
    retreiveDataAndDisplay();
}

// This function is to retrieve the paths from the Local Storage as JSON
// and is parsed into arrays of objects. The paths' title and summaries 
// are display on the home page screen.
function retreiveDataAndDisplay()
{
    let outputTitleRef = document.getElementById("pathList");
    let pathListInstance = new PathList();
    let pathClassInstance = new Path();
    let outputTle = "";                                                                        

    // getItem and display data into index.html
    if (typeof(Storage) !== "undefined")
        {
            // array of paths is retrieve and parsed.
            let pathGetFromLS = localStorage.getItem("pathListArray");
            // pathObject is an array which contains paths and pathTypes. 
            // The paths is an array with Server's paths and User's paths 
            // and pathTypes is an array contains string. Both Server's 
            // paths and User's paths are arrays contains paths.
            let pathObject = JSON.parse(pathGetFromLS);
            console.log(pathObject._paths[0]);
            
            // Reinitialises PathList instance from a public-data object.
            pathListInstance.initialisePathListPDO(pathObject._paths);
            console.log(pathListInstance.paths[0][0]);
            
            // To display each path in the PathList instance on the screen.
            for (let j = 0; j < pathListInstance.paths.length; j++)
                {            
                    for (let i = 0; i < pathListInstance.paths[j].length; i++)
                        {
                            let pathServer = new Path();
                            pathServer.initialisePathPDO(pathListInstance.paths[j][i])               
                                        
                            //Add the info that want to display into output everytime the loop retrieving the run
                            outputTle += "<div class=\"displayFont\" onclick=\"viewPath(" + j + "," + i + ");\"></br>" + pathServer.title + "</br>Distance: " + pathServer.totalDistance + "</br>Number of turns: " + pathServer.numberOfTurns + "</br>" + "</div>";                    
                        }
                    if (j < 1)
                        {
                            outputTle += "<div class=\"displayFont\"><h4>User</h4></div>";
                        }
                }
            // display paths information in multiple rows'   
            outputTitleRef.innerHTML = outputTle;
        }
}

// This function is too retrieve user's path (if there is) 
// from the local storage and to store in an array
function extractData()
{
    let pathUserArray = [];
    
    if (typeof(Storage) !== "undefined")
    {
        let pathList = JSON.parse(localStorage.getItem("pathListArray2"));

        if(pathList != null)
            {
                for (let k = 0; k < pathList._paths[1].length; k++)
                {
                    let pathClassInstance = new Path();
                    let distance = 0;
                    pathClassInstance.initialisePathPDO(pathList._paths[1][k]);
                    if (pathClassInstance.totalDistance == null)
                        {
                            for (let i = 0; i < pathClassInstance.locations.length - 1; i++)
                                {
                                    let coord_1 = [pathClassInstance.locations[i].lat, pathClassInstance.locations[i].lng];
                                    let coord_2 = [pathClassInstance.locations[i+1].lat,  pathClassInstance.locations[i+1].lng];
                                    distance += pathClassInstance.calcDistance(coord_1, coord_2);
                                }
                            pathClassInstance.totalDistance = distance.toFixed(2);
                        }
                    pathUserArray.push(pathClassInstance);
                }
            }            
    }
    return pathUserArray;
}

// This function will bring the user screen to navigate when 
// the path is clicked on screen.
function viewPath(i, j)
{
    console.log(j);
    storeLocalStorage("pathList", [i, j]);
    // direct to the navigation page
    location.href = "navigate.html";
}

// This function will bring the user to add their routes when
// the add route button is clicked.
function addRoute()
{
    location.href = "addRoute.html";
}


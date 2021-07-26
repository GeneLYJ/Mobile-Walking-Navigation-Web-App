// Path class that contains private attributes, 
// public methods, setters and getters
class Path
{
    // Constructory
    constructor()
    {
        // Private attributes: locations arrys, path title, starting waypoint,
        // destination, total distance, starting time and number of turns.
        this._locationSet = [];
        this._titlePath = null;
        this._startingPoint = null;
        this._destination = null;
        this._totalDistance = null;
        this._timeBegin = null;
        this._numberOfTurns = null;
    }
    // Setters
    set locations(array)
    {
        this._locationSet = array;
    }
    
    set title(titlePath)
    {
        this._titlePath = titlePath;
    }
    
    set startingPoint(coordinate)
    {
        this._startingPoint =  coordinate;
    }
    
    set destination(coordinate)
    {
        this._destination = coordinate; 
    }
    
    set totalDistance(distance)
    {
        this._totalDistance = distance;
    }
    
    set timeBegin(time)
    {
        this._timeBegin = time;
    }
    
    set numberOfTurns(turns)
    {
        this._numberOfTurns = turns;
    }
    // Public Method
    // Method to calculate distance between two points using computeDistanceBetween
    // function.
    calcDistance(coord_1, coord_2)
    {   
        let lat1 = new google.maps.LatLng(coord_1[0], coord_1[1]);
        let lat2 = new google.maps.LatLng(coord_2[0], coord_2[1]);
        return google.maps.geometry.spherical.computeDistanceBetween(lat1, lat2);
    }
    // Method to calculate average speed.
    aveSpeed(timeDiff, distance)
    {
        return distance/timeDiff;
    }
    // Mehtod to compute heading betwwen two points.
    computerHeading(LatLng, index)
    {
        let lat2 = new google.maps.LatLng(this._locationSet[index].lat, this._locationSet[index].lng);
        let lat1 = new google.maps.LatLng(LatLng[0], LatLng[1]);
        
        return google.maps.geometry.spherical.computeHeading(lat1, lat2);
    }
    
    //To initialise Path object.
    initialisePathPDO(pathObject)
    {
        console.log(pathObject);
        this._titlePath = pathObject._titlePath;
        this._locationSet = pathObject._locationSet;
        this._totalDistance = pathObject._totalDistance;
        this._numberOfTurns = pathObject._numberOfTurns;
    }
    
    // Getters
    get locations()
    {
        return this._locationSet;
    }
    
    get title()
    {
        return this._titlePath;
    }
    
    get startingPoint()
    {
        return this._startingPoint;
    }
    
    get destination()
    {
        return this._destination;
    }
    
    get totalDistance()
    {
        return this._totalDistance;
    }
    
    get timeBegin()
    {
        return this._timeBegin;
    }
    
    get numberOfTurns()
    {
        return this._numberOfTurns;
    }
}

// PathList class to store arrays of paths and type of paths in private attributes.
class PathList
{
    constructor()
    {
        this._paths = [];
        this._pathType = [];
    }
    
    // To initialise the PathList object with a Path class for each path.
    initialisePathListPDO(pathListObject)
    {
        this._paths = [[], []];
        this._pathType = ["Server","User"];
        for (let j = 0; j < pathListObject.length; j++)
            {
                for (let i = 0; i < pathListObject[j].length; i++) 
                    {
                        let pathInstance = new Path();
                        pathInstance.initialisePathPDO(pathListObject[j][i])   
                        this._paths[j].push(pathInstance);
                    }

            }
    }
    
    //setters
    set paths(array)
    {
        this._paths = array;
    }
    
    set pathType(array)
    {
        this._pathType = array;
    }
    
    //getters
    get paths()
    {
        return this._paths;
    }
    
    get pathType()
    {
        return this._pathType;
    }
}

// Function that is used to stringify variables to JSON string and store 
// in local storage.
function storeLocalStorage(STORAGE_KEY,pathWeb)
{
    if (typeof(Storage) !== "undefined")
                {
                    // TODO: Stringify  to a JSON string
                    let PathToBeStore = JSON.stringify(pathWeb);
                    // TODO: store this JSON string to local storage
                    //       using the key STORAGE_KEY.
                    localStorage.setItem(STORAGE_KEY,PathToBeStore);
                }
                else
                {
                    console.log("Error: localStorage is not supported by current browser.");
                }
    
                // Now clear memory.
                PathToBeStore = null;
}

// This function take string variable and retrieve desire
// key in local storage and return parse object.
function extractData(string)
{
    if (typeof(Storage) !== "undefined")
    {
        // retrieved and parsed
        return JSON.parse(localStorage.getItem(string));
    }
    else 
    {
        alert("no local storage!");
    }
}


document.getElementById('updateLocationForm').addEventListener('submit', async function(e) {
  // Using Ajax to update 
    e.preventDefault(); // Prevent the default form submission

    await validateEntries(); // Validate the entries
    
    const formData = new FormData(this); // Get form data
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/UpdateUserLocation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            initMap();
        } 
    })
    .catch(error => console.error('Error:', error));
});
document.querySelector("#state").addEventListener("change", populateStates)
let statesPopulated = false;
async function populateStates() {
  if (statesPopulated) return;
  statesPopulated = true;
  let url = "/States/US"
  let statesResponse = await fetch(url);
  let statesData = await statesResponse.json();
  document.querySelector("#state").innerHTML += `<option value="">select state</option>`;
  for (let s of statesData) {
    let option = document.createElement("option");
    option.id = s.state_name;
    option.value = s.state_name;
    option.textContent = s.state_name;
    // removes places that are not states
    if(s.state_name == "Ramey" || s.state_name == "Trimble" || s.state_name == "Sublimity" || s.state_name == "Ontario" || s.state_name == "District of Columbia"){
      option.style.display = "none";
    }
    document.querySelector("#state").appendChild(option);
  }
}
populateStates();
// Retreives the encrypted key from the backend 
async function RetriveGoogleApi() {
  let url = "/googleAPI"
  let response = await fetch(url);
  let data = await response.json();
  return data.key;
}
// Catches the api key and allows the google map to be used
async function loadGoogleMap(){
  const apiKey = await RetriveGoogleApi();
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
  key: apiKey,// will add the key when moving this code to the backend 
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});
  
}

let map;
// loads the map and loads it up to date
async function initMap() {
  await loadGoogleMap();
  const locationResults = await MapPing();
  if (!locationResults) {
    console.error("Failed to get location results");
    return;
  }
  const position = { lat: locationResults.lat, lng: locationResults.lng };

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at the location
  map = new Map(document.getElementById("map"), {
    zoom: 16,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at the location
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Location",
  });
}
initMap();

async function validateShippingAddress(address) {
  await loadGoogleMap();
  const { Geocoder } = await google.maps.importLibrary("geocoding");
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: address, componentRestrictions: { country: 'US' } }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        const formattedAddress = results[0].formatted_address;
        const location = results[0].geometry.location;
        resolve({ isValid: true, formattedAddress, location });
      } else {
        resolve({ isValid: false });
      }
    });
  });
}

async function MapPing() {
 
  let address = document.querySelector("input[name=Address]").value;
  let city = document.querySelector("input[name=City]").value;
  let state = document.querySelector("#state").value;
  let ConvertStateAbreviation = await abbrState(state, 'abbr')
  let zip = document.querySelector("input[name=ZipCode]").value;
  const userAddress = `${address}, ${city}, ${ConvertStateAbreviation} ${zip}, USA`;
  const validationResponse = await validateShippingAddress(userAddress);
  if (validationResponse.isValid) {
    const GoogleAddress = validationResponse.formattedAddress;
    const CorrectAddress = await func.formatStreetAddress(userAddress)
    let SimilarPercent = Math.round(await similarity(GoogleAddress,CorrectAddress)*10000)/100;
    if ( SimilarPercent > 91 ){
      const location = validationResponse.location;
      document.querySelector("#ValidLocation").innerHTML = '';
      return { lat: location.lat(), lng: location.lng() };
    }else{
      document.querySelector("#ValidLocation").innerHTML = 'Please check location credentials';
      document.querySelector("#ValidLocation").style.color = "red"
      return false;
    }    
    }
}
async function validateEntries(event) {
    let error = false;
    let address = document.querySelector("input[name=Address]").value
    let city = document.querySelector("input[name=City]").value
    let state = document.querySelector("#state").value
    let zip = document.querySelector("input[name=ZipCode]").value
   
  // validation for address
  
   if (!address) {
    document.querySelector("#AddressError").innerHTML = "Please enter your address"
    document.querySelector("#AddressError").style.color = "red"
    error = true;
  } else if (address.length > 255) {
      document.querySelector("#AddressError").innerHTML = "Your address is too long"
      document.querySelector("#AddressError").style.color = "red"
      error = true;
    }else{
      document.querySelector("#AddressError").innerHTML = "";
    }
  //validation for city
    if (!city) {
    document.querySelector("#CityError").innerHTML = "Please enter your city"
    document.querySelector("#CityError").style.color = "red"
    error = true;
  } else if (city.length > 28) {
      document.querySelector("#CityError").innerHTML = "Your city is too long, only 28 characters allowed"
      document.querySelector("#CityError").style.color = "red"
      error = true;
    }else if(city){
    let cityregex = /^[a-zA-Z\u0080-\u024F]+(?:([\ \-\']|(\.\ ))[a-zA-Z\u0080-\u024F]+)*$/;
    if (!cityregex.test(city)){
      document.querySelector("#CityError").innerHTML = "Please enter a valid city"
      document.querySelector("#CityError").style.color = "red"
      error = true;
    }else{
      document.querySelector("#CityError").innerHTML = "";

    }
    }
  //validation for state
  
   if (!state) {
    document.querySelector("#StateError").innerHTML = "Please enter your state"
    document.querySelector("#StateError").style.color = "red"
    error = true;
  } else{
      document.querySelector("#StateError").innerHTML = ("");

  }

  //validation for zip
  
    if (!zip) {
    document.querySelector("#ZipCodeError").innerHTML = "Please enter your zipcode"
    document.querySelector("#ZipCodeError").style.color = "red"
    error = true;
  } else if (zip) {
      let Zipregex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    if(!Zipregex.test(zip)){
      document.querySelector("#ZipCodeError").innerHTML = "Please enter a valid zipcode"
      document.querySelector("#ZipCodeError").style.color = "red"
      error = true;
    }else{
      document.querySelector("#ZipCodeError").innerHTML = ("");

    }
    }
    const locationResults = await MapPing();
    if(locationResults == false){
      error = true;
    }
}
//converts the state name to its abreviation
async function abbrState(input, to){

    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }    
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }    
    }
}

async function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  
  return (longerLength - await editDistance(longer, shorter)) / parseFloat(longerLength);
}

async function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
var func = {}
func.toTitleCase = async function(str) {
  if(typeof(str) === 'undefined')
    return
  return str.toLowerCase().replace(/(?:^|\s|\/|\-)\w/g, function(match) { 
    return match.toUpperCase();  
  })
}
func.formatStreetAddress = async function(address) {
    address = address.replace(/[.,]/g, '')
    var replaceWords = {
        'apartment': '#',
        'apt': '#',
        'expressway': 'Expy',
        'po box': '#',
        'suite': '#',
        'ste': '#',
        'avenue': 'Ave',
        'boulevard': 'Blvd',
        'circle': 'Cir',
        'court': 'Ct',
        'crt': 'Ct',
        'drive': 'Dr',
        'lane': 'Ln',
        'mount': 'Mt',
        'highway': 'Hwy',
        'parkway': 'Pkwy',
        'place': 'Pl',
        'street': 'St',
        'east': 'E',
        'west': 'W',
        'south': 'S',
        'north': 'N',
        'road': 'Rd'
      },
    formatted_address = []
    address.split(' ').forEach(function(word) {
      word = word.toLowerCase().trim()
      if(replaceWords[word]) {
        formatted_address.push(replaceWords[word])
        return
      }
      formatted_address.push(word)
    })
    formatted_address = formatted_address.join(' ')
    formatted_address = formatted_address.replace(/\# /g, '#')
    return func.toTitleCase(formatted_address)
}

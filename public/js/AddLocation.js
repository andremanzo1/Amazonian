document.querySelector("form").addEventListener("submit", validateEntries)
document.querySelector("#state").addEventListener("change", populateStates)
document.querySelector("form").addEventListener("change", MapPing)
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
    zoom: 4,
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
  let zip = document.querySelector("input[name=ZipCode]").value;

  const userAddress = `${address}, ${city}, ${state}, ${zip}`;
  const validationResponse = await validateShippingAddress(userAddress);

  if (validationResponse.isValid) {
    const location = validationResponse.location;
    return { lat: location.lat(), lng: location.lng() };
  } else {
    console.log('Invalid address');
    return null;
  }
}

async function validateEntries(event) {

    let error = false;
    let address = document.querySelector("input[name=Address]").value
    let city = document.querySelector("input[name=City]").value
    let state = document.querySelector("#state").value
    let zip = document.querySelector("input[name=ZipCode]").value
    error = false;
   event.preventDefault();

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
    if (error) {
      event.preventDefault()
    }else{
      event.target.submit();
    }
    error = false;
}

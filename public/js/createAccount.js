document.querySelector("form").addEventListener("submit", validation)
async function displayRandomBackground() {
  let url = `https://api.unsplash.com/photos/random/?client_id=UmG_IJB6rHWGjQYr8-DsaDQlUDAUQImkoxT218vZ5mY&featured=true&query=rainforest&orientation=landscape`
  let response = await fetch(url)
  let data = await response.json()
  let body = document.querySelector("body")
  body.style.backgroundImage = `url(${data.urls.full})`;
  body.style.color = "white";
}
displayRandomBackground();
async function validation(event) {
 
    let error = false;
    let user = document.querySelector("input[name=UserName]").value
    let fname = document.querySelector("input[name=FirstName]").value
    let lname = document.querySelector("input[name=LastName]").value
    let email = document.querySelector("input[name=Email]").value
    let pass = document.querySelector("input[name=Password]").value
    let phone = document.querySelector("input[name=Phone]").value
    error = false;
   event.preventDefault();
  if (!user) {
    document.querySelector("#error").innerHTML = "Please enter a username"
    document.querySelector("#error").style.color = "red"
    error = true;
  } else if (user.length > 15) {
      document.querySelector("#error").innerHTML = "Your username is too long"
      document.querySelector("#error").style.color = "red"
      error = true;
    }else{
    const response = await fetch(`/checkUsername?UserName=${encodeURIComponent(user)}`);
    const data = await response.json();
    
    if (data.exists) {
        document.querySelector("#error").innerHTML = "This username is already taken";
        document.querySelector("#error").style.color = "red";
        error = true;
    }else{
       document.querySelector("#error").innerHTML = "";
    }
    }
  //validating first name
  if(!fname) {
    document.querySelector("#error2").innerHTML = "Please enter your first name"
    document.querySelector("#error2").style.color = "red"
    error = true;
  } else if (fname.length > 50) {
      document.querySelector("#error2").innerHTML = "Your first name is too long"
      document.querySelector("#error2").style.color = "red"
      error = true;
    }else{
    document.querySelector("#error2").innerHTML = "";
    }

// validation for last name
  if (!lname) {
    document.querySelector("#error3").innerHTML = "Please enter your last name"
    document.querySelector("#error3").style.color = "red"
    error = true;
  } else if (lname.length > 50) {
      document.querySelector("#error3").innerHTML = "Your last name is too long"
      document.querySelector("#error3").style.color = "red"
      error = true;
    }else{
      document.querySelector("#error3").innerHTML = "";
    }

  // come back to this 
  if (!email) {

    document.querySelector("#error4").innerHTML = "Please enter your email"
    document.querySelector("#error4").style.color = "red"
    error = true;
  } else if (email.length > 100) {
      document.querySelector("#error4").innerHTML = "Your email is too long"
      document.querySelector("#error4").style.color = "red"
      error = true;
    }else if(email){
      let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!emailRegex.test(email)) {
        document.querySelector("#error4").innerHTML = "Please enter a valid email"
        document.querySelector("#error4").style.color = "red"
        error = true;
      }else{
      document.querySelector("#error4").innerHTML = "";
      
    }
    }
  //validation for password
  if (!pass) {
    document.querySelector("#error5").innerHTML = "Please enter a password"
    document.querySelector("#error5").style.color = "red"
    error = true;
  }else{
    document.querySelector("#error5").innerHTML = "";
  }
  //else if (pass) {
    // let passregex = /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/;
   // if(!passregex.test(pass)){
    //  document.querySelector("#error5").innerHTML = " 2 uppercase, one special case, two digits, and three lowercase letters"
   //   document.querySelector("#error5").style.color = "red"
   //   error = true;
   // }else{
    //  document.querySelector("#error5").innerHTML = "";
    //}
      
    //}

 
  
  //validation for phone
  if (!phone) {
    document.querySelector("#error11").innerHTML = "Please enter your phone number"
    document.querySelector("#error11").style.color = "red"
    error = true;
  } else if (phone) {
    let phoneregex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
     if(!phoneregex.test(phone)){
       document.querySelector("#error11").innerHTML = "Please enter a valid phone number"
       document.querySelector("#error11").style.color = "red"
       error = true;
     } else{
      document.querySelector("#error11").innerHTML = ("");
      
    } 
    }
  
    if (error) {
      event.preventDefault()
    }else{
      event.target.submit();
    }
    error = false;
}
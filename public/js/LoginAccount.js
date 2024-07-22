document.querySelector("form").addEventListener("submit", validation)
async function validation(event) {

    let error = false;
    let user = document.querySelector("input[name=UserName]").value
    let pass = document.querySelector("input[name=Password]").value
    error = false;
   event.preventDefault();
  if (!user) {
    document.querySelector("#errorUser").innerHTML = "Please enter a username"
    document.querySelector("#errorUser").style.color = "red"
    error = true;
  }else{
    const response = await fetch(`/checkUsername?UserName=${encodeURIComponent(user)}`);
    const data = await response.json();
    const checkPassword = await fetch(`/checkPassword?Password=${encodeURIComponent(pass)}`);
    const PassData = await checkPassword.json();
    if (data.exists && !PassData.exists) {
        document.querySelector("#errorUser").innerHTML = "Please check password";
        document.querySelector("#errorUser").style.color = "red";
        error = true;
    }else{
       document.querySelector("#errorUser").innerHTML = "";
    }
    }
  
  //validation for password

  if (!pass) {
    document.querySelector("#errorPassword").innerHTML = "Please enter a password"
    document.querySelector("#errorPassword").style.color = "red"
    error = true;
   }else{
    document.querySelector("#errorPassword").innerHTML = "";
  }

    if (error) {
      event.preventDefault()
    }else{
      event.target.submit();
    }
    error = false;
}
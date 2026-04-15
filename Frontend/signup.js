const form = document.getElementById("form");
const name_input = document.getElementById("name-input");
const email_input = document.getElementById("Email-input");
const password_input = document.getElementById("password_input");
const repeat_password_input = document.getElementById("repeat_password_input");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", (e) => {
  let errors = [];
  if (name_input) {
    // if we have a name_input then we are in the signup
    errors = getSignupFormErrors(
      name_input.value,
      email_input.value,
      password_input.value,
      repeat_password_input.value
    );
  } else {
    // if we don't have the name_input then we are in the login page
    errors = getLoginFormErrors(email_input.value, password_input.value);
  }

  if (errors.length > 0) {
    // if there are any errors
    e.preventDefault();
    error_message.innerText = errors.join(". ");
  }
});

function getSignupFormErrors(name, email, password, repeatPassword) {
  let errors = [];
  if (name == "" || name == null) {
    errors.push("Name is required");
    name_input.parentElement.classList.add("incorrect");
  }
  if (email == "" || email == null) {
    errors.push("Email is required");
    email_input.parentElement.classList.add("incorrect");
  }
  if (password == "" || password == null) {
    errors.push("password is required");
    password_input_input.parentElement.classList.add("incorrect");
  }
  if (password.length < 8) {
    errors.push("Password must have at least 8 characters");
    password_input.parentElement.classList.add("incorrect");
  }
  if (password !== repeatPassword) {
    errors.push("Password does not match repeated password.");
    password_input.parentElement.classList.add("incorrect");
    repeat_password_input.parentElement.classList.add("incorrect");
  }

  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];
  if (email == "" || email == null) {
    errors.push("Email is required");
    email_input.parentElement.classList.add("incorrect");
  }
  if (password == "" || password == null) {
    errors.push("password is required");
    password_input_input.parentElement.classList.add("incorrect");
  }

  return errors;
}

const allInputs = [
  name_input,
  email_input,
  password_input,
  repeat_password_input,
].filter((input) => input != null);

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      error_message.innerText = "";
    }
  });
});

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const repeatPassword = document.getElementById("repeatPassword").value;

  const res = await fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, repeatPassword }),
  });
  const data = await res.json();
  alert(data.message);
});

// app.js
// Import and execute all logic in a single module for clarity and maintainability

const form = document.getElementById('signupForm');

// Cache references for inputs
const fields = {
  fullName: document.getElementById('fullName'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  confirmPassword: document.getElementById('confirmPassword'),
  phone: document.getElementById('phone'),
  dob: document.getElementById('dob'),
  terms: document.getElementById('terms')
};

// Regex patterns
const patterns = {
  fullName: /^[A-Za-zÀ-ÿ'-]{2,}( [A-Za-zÀ-ÿ'-]+)*$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
  phone: /^\+?[0-9]{7,15}$/
};

// Debounce utility
const debounce = (fn, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// Validation functions
const validators = {
  fullName(value) {
    if (!value.trim()) return "Full Name is required.";
    if (!patterns.fullName.test(value.trim()))
      return "Full Name must be at least 2 letters and contain only letters, hyphens, or apostrophes.";
    return "";
  },
  email(value) {
    if (!value.trim()) return "Email is required.";
    if (!patterns.email.test(value.trim()))
      return "Please enter a valid email address.";
    return "";
  },
  password(value) {
    if (!value.trim()) return "Password is required.";
    if (!patterns.password.test(value))
      return "Password must be at least 8 characters, including uppercase, lowercase, number, and special character.";
    return "";
  },
  confirmPassword(value) {
    if (!value.trim()) return "Confirm Password is required.";
    if (value !== fields.password.value)
      return "Passwords do not match.";
    return "";
  },
  phone(value) {
    if (!value.trim()) return "Phone number is required.";
    if (!patterns.phone.test(value.trim()))
      return "Please enter a valid phone number with optional country code.";
    return "";
  },
  dob(value) {
    if (!value) return "Date of birth is required.";
    const userDate = new Date(value);
    const age = getAge(userDate);
    if (age < 13)
      return "You must be at least 13 years old.";
    return "";
  },
  terms(checked) {
    return checked ? "" : "You must agree to the Terms and Conditions.";
  }
};

function getAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function showError(field, message) {
  const formGroup = field.closest(".form-group");
  formGroup.classList.remove("success");
  formGroup.classList.add("error");
  const help = formGroup.querySelector("small");
  help.textContent = message;
}

function showSuccess(field, message) {
  const formGroup = field.closest(".form-group");
  formGroup.classList.remove("error");
  formGroup.classList.add("success");
  const help = formGroup.querySelector("small");
  help.textContent = message || "Looks good!";
}

function clearStatus(field) {
  const formGroup = field.closest(".form-group");
  formGroup.classList.remove("error", "success");
  const help = formGroup.querySelector("small");
  help.textContent = "";
}

function validateField(name, value) {
  const error = validators[name](value);
  const field = fields[name];
  if (error) {
    showError(field, error);
    return false;
  } else {
    showSuccess(field);
    return true;
  }
}

// Add listeners for all fields
Object.keys(fields).forEach((name) => {
  const field = fields[name];

  const handler = debounce(() => {
    if (name === "terms") {
      validateField(name, field.checked);
    } else {
      validateField(name, field.value);
    }
    saveProgress();
  }, 300);

  if (name === "terms") {
    field.addEventListener("change", handler);
  } else {
    field.addEventListener("input", handler);
    field.addEventListener("blur", handler);
  }
});

// Save to localStorage
function saveProgress() {
  const data = {
    fullName: fields.fullName.value,
    email: fields.email.value,
    password: fields.password.value,
    confirmPassword: fields.confirmPassword.value,
    phone: fields.phone.value,
    dob: fields.dob.value,
    terms: fields.terms.checked
  };
  localStorage.setItem("signupForm", JSON.stringify(data));
}

// Restore progress on page load
document.addEventListener("DOMContentLoaded", () => {
  const saved = JSON.parse(localStorage.getItem("signupForm"));
  if (saved) {
    Object.keys(saved).forEach((key) => {
      if (key === "terms") {
        fields[key].checked = saved[key];
      } else {
        fields[key].value = saved[key];
      }
      validateField(key, saved[key]);
    });
  }
});

// Handle form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let isValid = true;
  Object.keys(fields).forEach((name) => {
    const value =
      name === "terms" ? fields[name].checked : fields[name].value;
    if (!validateField(name, value)) {
      isValid = false;
    }
  });

  if (isValid) {
    alert("Form successfully submitted!");
    localStorage.removeItem("signupForm");
    form.reset();
    Object.values(fields).forEach((field) => clearStatus(field));
  } else {
    alert("Please fix errors before submitting.");
  }
});

const themeToggle = document.getElementById("themeToggle");

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙";
  }

  const saved = JSON.parse(localStorage.getItem("signupForm"));
  if (saved) {
    Object.keys(saved).forEach((key) => {
      if (key === "terms") {
        fields[key].checked = saved[key];
      } else {
        fields[key].value = saved[key];
      }
      validateField(key, saved[key]);
    });
  }
});

themeToggle.addEventListener("click", () => {
  themeToggle.classList.add("rotating");
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️" : "🌙";

  setTimeout(() => {
    themeToggle.classList.remove("rotating");
  }, 500);
});

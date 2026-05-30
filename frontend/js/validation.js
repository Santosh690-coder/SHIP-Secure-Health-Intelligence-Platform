// validation.js
const SHIPValidation = (() => {
  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
  }

  function isPhone(value) {
    return /^[0-9+\-\s()]{7,20}$/.test(String(value || "").trim());
  }

  function isMinLength(value, min = 6) {
    return String(value || "").trim().length >= min;
  }

  function passwordsMatch(password, confirmPassword) {
    return String(password || "") === String(confirmPassword || "");
  }

  function required(value) {
    return String(value || "").trim().length > 0;
  }

  function validateLogin(form) {
    const role = form.querySelector('[name="role"]')?.value;
    const email = form.querySelector('[name="email"]')?.value;
    const password = form.querySelector('[name="password"]')?.value;

    if (!required(role)) return { valid: false, message: "Please select a role." };
    if (!isEmail(email)) return { valid: false, message: "Please enter a valid email." };
    if (!required(password)) return { valid: false, message: "Please enter your password." };

    return { valid: true, message: "" };
  }

  function validateRegister(form) {
    const role = form.querySelector('[name="role"]')?.value;
    const fullName = form.querySelector('[name="fullName"]')?.value;
    const email = form.querySelector('[name="email"]')?.value;
    const phone = form.querySelector('[name="phone"]')?.value;
    const password = form.querySelector('[name="password"]')?.value;
    const confirmPassword = form.querySelector('[name="confirmPassword"]')?.value;
    const agree = form.querySelector('[name="agree"]')?.checked;

    if (!required(role)) return { valid: false, message: "Please select a role." };
    if (!required(fullName)) return { valid: false, message: "Please enter your name." };
    if (!isEmail(email)) return { valid: false, message: "Please enter a valid email." };
    if (!isPhone(phone)) return { valid: false, message: "Please enter a valid phone number." };
    if (!isMinLength(password, 6)) return { valid: false, message: "Password must be at least 6 characters." };
    if (!passwordsMatch(password, confirmPassword)) return { valid: false, message: "Passwords do not match." };
    if (!agree) return { valid: false, message: "You must accept the terms." };

    return { valid: true, message: "" };
  }

  return {
    isEmail,
    isPhone,
    isMinLength,
    passwordsMatch,
    required,
    validateLogin,
    validateRegister
  };
})();
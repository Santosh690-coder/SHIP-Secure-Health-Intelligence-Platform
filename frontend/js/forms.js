// forms.js
const SHIPForms = (() => {
  function setFieldState(field, valid, message = "") {
    if (!field) return;

    const group = field.closest(".field-group");
    let error = group ? group.querySelector(".error-message") : null;

    if (group && !error) {
      error = document.createElement("small");
      error.className = "error-message";
      group.appendChild(error);
    }

    field.setAttribute("aria-invalid", valid ? "false" : "true");

    if (valid) {
      field.classList.remove("is-invalid");
      field.classList.add("is-valid");
      if (error) error.textContent = "";
    } else {
      field.classList.add("is-invalid");
      field.classList.remove("is-valid");
      if (error) error.textContent = message;
    }
  }

  function clearFieldState(field) {
    if (!field) return;
    const group = field.closest(".field-group");
    const error = group ? group.querySelector(".error-message") : null;
    field.removeAttribute("aria-invalid");
    field.classList.remove("is-invalid", "is-valid");
    if (error) error.textContent = "";
  }

  function bindLiveValidation(form, validator) {
    if (!form || !validator) return;

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => clearFieldState(field));
      field.addEventListener("blur", () => {
        const value = field.type === "checkbox" ? field.checked : field.value;
        const valid = String(value).trim().length > 0;
        if (field.hasAttribute("required")) {
          setFieldState(field, valid, "This field is required.");
        }
      });
    });
  }

  function submitWithValidation(form, validateFn, onSuccess) {
    if (!form || typeof validateFn !== "function" || typeof onSuccess !== "function") return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const result = validateFn(form);
      if (!result.valid) {
        SHIPNotify.error(result.message || "Please fix the form errors.");
        return;
      }

      onSuccess();
    });
  }

  return {
    setFieldState,
    clearFieldState,
    bindLiveValidation,
    submitWithValidation
  };
})();
import React from "react";

// Input with a leading icon. All other props go straight to the <input>,
// so callers pass type, name, value, onChange, autoComplete, aria-label, etc.
const AuthField = ({ icon, ...inputProps }) => (
  <div className="input-group">
    <span className="input-icon">
      <img src={icon} alt="" />
    </span>
    <input className="form-input" {...inputProps} />
  </div>
);

export default AuthField;

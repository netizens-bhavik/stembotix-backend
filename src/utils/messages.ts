const messages = {
  ROLE_NOT_FOUND: "Role not found!",
  ROLE_CREATE_SUCCESS: "Role created successfully!!",
  ROLE_DELETE_SUCCESS: "Role deleted successfully!!",
  ROLE_UPDATE_SUCCESS: "Role updated successfully!!",
  USER_NOT_FOUND: "User not found!",
  INVALID_INPUT: "Invalid input!",
  USER_CREATE_SUCCESS: "User created successfully!!",
  USER_DELETE_SUCCESS: "User deleted successfully!!",
  USER_UPDATE_SUCCESS: "Profile updated successfully!",
  USER_EMAIL_EXISTS: "E-mail address already exists!",
  USER_PRIMARY_INFO_UPDATE_SUCCESS: "User primary detail updated successfully!",
  USER_CONTACT_INFO_UPDATE_SUCCESS: "User contact detail updated successfully!",
  INACTIVE_USER: "User is in-active!",
  EMAIL_NOT_VERIFIED: "Email is not verified!",
  USER_PASSWORD_UPDATED: "Password updated successfully!",
  USER_VERIFY_SUCCESS: "User verified successfully!",
  USER_ACTIVATED_SUCCESS: "User activated successfully!",
  USER_DEACTIVATED_SUCCESS: "User de-activated successfully!",
  INVALID_DATA: "Please provide data!",
  USER_PROFILE_UPDATE_SUCCESS: "User profile uploaded successfully!",
  UNAUTHORIZED: "Expire Token!",
};

const getMessage = (key) => {
  if (messages[key]) {
    return messages[key];
  }
  return "Message Key not Found!!";
};

module.exports = { getMessage };

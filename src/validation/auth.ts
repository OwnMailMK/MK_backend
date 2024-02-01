const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((gunhie.com))$/;
  return re.test(String(email).toLowerCase());
};
const validatePassword = (password: string) => password.length >= 4;
export { validateEmail, validatePassword };

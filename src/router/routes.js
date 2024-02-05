export const PATH_AFTER_LOGIN = "/";

const paths = {
  root: "/",
  auth: {
    login: "/login",
  },

  channel: (id) => `/channel/${id}`,
  dm: (id) => `/dm/${id}`,
};

export default paths;

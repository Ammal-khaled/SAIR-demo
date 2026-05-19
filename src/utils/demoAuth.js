export const DEMO_USER_KEY = "sair-demo-user";

export const demoUser = {
  email: "demo@sair.local",
  role: "admin",
  mode: "demo",
};

export const getDemoUser = () => {
  try {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(DEMO_USER_KEY);
    return null;
  }
};

export const isDemoMode = () => Boolean(getDemoUser()?.mode === "demo");

export const enterDemoMode = () => {
  localStorage.removeItem("token");
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
  localStorage.setItem("user", JSON.stringify(demoUser));
  return demoUser;
};

export const clearAuthState = () => {
  localStorage.removeItem(DEMO_USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

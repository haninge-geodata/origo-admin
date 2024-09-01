import { create } from "zustand";

interface EnvState {
  envVars: Record<string, string | undefined>;
  setEnvVar: (name: string, value: string) => void;
}

const useEnvStore = create<EnvState>((set) => ({
  envVars: {},
  setEnvVar: (name, value) => set((state) => ({ envVars: { ...state.envVars, [name]: value } })),
}));

const envStore = async (name: string): Promise<string> => {
  const store = useEnvStore.getState();

  if (store.envVars[name] !== undefined) {
    return Promise.resolve(store.envVars[name] as string);
  } else {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

    let apiPath = `/api/config?name=${name}`;
    if (basePath) {
      apiPath = `${basePath}${apiPath}`;
    }

    const response = await fetch(apiPath, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const value = await response.text();
    useEnvStore.getState().setEnvVar(name, value);
    return value;
  }
};

export default envStore;

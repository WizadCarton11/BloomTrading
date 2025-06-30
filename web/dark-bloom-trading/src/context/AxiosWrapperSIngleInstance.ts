// axiosSingleton.ts
import axios, { AxiosInstance } from 'axios';
import * as AW from './AxiosWrapper';
let axiosWrapperInstance: AW.default | null = null;

export const getAxiosInstance = (baseURL: string = ''): AW.default => {
  if (!axiosWrapperInstance) {
    axiosWrapperInstance = new AW.default(baseURL);
  }
  return axiosWrapperInstance;
};

// export const authClient= ()

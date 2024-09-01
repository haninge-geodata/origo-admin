import { GetWMSCapabilitiesResponse } from "@/interfaces";
import { GetWFSCapabilitiesResponse } from "@/interfaces";
import { GetWMTSCapabilitiesResponse } from "@/interfaces/getWMTSCapabilitiesResponse";
import { getWfsData, getWmsData, getWmtsData } from "@/services";

const wmwsQuery = "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities";
const wfsQuery = "?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities";
const wmtsQuery = "?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities";

export const useWMSCapabilities = () => {
  const loadCapabilities = async (url: string): Promise<GetWMSCapabilitiesResponse> => {
    const modifiedUrl = modifyUrlQuery(url, wmwsQuery);
    const response = await getWmsData(modifiedUrl);
    return response;
  };
  return { loadCapabilities };
};

export const useWFSCapabilities = () => {
  const loadCapabilities = async (url: string): Promise<GetWFSCapabilitiesResponse> => {
    const modifiedUrl = modifyUrlQuery(url, wfsQuery);
    const response = await getWfsData(modifiedUrl);
    return response;
  };
  return { loadCapabilities };
};

export const useWMTSCapabilities = () => {
  const loadCapabilities = async (url: string): Promise<GetWMTSCapabilitiesResponse> => {
    const modifiedUrl = modifyUrlQuery(url, wmtsQuery);
    const response = await getWmtsData(modifiedUrl);
    return response;
  };
  return { loadCapabilities };
};

const modifyUrlQuery = (url: string, newQuery: string): string => {
  const urlParts = url.split("?");
  return `${urlParts[0]}${newQuery}`;
};

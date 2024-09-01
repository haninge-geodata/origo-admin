import { GetWFSCapabilitiesResponse } from "@/interfaces";
import { getDescribeFeatureTypes } from "@/services";

const wfsQuery = "?SERVICE=WFS&REQUEST=DescribeFeatureType&typeNames";

export const useWFSDescribeFeatureTypes = () => {
  const loadCapabilities = async (url: string): Promise<Record<string, [string, string][]>> => {
    const modifiedUrl = modifyUrlQuery(url, wfsQuery);
    const response = await getDescribeFeatureTypes(modifiedUrl);
    return response;
  };
  return { loadCapabilities };
};

const modifyUrlQuery = (url: string, newQuery: string): string => {
  const urlParts = url.split("?");
  return `${urlParts[0]}${newQuery}`;
};

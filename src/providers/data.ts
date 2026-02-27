import { BACKEND_BASE_URL } from "@/constants"
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";
import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest"

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = 'Request failed.';

  try {
    const payload = (await response.json()) as {error: string};
    if(payload?.error) message = payload.error;
  } catch {
    // Ignore errors
  }

  return {
    message, 
    statusCode: response.status,
  }

}

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({resource, meta}) => meta?.path ?? resource,
    buildQueryParams: async ({resource, pagination, filters}) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = {page, limit: pageSize};

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';
        const value = String(filter.value);
        if(resource === "terms"){
          if(field === "termName") params.search = value;
        }
        if(resource === "departments"){
          if(field === "name") params.search = value;
        }
        if(resource === "teachers"){
          if(field === "search") params.search = value
        }
        if(resource === "courses"){
          if(field === "departmentId") params.departmentId = value;
        }
      
      })

      return params;
    },
    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  },
  create: {
    getEndpoint : ({resource, meta}) => meta?.path ?? resource, 
    buildBodyParams: async ({variables}) => variables,
    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.json();
      return json.data ?? {};
    }
  },
  getOne: {
    getEndpoint : ({resource, meta, id}) => meta?.path ? `${meta?.path}/${id}` : `${resource}/${id}`, 
    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    }
  },
  update: {
    getEndpoint: ({resource, meta, id}) => meta?.path ? `${meta?.path}/${id}` : `${resource}/${id}`, 
    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    }
  }
}

const {dataProvider} = createDataProvider(BACKEND_BASE_URL, options, {
  credentials: "include"
});
export {dataProvider};
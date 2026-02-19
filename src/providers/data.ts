import { BACKEND_BASE_URL } from "@/constants"
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest"

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
          if(field === "termName") params.search = value
        }
      })

      return params;
    },
    mapResponse: async (response) => {
      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  },
  create: {
    getEndpoint : ({resource, meta}) => meta?.path ?? resource, 
    buildBodyParams: async ({variables}) => variables,
    mapResponse: async (response) => {
      const json: CreateResponse = await response.json();
      return json.data ?? {};
    }
  },
  getOne: {
    getEndpoint : ({resource, meta, id}) => meta?.path ? `${meta?.path}/${id}` : `${resource}/${id}`, 
    mapResponse: async (response) => {
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    }
  },
  update: {
    getEndpoint: ({resource, meta, id}) => meta?.path ? `${meta?.path}/${id}` : `${resource}/${id}`, 
    mapResponse: async (response) => {
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    }
  }
}

const {dataProvider} = createDataProvider(BACKEND_BASE_URL, options, {
  credentials: "include"
});
export {dataProvider};
// import { fetchUtils } from 'react-admin';
// import { stringify } from 'query-string';

// const apiUrl = 'http://localhost:5000/api/admin';
// const httpClient = fetchUtils.fetchJson;

// export const dataProvider = {
//   getList: (resource, params) => {
//     const { page, perPage } = params.pagination;
//     const { field, order } = params.sort;
//     const query = {
//       page,
//       perPage,
//       sort: field,
//       order,
//       filter: JSON.stringify(params.filter),
//     };
//     const url = `${apiUrl}/${resource}?${stringify(query)}`;
    
//     console.log('📡 [getList] Fetching:', url);
    
//     return httpClient(url)
//       .then(({ json }) => {
//         console.log('✅ [getList] Response from backend:', json);
//         return json;
//       })
//       .catch((error) => {
//         console.error('❌ [getList] Error:', error);
//         throw error;
//       });
//   },

//   // You can add similar logs for getOne, create, etc.
// };

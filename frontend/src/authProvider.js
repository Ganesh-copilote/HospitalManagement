// export const authProvider = {
//   login: async ({ username, password }) => {
//     const response = await fetch('http://localhost:5000/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ identifier: username, password }),
//       credentials: 'include',
//     });
//     if (response.status < 200 || response.status >= 300) {
//       throw new Error('Login failed');
//     }
//     const data = await response.json();
//     if (data.success) {
//       localStorage.setItem('auth', data.user_type); // Set based on response
//     } else {
//       throw new Error('Login failed or unauthorized');
//     }
//     return Promise.resolve();
//   },
//   logout: () => {
//     localStorage.removeItem('auth');
//     return fetch('http://localhost:5000/logout', { credentials: 'include' }).then(() => Promise.resolve());
//   },
//   checkError: (error) => {
//     if (error.status === 401 || error.status === 403) {
//       localStorage.removeItem('auth');
//       return Promise.reject();
//     }
//     return Promise.resolve();
//   },
//   checkAuth: () => localStorage.getItem('auth') ? Promise.resolve() : Promise.reject(),
//   getPermissions: () => Promise.resolve(),
// };
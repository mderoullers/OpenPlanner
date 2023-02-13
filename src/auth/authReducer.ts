import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface UserState {
    email: string
    displayName: string
}

interface AuthState {
    user: null | UserState
    isLoggedIn: boolean
}

const user: UserState | null = JSON.parse(localStorage.getItem('user') || '')

const initialState: AuthState = user ? { isLoggedIn: true, user } : ({ isLoggedIn: false, user: null } as AuthState)

// export const register = createAsyncThunk(
//     "auth/register",
//     async ({ username, email, password }, thunkAPI) => {
//         try {
//             const response = await AuthService.register(username, email, password);
//             thunkAPI.dispatch(setMessage(response.data.message));
//             return response.data;
//         } catch (error) {
//             const message =
//                 (error.response &&
//                     error.response.data &&
//                     error.response.data.message) ||
//                 error.message ||
//                 error.toString();
//             thunkAPI.dispatch(setMessage(message));
//             return thunkAPI.rejectWithValue();
//         }
//     }
// );

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }) => {
        return Promise.resolve({
            displayName: 'Hugo',
            email: email,
        })
    }
)

export const logout = createAsyncThunk('auth/logout', async () => {
    // await AuthService.logout();
    return Promise.resolve()
})

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // [register.fulfilled]: (state, action) => {
        //     state.isLoggedIn = false;
        // },
        // [register.rejected]: (state, action) => {
        //     state.isLoggedIn = false;
        // },

        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = true
                state.user = action.payload
            })
            .addCase(login.rejected, (state) => {
                state.isLoggedIn = false
                state.user = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoggedIn = false
                state.user = null
            })
    },
})

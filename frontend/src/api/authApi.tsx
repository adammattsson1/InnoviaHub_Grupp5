import type { ApiResult } from "../types/ApiResult.ts";

// REGISTER
export const registerUser = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string
): Promise<ApiResult<null>> => {
    try {
        const res = await fetch(
            `http://localhost:5296/api/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    password,
                    confirmPassword,
                }),
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            return {
                success: false,
                message: `Registration failed: ${errorText}`,
            };
        }

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message:
                "Could not reach the server. Check your internet connection.",
        };
    }
};

// LOGIN
export const loginUser = async (
    email: string,
    password: string
): Promise<ApiResult<{ token: string; user: any }>> => {
    try {
        const res = await fetch(
            `http://localhost:5296/api/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            return {
                success: false,
                message: `Login failed: ${errorText}`,
            };
        }

        const data = await res.json();

        return { success: true, data: { token: data.token, user: data.user } };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message:
                "Could not reach the server. Check your internet connection.",
        };
    }
};

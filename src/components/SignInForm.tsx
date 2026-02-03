"use client";
import { useLogin } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const signInSchema = z.object({
    email: z.string().email("Invalid email address"), 
    password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInForm = () => {
    const {mutate: login, isPending: isLoggingIn} = useLogin();

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "", 
            password: "",
        }
    })

    const handleSignIn = (values: SignInFormValues) => {
        login({
            email: values.email, 
            password: values.password,
        })
    }
    return (
        <div>
            
        </div>
    )
}

export default SignInForm

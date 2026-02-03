"use client";
import { useLink, useLogin } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { InputPassword } from "./refine-ui/form/input-password";
import { Button } from "./ui/button";
import { CircleHelp } from "lucide-react";

const signInSchema = z.object({
    email: z.string().email("Invalid email address"), 
    password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInForm = () => {
    const Link = useLink();
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
        <div className="sign-in">
            <Card className="card">
                <CardHeader className="header">
                    <CardTitle className="title">Sign In</CardTitle>
                </CardHeader>

                <CardContent className="content">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSignIn)} className="form">
                            <FormField 
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem className="field">
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                id="email"
                                                type="email"
                                                placeholder=""
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField 
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem className="field">
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                        <FormControl>
                                            <InputPassword
                                                id="password"
                                                placeholder=""
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" size="lg" className="submit" disabled={isLoggingIn}>
                                {isLoggingIn ? "Signing in..." : "Sign in"}
                            </Button>

                            <Link to="/forgot-password" className="w-full flex flex-row space-x-3">
                                <span>Forgot password</span>
                                <CircleHelp />
                            </Link>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default SignInForm

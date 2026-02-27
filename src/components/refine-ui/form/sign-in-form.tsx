"use client";

import { CircleHelp } from "lucide-react";

import { InputPassword } from "@/components/refine-ui/form/input-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLink, useLogin, useRefineOptions } from "@refinedev/core";

import * as z from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
    email: z.string().email("Invalid email address"), 
    password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;


export const SignInForm = () => {
  const Link = useLink();

  const { title } = useRefineOptions();

  const { mutate: login, isPending: isSubmitting } = useLogin();


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
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-6",
        "py-8",
        "min-h-svh"
      )}
    >
     <div className={cn("flex", "flex-col", "items-center", "gap-2")}>
        <div className={cn("flex", "items-center", "gap-3")}>
          {title.icon && (
            <div className={cn("text-foreground", "[&>svg]:h-10", "[&>svg]:w-10")}>
              {title.icon}
            </div>
          )}

          <h1 className={cn("text-3xl", "font-bold", "tracking-tight")}>
            {title.text}
          </h1>
        </div>

        
      </div>

      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn(
              "text-3xl",
              "font-semibold"
            )}
          >
            Sign in
          </CardTitle>
          <CardDescription
            className={cn("text-muted-foreground", "font-medium")}
          >
            Welcome back
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className={cn("px-0")}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)}>
            <div className={cn("flex", "flex-col", "gap-2")}>
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
            </div>

            <div
              className={cn("relative", "flex", "flex-col", "gap-2", "mt-6")}
            >
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
            </div>

            <div
              className={cn(
                "flex items-center justify-between",
                "flex-wrap",
                "gap-2",
                "mt-4"
              )}
            >
              <Link
                to="/forgot-password"
                className={cn(
                  "text-sm",
                  "flex",
                  "items-center",
                  "gap-2",
                  "text-primary hover:underline",
                  "text-blue-600",
                  "dark:text-blue-400"
                )}
              >
                <span>Forgot password</span>
                <CircleHelp className={cn("w-4", "h-4")} />
              </Link>
            </div>

            <Button type="submit" size="lg" className={cn("w-full", "mt-6")} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

SignInForm.displayName = "SignInForm";

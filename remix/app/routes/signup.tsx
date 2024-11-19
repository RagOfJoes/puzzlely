import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { cn } from "@/lib/cn";
import { API } from "@/services/api.server";

export async function loader({ request }: LoaderFunctionArgs) {
	// Check if user is already authenticated
	const me = await API.me(request);
	if (me.success && me.payload && me.payload.user) {
		return redirect("/profile");
	}

	return json({});
}

export default function SignUp() {
	return (
		<>
			<Header />

			<main className="mx-auto h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col items-center justify-center">
					<div className="flex w-full flex-col items-start gap-1">
						<h2 className="font-heading text-xl font-bold leading-none">Welcome to Puzzlely!</h2>
						<p className="font-medium leading-none text-muted-foreground">
							Sign up now by selecting one of the options below.
						</p>
					</div>

					<div className="mt-6 flex w-full flex-col items-start gap-4">
						{[
							{
								title: "Discord",
								icon: (
									<svg
										className="h-4 w-4 fill-foreground"
										role="img"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>Discord</title>
										<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
									</svg>
								),
								path: "/auth/discord",
							},
							{
								title: "GitHub",
								icon: (
									<svg
										className="h-4 w-4 fill-foreground"
										role="img"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>GitHub</title>
										<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
									</svg>
								),
								path: "/auth/github",
							},
							{
								title: "Google",
								icon: (
									<svg
										className="h-4 w-4 fill-foreground"
										role="img"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>Google</title>
										<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
									</svg>
								),
								path: "/auth/google",
							},
						].map((p) => (
							<Form action={p.path} className="w-full" key={p.path} method="post">
								<Button className="w-full gap-2 text-lg font-bold" size="lg" variant="outline">
									{p.icon}

									<div>Sign up with {p.title}</div>
								</Button>
							</Form>
						))}

						<p className="mt-4 text-sm font-medium text-muted-foreground">
							Already have an account?{" "}
							<Link
								className={cn(
									"font-bold text-primary outline-none transition",

									"focus-visible:ring focus-visible:ring-ring",
									"hover:underline",
								)}
								to="/login/"
							>
								Log in
							</Link>
						</p>
					</div>
				</article>
			</main>
		</>
	);
}

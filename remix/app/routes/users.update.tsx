import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getValidatedFormData } from "remix-hook-form";

import { requireUser } from "@/lib/require-user";
import { UserUpdatePayloadSchema } from "@/schemas/user-update-payload";
import { API } from "@/services/api.server";
import { jsonWithError, jsonWithSuccess } from "@/services/toast.server";
import type { UserUpdatePayload } from "@/types/user-update-payload";

export async function action({ request }: ActionFunctionArgs) {
	await requireUser(request);

	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<UserUpdatePayload>(request, zodResolver(UserUpdatePayloadSchema));

	if (errors) {
		return json({ errors, defaultValues });
	}

	// const updated = await API.users.update(request, {} as UserUpdatePayload);
	const updated = await API.users.update(request, data);
	if (!updated.success) {
		return jsonWithError(
			{
				defaultValues,
				errors: {
					username: {
						message: updated.error.message,
					},
				},
			},
			{
				message: updated.error.message,
			},
		);
	}

	return jsonWithSuccess(
		{
			data: updated.data,
		},
		{
			message: "Successfully updated profile!",
		},
	);
}

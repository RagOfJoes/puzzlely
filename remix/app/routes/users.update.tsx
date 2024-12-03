import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { FieldErrors } from "react-hook-form";
import { getValidatedFormData } from "remix-hook-form";

import { requireUser } from "@/lib/require-user";
import { UserUpdatePayloadSchema } from "@/schemas/user-update-payload";
import { API } from "@/services/api.server";
import { jsonWithError, jsonWithSuccess, redirectWithSuccess } from "@/services/toast.server";
import type { UserUpdatePayload } from "@/types/user-update-payload";

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireUser(request);

	const {
		data,
		errors,
		receivedValues: defaultValues,
	} = await getValidatedFormData<UserUpdatePayload>(request, zodResolver(UserUpdatePayloadSchema));

	const response: {
		defaultValues?: Partial<UserUpdatePayload>;
		errors?: FieldErrors<UserUpdatePayload>;
	} = {
		defaultValues,
		errors,
	};
	if (errors) {
		return json(response);
	}

	const updated = await API.users.update(request, data);
	if (!updated.success) {
		response.errors = {
			username: {
				message: updated.error.message,
				type: "custom",
			},
		};

		return jsonWithError(response, {
			description: updated.error.message,
			message: "Failed to update profile!",
		});
	}

	// If the user hasn't completed their profile yet, then, it's safe to assume the request came from `/profile/complete`
	//
	// NOTE: Redirect to `/profile/created` to ensure the toast appears
	if (user.state === "PENDING" && !user.updated_at) {
		return redirectWithSuccess("/profile/created", {
			message: "Successfully completed profile!",
		});
	}

	return jsonWithSuccess(response, {
		message: "Successfully updated profile!",
	});
}

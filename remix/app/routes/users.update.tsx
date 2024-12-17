import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import type { ActionFunctionArgs } from "react-router";
import { getValidatedFormData } from "remix-hook-form";

import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { dataWithError, dataWithSuccess, redirectWithSuccess } from "@/services/toast.server";
import { UserUpdatePayloadSchema, type UserUpdatePayload } from "@/types/user-update-payload";

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
		return response;
	}

	const updated = await API.users.update(request, data);
	if (!updated.success) {
		response.errors = {
			username: {
				message: updated.error.message,
				type: "custom",
			},
		};

		return dataWithError(response, {
			description: updated.error.message,
			message: "Failed to update profile!",
		});
	}

	// If the user hasn't completed their profile yet, then, it's safe to assume the request came from `/profile/complete`
	//
	// NOTE: Redirect to `/profile/created` to ensure the toast appears
	if (user.state === "PENDING" && !user.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirectWithSuccess("/profile/created", {
			message: "Successfully completed profile!",
		});
	}

	return dataWithSuccess(response, {
		message: "Successfully updated profile!",
	});
}
